import express from 'express';
import cors from 'cors';
import { Response } from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { Room } from './room.ts';
import { Player } from '@/types/player.ts';
import { RoomState } from '@/types/RoomState.ts';
import { WebSocket } from './ws/websocket.ts';

const app = express();

app.use(cors());
app.use(express.json());

// const server = http.createServer(app);

app.get('/', (_, res) => {
    res.send('server running');
});

// server.listen(port, () => {
//     console.log('connected');
// });

// Initialize and start WebSocket
const port = process.env.PORT || 8080;
const server = app.listen(port, async () => {
    console.log(`API is running on port ${port}`);
    await deps.webSocket.init(server);
});

// const Rooms: Room[] = [];

// io.on('connection', (socket: Socket) => {
//     let player: Player = {
//         id: socket.id,
//         username: '',
//         status: RoomState.GAME_NOT_STARTED,
//         solveTime: 0,
//         isDNF: false,
//     };
//     let room: Room | null;
//     let prevRoomID: string = '';

//     socket.on('player:initialize', (username: string) => {
//         player.username = username;

//         socket.emit('room:search');
//     });

//     socket.on('room:search', () => {
//         if (room) {
//             room.removePlayer(player.id);
//             socket.leave(room.roomID);

//             prevRoomID = room.roomID;
//             room = null;
//             player.status = RoomState.GAME_NOT_STARTED;
//             player.solveTime = 0;
//         }

//         room = findRoom(room, prevRoomID);
//         io.to(socket.id).emit('room:found', room.roomID);
//     });

//     socket.on('room:rematch', () => {
//         if (!room) return;

//         const rematchAccepted = room.processRematchRequest(socket.id);

//         if (rematchAccepted) {
//             const newRoom = new Room(genRanHex(5), io);
//             Rooms.push(newRoom);

//             io.to(room.roomID).emit('room:rematch_accepted', newRoom.roomID);
//         }
//     });

//     socket.on('room:rematch_join', (newRoomID: string) => {
//         if (!room) return;

//         room.removePlayer(player.id);
//         socket.leave(room.roomID);
//         prevRoomID = room.roomID;

//         player.status = RoomState.GAME_NOT_STARTED;
//         player.solveTime = 0;

//         for (const r of Rooms) {
//             if (r.roomID == newRoomID) {
//                 room = r;
//                 break;
//             }
//         }
//     });

//     socket.on('keyboard:input', (socketID, key) => {
//         if (!room) {
//             io.to(socket.id).emit('join:invalid');
//             return;
//         }

//         room.handleInput(socketID, key);
//     });

//     socket.on('user:joined', () => {
//         if (!room) {
//             io.to(socket.id).emit('join:invalid');
//             return;
//         }

//         // debugging
//         for (const room of Rooms) {
//             console.log(`${room.roomID}: ${room.players.length}`);
//             if (room.players.length > 2) {
//                 for (const player of room.players) {
//                     console.log(player.id);
//                 }
//             }
//         }

//         room.addPlayer(socket, player);
//     });

//     socket.on('player:completed_solve', (socketID) => {
//         if (!room) return;

//         if (socket.id == socketID) room.playerSolveComplete(socketID);
//     });

//     socket.on('player:remove', (socketID: string) => {
//         if (!room) return;

//         room.playerDNF(socketID);
//         socket.leave(room.roomID);
//     });

//     socket.on('disconnect', () => {
//         if (room) room.playerDNF(player.id);

//         console.log('disconnect');
//     });
// });

// const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// function findRoom(room: Room | null, prevRoomID: string) {
//     for (const curr of Rooms) {
//         if (
//             curr.players.length <= curr.getMaxPlayerCount() - 1 &&
//             prevRoomID != curr.roomID &&
//             curr.roomStatus == RoomState.GAME_NOT_STARTED
//         ) {
//             room = curr;
//         }
//     }

//     if (!room) {
//         room = new Room(genRanHex(5), io);
//         Rooms.push(room);
//         console.log('room could not be found');
//     }

//     return room;
// }
