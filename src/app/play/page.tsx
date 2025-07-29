'use client';
import { getSocket, Socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PlayHome() {
    const [username, setUsername] = useState('');
    const [socket, setSocket] = useState<Socket>();
    const router = useRouter();

    function handleClick() {
        if (!socket) return;

        socket.emit('player:initialize', username);

        socket.emit('room:search');

        socket.on('room:found', (roomID) => {
            console.log('now joining room ', roomID);
            router.push(`play/${roomID}`);
        });
    }

    useEffect(() => {
        const socket = getSocket();
        setSocket(socket);

        return () => {
            socket.off('room:found');
        }
    }, []);

    return (
        <div className="flex w-screen h-screen justify-center items-center">
            <div className="flex flex-col w-[500px] h-[500px] justify-center items-center">
                <div className="flex flex-col items-center justify-center gap-[30px]">
                    <h1 className="min-w-[200px] text-[50px]">Virtual Cube</h1>
                    <input
                        type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-2 py-0.5 border-2"
                        autoComplete="off"
                        placeholder="enter username"
                        maxLength={30}
                    />
                    <button onClick={() => handleClick()} className="px-3 border-2 rounded-[10px]">
                        Play
                    </button>
                </div>
            </div>
        </div>
    );
}
