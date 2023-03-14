import { useEffect, useRef } from "react";
import { Pixel, Point } from "../../types";

const styles = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    background: "#fff",
  },
  canvas: {
    border: "1px solid #000",
    borderRadius: "10px",
  },
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket>();
  const prevPoint = useRef<Point | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ws.current = new WebSocket("ws://localhost:8000/canvas");

    ws.current.onopen = () => {
      console.log("Websocket connection extablished");

      ws.current?.send(JSON.stringify({ type: "INIT" }));
    };

    ws.current.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "INIT":
          renderPixels(data.payload);
          break;
        case "DRAW":
          renderPixels(data.payload);
        default:
          break;
      }
    };

    function renderPixels(pixels: Pixel[]) {
      pixels.forEach(({ x, y, color }) => {
        if (!ctx) return;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvasRef.current) return;

      const currentPoint = getCursorPosition(canvasRef.current, e);

      drawLineSegment(prevPoint.current, currentPoint, "#000");

      ws.current?.send(
        JSON.stringify({
          type: "DRAW",
          payload: [{ x: currentPoint.x, y: currentPoint.y, color: "#000" }],
        })
      );

      prevPoint.current = currentPoint;
    }

    function onMouseUp() {
      if (!canvasRef.current) return;

      canvasRef.current.removeEventListener("mousemove", onMouseMove);
    }

    function onMouseDown(e: MouseEvent) {
      if (!canvasRef.current) return;

      const { x, y } = getCursorPosition(canvasRef.current, e);

      canvasRef.current.addEventListener("mousemove", onMouseMove);
      canvasRef.current.addEventListener("mouseup", onMouseUp);
    }

    canvas.addEventListener("mousedown", onMouseDown);

    return () => {
      if (!canvasRef.current) return;

      canvas.removeEventListener("mousedown", onMouseDown);
      canvasRef.current.removeEventListener("mousemove", onMouseMove);
      canvasRef.current.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function getCursorPosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent
  ): Point {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  function drawLineSegment(
    prevPoint: Point | null,
    currPoint: Point,
    color: string
  ) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let startPoint = prevPoint ?? currPoint;
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currPoint.x, currPoint.y);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} width={750} height={750} style={styles.canvas} />
    </div>
  );
};

export default Canvas;
