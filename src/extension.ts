import * as vscode from "vscode";
import { ConnectOptions, connectCommand } from "./connect";

import { info } from "./util";

export function activate(context: vscode.ExtensionContext) {
    info("activate");

    const commands = [
        ["matron", "\n"],
        ["crone", "\x1b"],
    ];

    for (const [name, terminator] of commands) {
        let disposable = vscode.commands.registerCommand(
            `nornsREPL.${name}.connect`,
            createConnectCommand(name, terminator)
        );
        context.subscriptions.push(disposable);
    }
}

let terminals: { [name: string]: vscode.Terminal } = {};

function createConnectCommand(name: string, terminator: string): () => void {
    function cleanup(): void {
        const term = terminals[name];
        term?.dispose();
        delete terminals[name];
    }

    const { host, maxHistory } = vscode.workspace.getConfiguration("nornsREPL");
    const { port } = vscode.workspace.getConfiguration(`nornsREPL.${name}`);
    const options: ConnectOptions = {
        name,
        host,
        port,
        maxHistory,
        terminator,
        cleanup,
    };

    return async () => {
        let term = terminals[name];
        if (term) {
            term.show();
            return;
        }

        const pty = await connectCommand(options);
        term = vscode.window.createTerminal({
            name,
            pty,
        });
        term.show();

        terminals[name] = term;
    };
}

export function deactivate() {
    info("deactivate");
    for (const term of Object.values(terminals)) {
        term.dispose();
    }
    terminals = {};
}
