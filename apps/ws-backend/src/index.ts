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

        if (parsedData.type === "chat") {

            const roomId = parsedData.roomId;
            const msg = parsedData.message
            const clientId = parsedData.clientId
            // console.log(JSON.parse(msg))
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
                        type: "chat",
                        message: msg,
                        roomId,
                        clientId
                    }))
                }
            })
            
            await chatQueue.add("save-chat", {
                
                roomId,
                message: msg,
                userId
            })
        }
        //   We will receive the data something like this for Leaving a room
        //   {
        //     type: "chat",
        //     message: "Hi there"
        //     roomId: 1
        //   }

    });

});