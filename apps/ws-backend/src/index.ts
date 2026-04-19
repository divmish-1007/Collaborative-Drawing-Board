import { WebSocketServer, WebSocket } from "ws";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
const wss = new WebSocketServer({ port: 8080 })
import { chatQueue } from "./queue/chatQueue";

interface User {
    userId: string,
    ws: WebSocket,
    rooms: string[]
}

const users: User[] = []

function checkUser(token: string): string | null {

    try {
        const decoded = Jwt.verify(token, JWT_SECRET)

        if (typeof decoded === "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId
    } catch (e) {
        return null
    }
    return null
}

wss.on('connection', function connection(ws, request) {

    const url = request.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') || ""

    const userId = checkUser(token)
    if (!userId) {
        ws.close()
        return
    }

    users.push(
        {
            userId,
            rooms: [],
            ws
        }
    )

    ws.on('message', async function message(data) {

        const parsedData = JSON.parse(data as unknown as string)

        if (parsedData.type === "join_room") {
            const user = users.find(x => x.ws === ws)
            user?.rooms.push(parsedData.roomId)
        }
        //   We will receive the data something like this for Joining a room
        //   {
        //     type: "join_room",
        //     roomId: 1
        //   }

        if (parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return
            }
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
        }
        //   We will receive the data something like this for Leaving a room
        //   {
        //     type: "leave_room",
        //     roomId: 1
        //   }

        if (parsedData.type === "operation") {

            const roomId = parsedData.roomId;
            const op = parsedData.op
            const clientId = parsedData.clientId
            const sender = users.find(x => x.ws === ws)
            if (!sender) {
                return
            }

            if (!sender.rooms.includes(roomId)) {
                return // The sender that wants to send the msg, he didn't join that room.
            }
            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "operation",
                        op,
                        roomId,
                        clientId
                    }))
                }
            })

            await chatQueue.add("save-chat", {

                roomId,
                message: JSON.stringify(op),
                userId
            })
        }
        //   We will receive the data something like this for Leaving a room
        // {
        //    type: 'operation',
        //    op: {
        //      type: 'ADD',
        //      shape: {
        //        id: 'a2fa84d7-89ed-46b1-8474-96821e2c8c65',
        //        type: 'rect',
        //        x: 697,
        //        y: 114,
        //        width: 169,
        //        height: 158
        //      }
        //    },
        //    roomId: '12',
        //    clientId: '0.19292202512479817'
        //  }


    });

});