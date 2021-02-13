import * as vscode from 'vscode';
import { connectClient } from './client';

import { info } from './util';
import { NornsREPL } from './repl';

let term: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
    info('activate');
    let disposable = vscode.commands.registerCommand('norns-repl.connect', connectCommand);
    context.subscriptions.push(disposable);
}

export function deactivate() {
    info('deactivate');
    cleanup();
}

async function connectCommand(): Promise<void> {
    info('connect');

    if (term !== undefined) {
        term.show();
        return;
    }

    const status = vscode.window.createStatusBarItem();
    status.text = 'Connecting to Matron...';
    status.show();

    const { host, port } = vscode.workspace.getConfiguration('norns-repl.connect');
    const webSocket = await connectClient({
        host, port
    });
    status.hide();

    const { length: maxHistory } = vscode.workspace.getConfiguration('norns-repl.history');
    const repl = new NornsREPL({
        webSocket,
        maxHistory,
        promptDebounce: 100,
    });
    term = vscode.window.createTerminal({
        name: 'norns',
        pty: repl,
    });
    term.show();

    webSocket.on('error', cleanup);
    webSocket.on('close', cleanup);
}

function cleanup() {
    term?.hide();
    term?.dispose();
    term = undefined;
}
