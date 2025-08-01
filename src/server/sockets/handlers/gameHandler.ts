import { Server, Socket } from 'socket.io';
import Room from '@/server/room.ts';
import Player from '@/types/player.ts';
import { RoomState } from '@/types/RoomState.ts';
import { genRanHex } from '@/server/lib/utils.ts';
export default function initializeGameHandlers(io: Server, socket: Socket) {
    
    /*
    Setup event listeners for the socket
    */
    socket.on('player:initialize', (username: string) => initializePlayer(username));
    socket.on('room:join_random', () => joinRandomRoom());
    socket.on('room:join_rematch', () => joinRematchRoom());
    socket.on('room:joined', (roomID: string) => roomJoined(roomID));
    socket.on('keyboard:input', (socketID: string, key: string) => handleKeyboardInput(socketID, key));
    socket.on('player:completed_solve', (socketID) => handleSolveComplete(socketID));
    socket.on('disconnect', () => disconnectPlayer());


    /*
    Initialize player and add to global players list
    */
    function initializePlayer(username: string) {
        if (deps['players'].some((p) => p.id === socket.id)) {
            console.log('player already exists');
            return;
        }

        if (username == '') username = 'an unnamed cuber';

        const player = new Player(socket.id, username);

        if (!player) {
            console.log('Failed to create player');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        deps['players'].push(player);
        socket.emit('player:initialized', socket.id);
    }


    /*
    Search for a room to join and return its roomID
    Does not add the player to the room yet, that is done in roomJoined function
    */
    function joinRandomRoom() {
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            console.log('No player found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        // Join a room that has space and hasn't started yet
        let room = deps['rooms'].find((r) => r.players.length <= r.getMaxPlayerCount() - 1 && r.roomStatus == RoomState.GAME_NOT_STARTED);

        // If no room found, create a new one
        if (!room) {
            let newRoomID = genRanHex(5);

            while (deps['rooms'].some(r => r.roomID === newRoomID)) {
                newRoomID = genRanHex(5);
            }

            room = new Room(newRoomID, io);
        }

        deps['rooms'].push(room);

        // Push players to room route
        io.to(socket.id).emit('room:found', room.roomID);
    }


    /*
    Send all players in the room to a new room if all players accept the rematch
    */
    function joinRematchRoom() {
        const room = deps['rooms'].find((r) => r.players.some((p) => p.id === socket.id));
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            console.log('Player not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        if (!room) {
            console.log('Room not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        const allPlayersAccepted = room.processRematchRequest(socket.id);

        if (allPlayersAccepted) {
            console.log('Rematch accepted by all players, creating new room');
            let newRoom = deps['rooms'].find((r) => r.players.length <= r.getMaxPlayerCount() - 1 && r.roomStatus == RoomState.GAME_NOT_STARTED);

            // If no room found, create a new one
            if (!newRoom) {
                let newRoomID = genRanHex(5);

                while (deps['rooms'].some(r => r.roomID === newRoomID)) {
                    newRoomID = genRanHex(5);
                }

                newRoom = new Room(newRoomID, io);
            }

            deps['rooms'].push(newRoom);

            // Push players to room route
            io.to(room.roomID).emit('room:found', newRoom.roomID);
        }
    }


    /*
    Attempts to start the game when a player successfully joins the room
    Removes player from any previous room they were in
    */
    function roomJoined(roomID: string) {
        const room = deps['rooms'].find((r) => r.roomID === roomID);
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            console.log('Player not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        if (!room) {
            console.log('Room not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        // if user is already in a room, leave that room first
        let currentRoom = deps['rooms'].find((r) => r.players.some((p) => p.id === socket.id));

        if (currentRoom) {
            currentRoom.removePlayer(player.id);
            socket.leave(currentRoom.roomID);
            player.status = RoomState.GAME_NOT_STARTED;
            player.solveTime = 0;
            player.isDNF = false;
        }

        socket.join(room.roomID);
        room.addPlayer(socket, player);

        // Starts game and renders scramble when room is full
        room.startGame();
    }


    /*
    Recieve keyboard input from a player and forward it to the room they are in
    */
    function handleKeyboardInput(senderID: string, key: string) {
        let room = deps['rooms'].find((r) => r.players.some((p) => p.id === senderID));

        if (!room) {
            console.log('Misdirected input, no room found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        room.handleInput(senderID, key);
    }


    /*
    Alert the room that a player has completed their solve
    */
    function handleSolveComplete(socketID: string) {
        let room = deps['rooms'].find((r) => r.players.some((p) => p.id === socket.id));
        if (!room) return;

        if (socket.id == socketID) room.playerSolveComplete(socketID);
    }


    /*
    Handle player disconnection, mark them as DNF in their room
    */
    function disconnectPlayer() {
        let room = deps['rooms'].find((r) => r.players.some((p) => p.id === socket.id));
        const player = deps['players'].find((p) => p.id === socket.id);
        if (!player) {
            io.to(socket.id).emit('join:invalid');
            return;
        }
        if (room) room.playerDNF(player.id);

        console.log('disconnect');
    }
};