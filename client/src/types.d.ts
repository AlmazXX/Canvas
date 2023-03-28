export interface Pixel {
  x: number;
  y: number;
}

export interface Message {
  type: string;
  payload?: Pixel | Pixel[] | Pixel[][];
}
