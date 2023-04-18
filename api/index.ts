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
let lines: Pixel[][] = [];

router.ws('/canvas', (ws) => {
  const id = randomUUID();
  console.log('client connected! id =', id);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({ type: 'INIT', payload: lines }));

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString()) as Message;

    switch (data.type) {
      case 'DRAW':
        broadcast({ type: 'DRAW', payload: data.payload as Pixel });
        break;
      case 'STOP_DRAW':
        lines.push(data.payload as Pixel[]);
        broadcast({ type: 'STOP_DRAW' });
        break;
      case 'CLEAR':
        lines = [];
        broadcast({ type: 'CLEAR' });
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected! id =', id);
    delete activeConnections[id];
  });

  const broadcast = (data: Message) => {
    Object.keys(activeConnections).forEach((id) => {
      const conn = activeConnections[id];
      conn.send(JSON.stringify(data));
    });
  };
});

app.use(router);

app.listen(port, () => {
  console.log(`We are live on`, port);
});
