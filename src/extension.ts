import * as vscode from 'vscode';
import { RNVTasksTreeView } from './rnv/view';
import { launch, copy } from './rnv/actions';

export function activate() {
    vscode.commands.registerCommand('extension.rnv.launch', launch);
    vscode.commands.registerCommand('extension.rnv.copy', copy);
    vscode.window.registerTreeDataProvider('rnv', new RNVTasksTreeView());
}
