import * as vscode from 'vscode';
import { RNVTasksTreeView } from './rnv/view';
import { launch, copy, start, build, run, deploy, stop } from './rnv/actions';

export function activate() {
    vscode.commands.registerCommand('extension.rnv.launch', launch);
    vscode.commands.registerCommand('extension.rnv.copy', copy);
    vscode.commands.registerCommand('extension.rnv.start', start);
    vscode.commands.registerCommand('extension.rnv.run', run);
    vscode.commands.registerCommand('extension.rnv.build', build);
    vscode.commands.registerCommand('extension.rnv.deploy', deploy);
    vscode.commands.registerCommand('extension.rnv.stop', stop);
    vscode.window.registerTreeDataProvider('rnv', new RNVTasksTreeView());
}
