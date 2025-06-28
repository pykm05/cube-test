'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

enum RoomState {
    GAME_NOT_STARTED = 'Awaiting players...',
    INSPECTION_TIME = 'Cube inspection',
    SOLVE_IN_PROGRESS = 'Solve in progress',
    GAME_ENDED = 'Game complete',
}

export default function Game() {
    const [roomState, setRoomState] = useState(RoomState.GAME_NOT_STARTED);
    const [timeRemaining, setTimeRemaining] = useState(15);

    useEffect(() => {
        const socket = getSocket();

        socket.on('timer:update', (time) => {
            setTimeRemaining(time);
        });

        socket.on('inspection:start', () => {
            setRoomState(RoomState.INSPECTION_TIME);
        });

        socket.on('solve:in_progress', () => {
            setRoomState(RoomState.SOLVE_IN_PROGRESS);
        });

        socket.on('game:complete', () => {
            setRoomState(RoomState.GAME_ENDED);
        });

        return () => {
            socket.off('timer:update');
            socket.off('inspection:start');
            socket.off('solve:in_progress');
            socket.off('game:complete');
        }
    }, []);

    useEffect(() => {
        switch (roomState) {
            case RoomState.GAME_NOT_STARTED:
                break;
            case RoomState.INSPECTION_TIME:
                break;
            case RoomState.SOLVE_IN_PROGRESS:
                break;
            case RoomState.GAME_ENDED:
        }
    }, [roomState]);

    return (
        <div className="flex flex-col items-center w-full p-5 bg-purple-800 text-white">
            <div>{roomState}</div>
            <div>
                {roomState == RoomState.INSPECTION_TIME || roomState == RoomState.SOLVE_IN_PROGRESS
                    ? timeRemaining
                    : null}
            </div>
        </div>
    );
}
