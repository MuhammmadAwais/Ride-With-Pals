import { io, Socket } from "socket.io-client";
import { store } from "@/app/store"; // Assuming you have a Redux store exported

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL || "http://85.31.238.214:8084"; // Adjust according to env

class SocketServiceClass {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public connect(): void {
    if (this.socket?.connected) return;

    // Fetch token from Redux store or localStorage
    const state: any = store.getState();
    const token = state.auth?.user?.token || localStorage.getItem("token");

    if (!token) {
      console.warn("Socket connection aborted: No auth token available.");
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Socket disconnected");
    });

    // Chat Event Listeners
    this.socket.on("chat:message:new", (data: any) => {
      // You can dispatch Redux actions or trigger custom events here
      console.log("New chat message:", data);
      const event = new CustomEvent("chat:message:new", { detail: data });
      window.dispatchEvent(event);
    });

    this.socket.on("chat:thread:read", (data: any) => {
      console.log("Thread read:", data);
      const event = new CustomEvent("chat:thread:read", { detail: data });
      window.dispatchEvent(event);
    });
  }

  public emitWithAck(event: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error("Socket is not initialized."));
      }

      const doEmit = () => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timed out. Please check your internet connection."));
        }, 8000);

        this.socket!.emit(event, payload, (response: any) => {
          clearTimeout(timeout);
          if (response?.ok) {
            resolve(response.data);
          } else {
            reject(new Error(response?.message || "Socket event request failure."));
          }
        });
      };

      if (this.isConnected) {
        doEmit();
      } else {
        this.socket.once("connect", doEmit);
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const SocketService = new SocketServiceClass();
