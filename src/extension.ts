import { Subject } from 'rxjs';
import * as vscode from 'vscode';
import * as WebSocket from 'ws';

import { info, error } from './log';
import { NornsREPL } from './repl';

let ws: WebSocket | undefined;
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

function connectCommand(): void {
	info('connect');

	if (term !== undefined) {
		term.show();
		return;
	}

	const status = vscode.window.createStatusBarItem();
	status.text = 'Connecting to Matron...';
	status.show();

	ws = new WebSocket("ws://norns.local:5555", ['bus.sp.nanomsg.org']);

	const rx = new Subject<string>();

	ws.on('message', (data) => {
		rx.next(data.toString());
	});

	ws.on('close', (code, reason) => {
		info('websocket close', code, reason);
		cleanup();
	});

	ws.on('error', (err) => {
		error('websocket error', err);
		status.hide();
		const msg = `Error connecting to Matron: ${err.message}`;
		vscode.window.showErrorMessage(msg);
		cleanup();
	});

	ws.on('open', () => {
		info('websocket open');
		status.hide();

		const repl = new NornsREPL(rx.asObservable());
		repl.tx$.subscribe((data) => {
			ws?.send(data);
		});

		term = vscode.window.createTerminal({
			name: 'norns',
			pty: repl,
		});
		term.show();
	});
}

function cleanup(): void {
	if (term !== undefined) {
		term.dispose();
		term = undefined;
	}

	if (ws !== undefined) {
		ws.close();
		ws = undefined;
	}
}
