import { WS } from '../types/ws.types';
import { Socket } from 'socket.io';
import { WebSocket } from '../websocket';
import { WSEvent } from './ws-event';

export default class implements WSEvent<'player:initialize'> {
  public on = 'player:initialize' as const;

  public async invoke(ws: WebSocket, client: Socket, { username }: WS.Params.PlayerInitialize) {
    if (!username)
      throw new TypeError('Not enough options were provided');

    console.log(username);

    // await deps.wsGuard.validateCan(client, guildId, 'MANAGE_CHANNELS');

    return [{
      emit: this.on,
      to: [client.id],
      send: {
        username: username,
      },
    }];
  }
}