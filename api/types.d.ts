import { WebSocket } from 'ws';

export interface ActiveConnections {
  [id: string]: WebSocket;
}

export interface Pixel {
  x: number;
  y: number;
}

export interface Message {
  type: string;
  payload?: Pixel | Pixel[];
}
