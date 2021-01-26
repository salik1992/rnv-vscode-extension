import * as vscode from 'vscode';
import { RNVTasksTreeView, copy, launch } from './rnv';

export function activate() {
    vscode.commands.registerCommand('extension.rnv.launch', launch);
    vscode.commands.registerCommand('extension.rnv.copy', copy);
    vscode.window.registerTreeDataProvider('rnv', new RNVTasksTreeView());
}
