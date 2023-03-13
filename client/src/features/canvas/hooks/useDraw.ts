import { useEffect, useRef, useState } from "react";
import { Draw, Point } from "../../../types";

const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
  const [mouseDown, setMouseDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevPoint = useRef<Point | null>(null);

  const onMouseDown = () => setMouseDown(true);

  const onClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;

      const currentPoint = computePointInCanvas(e);
      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
      prevPoint.current = currentPoint;
    };

    const computePointInCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return { x, y };
    };

    const onMouseUp = () => {
      setMouseDown(false);
      prevPoint.current = null;
    };

    canvasRef.current?.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvasRef.current?.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onDraw]);

  return { canvasRef, onMouseDown, onClear };
};

export default useDraw;