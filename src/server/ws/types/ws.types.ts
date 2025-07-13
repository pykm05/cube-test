export declare namespace WS {
  /** Server -> client events */
  export interface To {
    /** Emits to player a new room ID */
    'room:found': Params.RoomFound;
    /** Emits to room that a player has accepted rematch */
    'room:rematch_accepted': Params.RematchAccepted;
    /** Initialize player in backend */
    'player:initialize': Params.PlayerInitialize;
  }

  export interface On {
    /** Manually disconnect from the websocket; logout. */
    'disconnect': any;
  }

  /** Client -> server events */
  export interface From {
    /** Called when player clicks new game */
    'room:found': Args.RoomFound,
    /** Initialize player with username */
    'player:initialize': Args.PlayerInitialize;
    /** Search for a room */
    'room:search': void;
    /** Request a rematch */
    'room:rematch': void;
    /** Join a rematch room */
    'room:rematch_join': Args.RoomRematchJoin;
    /** Keyboard input */
    'keyboard:input': Args.KeyboardInput;
    /** User joined */
    'user:joined': void;
    /** Player completed solve */
    'player:completed_solve': Args.PlayerCompletedSolve;
    /** Player remove (DNF) */
    'player:remove': Args.PlayerRemove;
  }

  export namespace Params {
    export interface RoomFound {
      roomID: string;
    }
    export interface RematchAccepted {
      newRoomID: string;
    }
    export interface PlayerInitialize {
      username: string;
    }
  }

  export namespace Args {
    export interface RoomFound {
      prevRoomID: string;
    }
    export interface PlayerInitialize {
      username: string;
    }
    export interface RoomRematchJoin {
      newRoomID: string;
    }
    export interface KeyboardInput {
      socketID: string;
      key: string;
    }
    export interface PlayerCompletedSolve {
      socketID: string;
    }
    export interface PlayerRemove {
      socketID: string;
    }
  }
}