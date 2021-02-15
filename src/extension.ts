import * as vscode from 'vscode';
import { RNVTasksTreeView } from './rnv/view';
import { launch } from './rnv/runner';
import { copy, start, build, run, deploy, stop, favourite } from './rnv/actions';

export function activate() {
    vscode.commands.executeCommand('setContext', 'rnv:isActive', true);
    const rnvTreeView = new RNVTasksTreeView();
    vscode.commands.registerCommand('extension.rnv.launch', launch);
    vscode.commands.registerCommand('extension.rnv.copy', copy);
    vscode.commands.registerCommand('extension.rnv.start', start);
    vscode.commands.registerCommand('extension.rnv.run', run);
    vscode.commands.registerCommand('extension.rnv.build', build);
    vscode.commands.registerCommand('extension.rnv.deploy', deploy);
    vscode.commands.registerCommand('extension.rnv.stop', stop);
    vscode.commands.registerCommand('extension.rnv.favourite', favourite);
    vscode.commands.registerCommand('extension.rnv.refreshTree', rnvTreeView.refresh, rnvTreeView);
    vscode.window.registerTreeDataProvider('rnv', rnvTreeView);
}
