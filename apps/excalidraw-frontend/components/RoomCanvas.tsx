"use client"
import { useEffect, useState } from "react"
import { WS_URL } from "../config";
import { Canvas } from "./Canvas";


export default function RoomCanvas({ roomId }:{roomId:string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect( () => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYjExMzk3OS0xOTM5LTQ3M2QtYjM0MS01MTg1Y2UyZDQzMDIiLCJpYXQiOjE3NzU3NTQwNDZ9.hB-hclyK-2wDVQRObqixxTYMzkByYcwNedBf5XrUcgE`)

        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
    }, [])

    if(!socket){
        return <div>
            Connectiong to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket = {socket} />
    </div>
}