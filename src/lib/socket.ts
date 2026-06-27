import { io } from "socket.io-client";
import { SERVER_URL } from "./env";

export const socket = io(SERVER_URL, {
  autoConnect: false
});

export const setSocketAuthToken = (token: string | null) => {
  socket.auth = token ? { token } : {};
};