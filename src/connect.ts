import * as vscode from "vscode";
import { API } from "./api";
import { connectClient } from "./client";
import { NornsREPL } from "./repl";
import { info } from "./util";

export interface ConnectOptions {
    name: string;
    host: string;
    port: number;
    terminator: string;
    unit: string;
    maxHistory: number;
    cleanup: () => void;
}

export async function connectCommand(
    options: ConnectOptions
): Promise<vscode.Pseudoterminal> {
    info("connect");
    const { name, host, port, maxHistory, terminator, unit, cleanup } = options;

    const status = vscode.window.createStatusBarItem();
    status.text = `Connecting to ${name}...`;
    status.show();

    const webSocket = await connectClient({
        host,
        port,
    });
    status.hide();

    const api = new API(host);

    const repl = new NornsREPL({
        name,
        webSocket,
        api,
        maxHistory,
        terminator,
        unit,
        promptDebounce: 100,
    });

    webSocket.on("error", cleanup);
    webSocket.on("close", cleanup);

    return repl;
}
