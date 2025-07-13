import { WebSocket } from '../ws/websocket';

export interface Deps {
  webSocket: WebSocket;
}

export const deps: Deps = {
  webSocket: new WebSocket()
};

globalThis.deps = deps;