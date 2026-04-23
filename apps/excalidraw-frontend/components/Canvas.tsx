"use client"
import { initDraw } from "@/lib/canvasEngine";
import { useEffect, useRef } from "react";


export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket },) {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (!canvasRef.current) {
            return
        }

        const cleanUp = initDraw(canvasRef.current, roomId, socket)

        return cleanUp;
        
    }, [roomId, socket])

    return <div>
        <canvas ref={canvasRef} width={2000} height={1000} ></canvas>
    </div>
}