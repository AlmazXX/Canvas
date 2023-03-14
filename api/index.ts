import cors from "cors";
import { randomUUID } from "crypto";
import express from "express";
import expressWs from "express-ws";
import { ActiveConnections, Pixel } from "./types";

const port = 8000;
const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};
let pixels: Pixel[] = [];

router.ws("/canvas", (ws) => {
  const id = randomUUID();
  console.log("client connected! id =", id);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({ type: "INIT", data: pixels }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    switch (data.type) {
      case "DRAW":
        pixels.push(...data.data);

        Object.keys(activeConnections).forEach((id) => {
          const conn = activeConnections[id];
          conn.send(JSON.stringify({ type: "DRAW", data }));
        });
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected! id =", id);
    delete activeConnections[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`We are live on`, port);
});