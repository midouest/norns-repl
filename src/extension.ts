import * as vscode from "vscode";

import { ConnectCommandOptions, executeConnectCommand } from "./connect";
import { executeSendCommand } from "./send";
import { info } from "./util";

const CONNECT_CONFIG = [
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

const FIXED_SEND_CONFIG = [
    {
        name: "nornsREPL.script.reload",
        command: "norns.script.load(norns.state.script)",
    },
    {
        name: "nornsREPL.sleep",
        command: "norns.shutdown()",
    },
] as const;

export function activate(context: vscode.ExtensionContext) {
    info("activate");

    for (const { name, unit, terminator } of CONNECT_CONFIG) {
        registerCommand(
            context,
            `nornsREPL.${name}.connect`,
            createConnectCommand(name, unit, terminator)
        );

        registerCommand(
            context,
            `nornsREPL.${name}.send`,
            createSendCommand(name, terminator)
        );
    }

    for (const { name, command } of FIXED_SEND_CONFIG) {
        registerCommand(context, name, createFixedSendCommand(command));
    }
}

function registerCommand(
    context: vscode.ExtensionContext,
    name: string,
    command: (...args: any[]) => void
): void {
    let disposable = vscode.commands.registerCommand(name, command);
    context.subscriptions.push(disposable);
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

function createFixedSendCommand(command: string): () => Promise<void> {
    const callback = createSendCommand("matron", "\n");
    return () => callback(command);
}

function createSendCommand(
    name: string,
    terminator: string
): (command?: string) => Promise<void> {
    const { host } = vscode.workspace.getConfiguration("nornsREPL");
    const { port } = vscode.workspace.getConfiguration(`nornsREPL.${name}`);
    return async (command?: string) => {
        command = command ?? (await vscode.window.showInputBox());
        if (command === undefined) {
            return;
        }

        executeSendCommand({
            host,
            port,
            command,
            terminator,
        });
    };
}

export function deactivate() {
    info("deactivate");
    for (const { name } of CONNECT_CONFIG) {
        getTerminal(name)?.dispose();
    }
}

function getTerminal(name: string): vscode.Terminal | undefined {
    return vscode.window.terminals.find((term) => term.name === name);
}
