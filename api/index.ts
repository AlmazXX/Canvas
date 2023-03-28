import cors from 'cors';
import { randomUUID } from 'crypto';
import express from 'express';
import expressWs from 'express-ws';
import { ActiveConnections, Message, Pixel } from './types';

const port = 8000;
const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};
let pixels: Pixel[] = [];

router.ws('/canvas', (ws) => {
  const id = randomUUID();
  console.log('client connected! id =', id);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({ type: 'INIT', payload: pixels }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString()) as Message;

    switch (data.type) {
      case 'DRAW':
        Object.keys(activeConnections).forEach((id) => {
          const conn = activeConnections[id];
          conn.send(JSON.stringify({ type: 'DRAW', payload: data.payload }));
        });
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected! id =', id);
    delete activeConnections[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`We are live on`, port);
});
