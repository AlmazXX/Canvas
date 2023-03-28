import { useEffect, useRef } from 'react';
import { Pixel } from '../../types';

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    background: '#fff',
  },
  canvas: {
    border: '1px solid #000',
    borderRadius: '10px',
  },
};

const CANVAS_SIDE = 750;
const LINE_WIDTH = 5;
const LINE_COLOR = '#000';
const POINT_RADIUS = 2;

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket>();
  const prevPixel = useRef<Pixel | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onopen = () => {
      console.log('Websocket connection extablished');

      ws.current?.send(JSON.stringify({ type: 'INIT' }));
    };

    ws.current.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case 'INIT':
          renderPixels(data.payload);
          break;
        case 'DRAW':
          const currPixel = data.payload as Pixel;
          drawLineSegment(prevPixel.current, currPixel);
          prevPixel.current = currPixel;
        default:
          break;
      }
    };

    function renderPixels(pixels: Pixel[]) {
      pixels.forEach(({ x, y }) => {
        if (!ctx) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, 1, 1);
      });
    }

    function onMouseMove(e: MouseEvent) {
      ws.current?.send(
        JSON.stringify({
          type: 'DRAW',
          payload: { x: e.offsetX, y: e.offsetY },
        }),
      );
    }

    function onMouseUp() {
      if (!canvasRef.current) return;

      canvasRef.current.removeEventListener('mousemove', onMouseMove);
      prevPixel.current = null;
    }

    function onMouseDown() {
      if (!canvasRef.current) return;

      canvasRef.current.addEventListener('mousemove', onMouseMove);
      canvasRef.current.addEventListener('mouseup', onMouseUp);
    }

    canvas.addEventListener('mousedown', onMouseDown);

    return () => {
      if (!canvasRef.current) return;

      canvas.removeEventListener('mousedown', onMouseDown);
      canvasRef.current.removeEventListener('mousemove', onMouseMove);
      canvasRef.current.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function drawLineSegment(prevPixel: Pixel | null, currPixel: Pixel) {
    const ctx = canvasRef.current?.getContext('2d') as CanvasRenderingContext2D;

    let startPoint = prevPixel ?? currPixel;
    ctx.beginPath();
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = LINE_COLOR;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currPixel.x, currPixel.y);
    ctx.stroke();

    ctx.fillStyle = LINE_COLOR;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, POINT_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIDE}
        height={CANVAS_SIDE}
        style={styles.canvas}
      />
    </div>
  );
};

export default Canvas;
