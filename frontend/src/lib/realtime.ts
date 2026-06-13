import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

/**
 * Shared Socket.IO connection to the backend realtime layer.
 * The server broadcasts "<collection>:change" whenever a watched collection
 * (orders, bookings, inventory, customers, contactMessages, notifications) changes.
 */
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({ path: "/socket.io", withCredentials: true });
  }
  return socket;
};

export type RealtimeChange = {
  collection: string;
  operationType?: string;
  documentKey?: unknown;
  fullDocument?: unknown;
};

/**
 * Subscribe to live change events for one or more collections.
 * `handler` runs on every change — typically a refetch of the relevant list.
 */
export const useRealtime = (
  collection: string | string[],
  handler: (payload: RealtimeChange) => void,
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const key = Array.isArray(collection) ? collection.join(",") : collection;

  useEffect(() => {
    const channels = Array.isArray(collection) ? collection : [collection];
    const sock = getSocket();
    const listener = (payload: RealtimeChange) => handlerRef.current(payload);

    channels.forEach((name) => sock.on(`${name}:change`, listener));
    return () => {
      channels.forEach((name) => sock.off(`${name}:change`, listener));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};
