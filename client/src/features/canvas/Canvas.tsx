import { Draw } from "../../types";
import useDraw from "./hooks/useDraw";

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
  clearBtn: {
    padding: "10px",
    background: "#fff",
    borderRadius: "5px",
    border: "1px solid #000",
  },
};

const Canvas = () => {
  const drawLine = ({ prevPoint, currentPoint, ctx }: Draw) => {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = "#000";
    const lineWidth = 5;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const { canvasRef, onMouseDown, onClear } = useDraw(drawLine);

  return (
    <div style={styles.container}>
      <button onClick={onClear} style={styles.clearBtn}>
        Clear canvas
      </button>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={750}
        height={750}
        style={styles.canvas}
      />
    </div>
  );
};

export default Canvas;