import * as WebSocket from 'ws';
import { error, info } from './log';
import { Type } from './util';

export interface ConnectClientOptions {
    host: string;
    port: number;
    webSocketCls?: Type<WebSocket>;
}

export function connectClient(options: ConnectClientOptions): Promise<WebSocket> {
    const { host, port, webSocketCls } = {
        webSocketCls: WebSocket,
        ...options,
    };
    const ws = new webSocketCls(`ws://${host}:${port}`, ['bus.sp.nanomsg.org']);
    ws.on('close', () => {
        info('websocket close');
    });

    return new Promise((resolve, reject) => {
        ws.once('open', () => {
            info('websocket open');
            resolve(ws);
        });

        ws.once('error', (code: number, reason: string) => {
            error('websocket error', code, reason);
            reject(new Error(`code: ${code}, reason: ${reason}`));
        });
    });
}
