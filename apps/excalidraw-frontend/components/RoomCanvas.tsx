"use client"
import { useEffect, useState } from "react"
import { WS_URL } from "../config";
import { Canvas } from "./Canvas";


export default function RoomCanvas({ roomId }:{roomId:string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found");
        return;
    }

    useEffect( () => {
        const ws = new WebSocket(`${WS_URL}?token=${token}`)

        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        };

        return () => {
            ws.close();
        };

    }, [roomId])

    if(!socket){
        return <div>
            Connectiong to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket = {socket} />
    </div>
}