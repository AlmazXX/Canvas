import { CSSProperties, useEffect, useRef } from 'react';
import { Message, Pixel } from '../../types';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
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
  btn: {
    background: '#fff',
    padding: 'calc(.875rem - 1px) calc(1.5rem - 1px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '.25rem',
  },
};

const CANVAS_SIDE = 750;
const LINE_WIDTH = 5;
const LINE_COLOR = '#000';
const POINT_RADIUS = 2;

const broadcast = (webSocket: WebSocket, data: Message) => {
  webSocket.send(JSON.stringify(data));
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  prevPixel: Pixel | null,
  currPixel: Pixel,
) => {
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
};

const clear = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket>();
  const currPixels = useRef<Pixel[]>([]);
  const prevPixel = useRef<Pixel | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onopen = () => {
      console.log('Websocket connection extablished');
    };

    ws.current.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Message;

      if (data.type === 'INIT') {
        const existingLines = data.payload as Pixel[][];
        existingLines.forEach((pixels) => {
          for (let i = 1; i < pixels.length; ++i) {
            drawLine(ctx, pixels[i - 1], pixels[i]);
          }
        });
      }

      if (data.type === 'DRAW') {
        const currPixel = data.payload as Pixel;
        drawLine(ctx, prevPixel.current, currPixel);
        currPixels.current = [...currPixels.current, currPixel];
        prevPixel.current = currPixel;
      }

      if (data.type === 'STOP_DRAW') {
        prevPixel.current = null;
      }

      if (data.type === 'CLEAR') {
        clear(canvas);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onMouseDown = () => {
    canvasRef.current?.addEventListener('mousemove', onMouseMove);
    canvasRef.current?.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    broadcast(ws.current!, {
      type: 'DRAW',
      payload: { x: e.offsetX, y: e.offsetY },
    });
  };

  const onMouseUp = () => {
    canvasRef.current?.removeEventListener('mousemove', onMouseMove);

    broadcast(ws.current!, { type: 'STOP_DRAW', payload: currPixels.current });

    currPixels.current = [];
  };

  const onClear = () => {
    broadcast(ws.current!, { type: 'CLEAR' });
  };

  return (
    <div style={styles.container as CSSProperties}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIDE}
        height={CANVAS_SIDE}
        style={styles.canvas}
      />
      <button style={styles.btn} onClick={onClear}>
        Clear
      </button>
    </div>
  );
};

export default Canvas;
