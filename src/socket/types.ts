export interface ServerToClientEvents {
  respond: (authenticated: boolean) => void;
}

export interface ClientToServerEvents {}
