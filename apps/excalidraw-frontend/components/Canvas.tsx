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

    return <div className="overflow-hidden">
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
    </div>
}