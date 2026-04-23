import { BACKEND_URL } from "@/config"
import axios from "axios"
import { Sheet } from "lucide-react"

type Shape = {
    id: string,
    type: "rect",
    x: number
    y: number
    width: number
    height: number
} | {
    id: string,
    type: "circle",
    centerX: number
    centerY: number
    radius: number
}

type Operation = { type: "ADD", shape: Shape } | { type: "DELETE", shapeId: string }

const clientId = Math.random().toString()

export function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d")

    let existingShapes: Shape[] = []
    let undoStack: Operation[] = []
    let selectedTool: "rect" | "circle" = "rect"

    if (!ctx) {
        return
    }

    let clicked = false
    let startX = 0
    let startY = 0

    const applyOperation = (op: Operation) => {
        if (op.type === "ADD") {
            existingShapes.push(op.shape)
        }

        if (op.type === "DELETE") {
            existingShapes = existingShapes.filter(x => x.id !== op.shapeId)
        }
        redraw()
    }

    // Whenever the user press ctrl+z this function get hits and it will take the last shape id from the stack put in op. with that op it will call the applyoperation and then applyoperation will do their job
    // After that it will be send by the wesocket to other users
    const undo = () => {
        const op = undoStack.pop();

        if (!op) return;

        applyOperation(op);

        socket.send(JSON.stringify({
            type: "operation",
            op,
            roomId,
            clientId
        }))
    }

    const getCanvasCoords = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    const redraw = () => {
        clearCanvas(canvas, existingShapes, ctx)
    }

    let isAlive = true;

    getExistingShapes(roomId).then((shapes) => {
        if (!isAlive) return;
        existingShapes = shapes
        redraw();
    })

    // Improved the way of handling messages because onmessage not support cleanup but addEventlistner supports cleanup

    // Receive the messages from server that something coming, if that was shape
    const handleSocketMessage = (event: MessageEvent) => {
        const res = JSON.parse(event.data)

        if (res.type === "operation") {
            // Self drawn shape will be ignored
            if (res.clientId === clientId) return;
            applyOperation(res.op)
        }
    }

    socket.addEventListener("message", handleSocketMessage)

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true
        const pos = getCanvasCoords(e)
        startX = pos.x
        startY = pos.y
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!clicked) return

        const pos = getCanvasCoords(e)
        const width = pos.x - startX
        const height = pos.y - startY

        clearCanvas(canvas, existingShapes, ctx)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2

        if (selectedTool === "rect") {
            ctx.strokeRect(startX, startY, width, height)
        }

        if (selectedTool === "circle") {
            const radius = Math.sqrt(
                Math.pow(pos.x - startX, 2) +
                Math.pow(pos.y - startY, 2)
            )

            ctx.beginPath()
            ctx.arc(startX, startY, radius, 0, Math.PI * 2)
            ctx.stroke()
        }
    }

    // Draws the Shape locally and send that shape to the server for other users
    const handleMouseUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false

        const pos = getCanvasCoords(e)
        const width = pos.x - startX
        const height = pos.y - startY

        let shape: Shape | null = null
        if (selectedTool === "rect") {
            shape = {
                id: crypto.randomUUID(),
                type: "rect",
                x: startX,
                y: startY,
                width,
                height
            }
        } else if (selectedTool === "circle") {
            const radius = Math.sqrt(
                Math.pow(pos.x - startX, 2) +
                Math.pow(pos.y - startY, 2)
            )
            shape = {
                id: crypto.randomUUID(),
                type: "circle",
                centerX: startX,
                centerY: startY,
                radius
            }
        }
        if (!shape) return
        const op: Operation = {
            type: "ADD",
            shape
        }
        applyOperation(op)
        // While we are creating and adding the shape at the same time we will have a record of undoStack in which the shapeId's of all the shapes will we stored

        undoStack.push({
            type: "DELETE",
            shapeId: shape.id
        })
        console.log("SENDING:", { shape, roomId, clientId })
        socket.send(JSON.stringify({
            type: "operation",
            op,
            roomId,
            clientId
        }),
        )
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "z") {
            undo()
        }
        if (e.key === 'r' || e.key === 'R') selectedTool = "rect"
        if (e.key === 'c' || e.key === 'C') selectedTool = "circle"
    }

    window.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
        isAlive = false;

        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)

        socket.removeEventListener("message", handleSocketMessage)
        window.removeEventListener("keydown", handleKeyDown)
    }


}

function clearCanvas(
    canvas: HTMLCanvasElement,
    existingShapes: Shape[],
    ctx: CanvasRenderingContext2D
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(0, 0, 0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2

    existingShapes.forEach((shape) => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }

        if (shape.type === "circle") {
            ctx.beginPath()
            ctx.arc(
                shape.centerX,
                shape.centerY,
                shape.radius,
                0,
                Math.PI * 2
            )
            ctx.stroke()
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const messages = res.data.messages

    const shapes = messages.map((x: { message: string }) => {
        try {
            const messageData = JSON.parse(x.message)
            return messageData;
        }
        catch {
            return null
        }
    })
        .filter(Boolean)
    return shapes
}

// async function getExistingShapes(roomId: string) {
//   const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`)

//   const messages = res.data?.messages ?? []

//   const shapes = messages
//     .map((x: { message: string }) => {
//       try {
//         const parsed = JSON.parse(x.message)
//         if (!parsed?.type) return null
//         return parsed
//       } catch {
//         return null
//       }
//     })
//     .filter(Boolean)

//   return shapes
// }
