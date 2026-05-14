"use client"
import { initDraw } from "@/lib/canvasEngine";
import { useEffect, useRef } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontal, RectangleHorizontalIcon } from "lucide-react";


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
        <Topbar />
    </div>
}

function Topbar(){
    return <div className="fixed top-10 left-10">
        {/* <IconButton icon={<Pencil/>} onClick={() => {}} ></IconButton>
        <IconButton icon={<RectangleHorizontalIcon/>} onClick={() => {}} ></IconButton>
        <IconButton icon={<Circle/>} onClick={() => {}} ></IconButton> */}
    </div>
}