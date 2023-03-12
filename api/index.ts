import cors from "cors";
import { randomUUID } from "crypto";
import express from "express";
import expressWs from "express-ws";
import { ActiveConnections } from "./types";

const port = 8000;
const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};

router.ws("/canvas", (ws, _req) => {
  const id = randomUUID();
  console.log("Client connected! id =", id);

  activeConnections[id] = ws;

  ws.on("close", () => {
    console.log("Client disconnected! id =", id);
    delete activeConnections[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`We are live on`, port);
});