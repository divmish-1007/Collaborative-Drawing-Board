import { BACKEND_URL } from "@/config"
import axios from "axios"
import { get } from "http"
import { handler } from "next/dist/build/templates/app-page"

type Shape = {
    type: "rect",
    x: number
    y: number
    width: number
    height: number
} | {
    type: "circle",
    centerX: number
    centerY: number
    radius: number
}

export function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d")

    let existingShapes: Shape[] = []

    if (!ctx) {
        return
    }

    let clicked = false
    let startX = 0
    let startY = 0

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
        if(!isAlive) return;
        existingShapes = shapes
        redraw();
    })
    
    // Improved the way of handling messages because onmessage not support cleanup but addEventlistner supports cleanup

    const handleSocketMessage = (event: MessageEvent) => {
        const res = JSON.parse(event.data)

        if (res.type === "chat") {
            const parshedShap = JSON.parse(res.message)
            existingShapes.push(parshedShap.shape)
            redraw();
        }
    }

    socket.addEventListener("message", handleSocketMessage)

    redraw();

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true
        const pos = getCanvasCoords(e)
        startX = pos.x
        startY = pos.y
    }   

    const hanleMouseMove = (e: MouseEvent) => {
        if (!clicked) return

        const pos = getCanvasCoords(e)
        const width = pos.x - startX
        const height = pos.y - startY

        clearCanvas(canvas, existingShapes, ctx)
        ctx.strokeStyle = "rgba(255,255,255)"
        ctx.strokeRect(startX, startY, width, height)
    }
    
    const handleMouseUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false

        const pos = getCanvasCoords(e)
        const width = pos.x - startX
        const height = pos.y - startY

        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height
        }

        existingShapes.push(shape)

        socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }))
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", hanleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
        isAlive = false;

        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", hanleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)

        socket.removeEventListener("message", handleSocketMessage)
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

    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.fillStyle = "rgba(255, 255, 255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }

    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const messages = res.data.messages

    const shapes = messages.map((x: { message: string }) => {
        try {
            const messageData = JSON.parse(x.message)
            return messageData.shape;
        }
        catch {
            return null
        }
    })
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
