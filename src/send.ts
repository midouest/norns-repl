import { info } from "./util";
import { connectWebSocket, ConnectWebSocketOptions } from "./websocket";

export interface SendWebSocketOptions extends ConnectWebSocketOptions {
    terminator: string;
}

export interface SendCommandOptions extends SendWebSocketOptions {
    command: string;
}

export async function executeSendCommand(options: SendCommandOptions) {
    info("send");
    const webSocket = await connectWebSocket(options);
    webSocket.send(options.command + options.terminator);
    webSocket.close();
}
