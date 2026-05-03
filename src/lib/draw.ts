import { CELL_SIZE } from "../constants/GRID";

export function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
}

export function drawGridLines(ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number) {
    ctx.strokeStyle = "#222"; // or any color you want for the grid lines
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gridSize * cellSize);
        ctx.stroke();
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(gridSize * cellSize, i * cellSize);
        ctx.stroke();
    }
}