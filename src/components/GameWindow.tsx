'use client';
import { useEffect, useState } from 'react';
import { getSocket, getPlayerOrder } from '@/lib/socket';
import { Cube } from '@/components/three/cube';
import Scene from '@/components/three/scene';
import { Player } from '@/types/player';
import { Notation, KeybindMap, notationFromString, isCubeRotation } from '@/types/cubeTypes';
import Image from 'next/image';

// FIXME: Put that somewhere else
// prettier-ignore
// Stop removing the quotes on the keys
const default_keybinds: KeybindMap = {
    'f': Notation.U,
    'j': Notation.U_PRIME,
    's': Notation.D,
    'l': Notation.D_PRIME,
    'i': Notation.R,
    'k': Notation.R_PRIME,
    'd': Notation.L,
    'e': Notation.L_PRIME,
    'h': Notation.F,
    'g': Notation.F_PRIME,
    'w': Notation.B,
    'o': Notation.B_PRIME,
    'x': Notation.M_PRIME,
    '.': Notation.M_PRIME,
    '6': Notation.M,
    '0': Notation.S,
    '1': Notation.S_PRIME,
    '2': Notation.E,
    '9': Notation.E_PRIME,

    ';': Notation.y,
    'a': Notation.y_PRIME,
    'y': Notation.x,
    'b': Notation.x_PRIME,
    'p': Notation.z,
    'q': Notation.z_PRIME,
};

const scrambleBuffer: Record<string, string> = {};

export default function GameWindow() {
    const [players, setPlayers] = useState<Player[]>([]);

    function newScene(container: HTMLElement, assignedSocketID: string) {
        const { scene, renderer, camera } = Scene(container);
        const scramble = scrambleBuffer[assignedSocketID];
        const cube = new Cube(scene, renderer, camera, scramble);
        delete scrambleBuffer[assignedSocketID];

        const socket = getSocket();
        const emitter = socket.id == assignedSocketID;

        // Make sure we capture keydowns only if the scene is the active player's scene
        //     Since there is 2 scenes, one for each cube, if we add 2 event listener,
        //     the check for is cube solved will check for the opponent's cube and thus send the event
        // I would have loved to put that call elsewhere, but we need the socket and the cube
        if (emitter) {
            window.addEventListener('keydown', async (e) => {
                // This fixes an issue that would allow a player to continue moving its cube on the other player's screen after solving it
                if (await cube.isSolved()) {
                    return;
                }

                const move: Notation | null = default_keybinds[e.key];

                if (move == null) {
                    console.log(`Key not in the bindmap: ${e.key}`);
                    return;
                }

                console.log(`Sending move: ${move}`);

                socket.emit('keyboard:input', socket.id, move);
            });
        }

        socket.on('keyboard:input', async (socketID: string, key: string) => {
            if ((emitter && socket.id == socketID) || (!emitter && assignedSocketID == socketID)) {
                const maybe_notation: Notation | null = notationFromString(key);

                if (maybe_notation == null) {
                    console.log(
                        `Received an 'keyboard:input' event but the data could not be parsed to a cube Notation: ${key}`
                    );
                    return;
                }

                const notation = maybe_notation!;

                cube.handleInput(notation);

                // Make sure we order the checks from least to most expensive for short circuit evaluation
                if (emitter && !isCubeRotation(notation) && (await cube.isSolved())) {
                    socket.emit('player:completed_solve', socket.id);
                }
            }
        });
    }

    useEffect(() => {
        const socket = getSocket();

        socket.on('game:start', (users: Player[], scramble: string) => {
            for (let user of users) {
                scrambleBuffer[user.id] = scramble;
            }
            setPlayers(getPlayerOrder(users));
        });
    }, []);

    useEffect(() => {
        for (let i = 0; i < players.length; i++) {
            const userID = players[i].id;
            const element = document.getElementById(userID);
            if (element) {
                newScene(element, userID);
            }
        }
    }, [players]);

    return (
        <div className="flex justify-center w-screen h-screen">
            {players.map(
                (user: Player) =>
                    user && (
                        <div key={user.id} className="flex flex-1 flex-col">
                            <div className="flex items-center px-3 w-full gap-[20px]">
                                <Image
                                    src="/account_circle.svg"
                                    height={75}
                                    width={75}
                                    priority={true}
                                    alt="user icon"
                                />
                                <div>{user.username ? user.username : 'an unnamed cuber'}</div>
                            </div>
                            <div id={user.id} className="w-full h-full" />
                        </div>
                    )
            )}
        </div>
    );
}
