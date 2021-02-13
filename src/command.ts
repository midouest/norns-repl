import * as vscode from "vscode";
import { API } from "./api";
import { connectWebSocket } from "./websocket";
import { NornsREPL } from "./repl";
import { info } from "./util";

export interface ConnectCommandOptions {
    name: string;
    host: string;
    port: number;
    terminator: string;
    unit: string;
    maxHistory: number;
}

export async function executeConnectCommand(
    options: ConnectCommandOptions
): Promise<vscode.Pseudoterminal> {
    info("connect");
    const { name, host, port, maxHistory, terminator, unit } = options;

    const status = vscode.window.createStatusBarItem();
    status.text = `Connecting to ${name}...`;
    status.show();

    const webSocket = await connectWebSocket({
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

    return repl;
}
