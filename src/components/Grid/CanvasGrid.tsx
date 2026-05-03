import { useEffect, useRef } from 'react'
import { ws } from '../../lib/ws';
import { CELL_SIZE, GRID_SIZE } from '../../constants/GRID';
import { drawCell, drawGridLines } from '../../lib/draw';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';

const CanvasGrid = ({ userID }: { userID: string }  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) return
        const ctx = canvas.getContext("2d")
        if (ctx === null) return
        canvas.width = GRID_SIZE * CELL_SIZE
        canvas.height = GRID_SIZE * CELL_SIZE

        // Set background color and fill once
        ctx.fillStyle = "#111"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        

        drawGridLines(ctx, GRID_SIZE, CELL_SIZE)

        ws.onmessage = (e)=>{
            const msg = JSON.parse(e.data)
            console.log(msg)
            switch(msg.type) {
                case "INIT_STATE":
                    msg.payload.forEach((block: { id: string }) => {
                        const [x, y] = block.id.split(",").map(Number)
                        console.log(block)
                        drawCell(ctx, x, y)
                    })
                    break;
                case "BLOCK_UPDATED":
                    const {id} = msg.payload
                    const [x, y] = id.split(",").map(Number)
                    drawCell(ctx, x, y) 
                    break;
                case "RATE_LIMIT_EXCEEDED":
                    // Handle rate limit message
                    break;    
                default:
                    console.log("Unhandled message type:", msg.type);
            }
        }

    }, [])

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Magic Board</CardTitle>
                    <CardDescription>
                        Click a cell to claim it (real-time updates).
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex justify-center">
                    <div className="rounded-lg border bg-card p-3">
                        <canvas
                            ref={canvasRef}
                            className="block rounded-md"
                            width={GRID_SIZE * CELL_SIZE}
                            height={GRID_SIZE * CELL_SIZE}
                            onClick={(e: React.MouseEvent<HTMLCanvasElement>) => {
                                const rect = canvasRef.current?.getBoundingClientRect()
                                if (!rect) return
                                const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
                                const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)
                                const req = JSON.stringify({
                                    type: "CLAIM_BLOCK",
                                    payload: { blockID: `${x},${y}`, userID },
                                })
                                ws.send(req)
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CanvasGrid