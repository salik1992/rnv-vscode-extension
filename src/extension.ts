import * as vscode from 'vscode';
import { RNVTasksTreeView, TaskByTaskName } from './rnv';

export function activate() {
    vscode.commands.registerCommand('extension.rnv.launch', (data?: TaskByTaskName) => {
        const terminal = vscode.window.createTerminal({
            name: 'RNV',
        });
        terminal.show();
        terminal.sendText(
            data
                ? `rnv ${data.task} -p ${data.platform} -c ${data.config} -s ${data.scheme}`
                : 'rnv --help',
        );
    });
    vscode.window.registerTreeDataProvider('rnv', new RNVTasksTreeView());
}
