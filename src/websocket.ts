import * as WebSocket from "ws";
import { error, info } from "./util";

export interface ConnectWebSocketOptions {
    host: string;
    port: number;
}

export function connectWebSocket(
    options: ConnectWebSocketOptions
): Promise<WebSocket> {
    const { host, port } = options;
    const ws = new WebSocket(`ws://${host}:${port}`, ["bus.sp.nanomsg.org"]);
    ws.on("close", () => {
        info("websocket close");
    });

    return new Promise((resolve, reject) => {
        ws.once("open", () => {
            info("websocket open");
            resolve(ws);
        });

        ws.once("error", (code: number, reason: string) => {
            error("websocket error", code, reason);
            reject(new Error(`code: ${code}, reason: ${reason}`));
        });
    });
}
