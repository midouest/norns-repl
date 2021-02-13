import * as vscode from "vscode";

import { ConnectCommandOptions, executeConnectCommand } from "./command";
import { info } from "./util";

const CONFIG = [
    {
        name: "matron",
        unit: "norns-matron.service",
        terminator: "\n",
    },
    {
        name: "crone",
        unit: "norns-sclang.service",
        terminator: "\x1b",
    },
] as const;

export function activate(context: vscode.ExtensionContext) {
    info("activate");

    for (const { name, unit, terminator } of CONFIG) {
        let disposable = vscode.commands.registerCommand(
            `nornsREPL.${name}.connect`,
            createConnectCommand(name, unit, terminator)
        );
        context.subscriptions.push(disposable);
    }
}

function createConnectCommand(
    name: string,
    unit: string,
    terminator: string
): () => void {
    const { host, maxHistory } = vscode.workspace.getConfiguration("nornsREPL");
    const { port } = vscode.workspace.getConfiguration(`nornsREPL.${name}`);
    const options: ConnectCommandOptions = {
        name,
        host,
        port,
        maxHistory,
        terminator,
        unit,
    };

    return async () => {
        let term = getTerminal(name);
        if (term) {
            term.show();
            return;
        }

        const pty = await executeConnectCommand(options);
        term = vscode.window.createTerminal({
            name,
            pty,
        });
        term.show();
    };
}

export function deactivate() {
    info("deactivate");
    for (const { name } of CONFIG) {
        getTerminal(name)?.dispose();
    }
}

function getTerminal(name: string): vscode.Terminal | undefined {
    return vscode.window.terminals.find((term) => term.name === name);
}
