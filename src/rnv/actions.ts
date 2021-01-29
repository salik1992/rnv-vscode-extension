import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { Task, TaskByPlatform } from './types';
import { RNVTreeItem } from './view';

export const taskToCommand = (task: Task) => {
    const configuration = vscode.workspace.getConfiguration('rnv');
    const runner = configuration.get<string>('runner');
    let command = runner === '' ? 'rnv' : `${runner} rnv`;
    command += ` ${task.action}`;
    command += ` -p ${task.platform}`;
    if (task.appConfig) command += ` -c ${task.appConfig}`;
    if (task.buildScheme) command += ` -s ${task.buildScheme}`;
    return command;
};

export const launch = (task?: Task) => {
    const terminal = vscode.window.createTerminal({
        name: 'RNV',
    });
    terminal.show();
    terminal.sendText(
        task
            ? taskToCommand(task)
            : 'npx rnv --help',
    );
};

export const copy = (item: RNVTreeItem) => {
    // Only final item tasks can run this command
    vscode.env.clipboard.writeText(taskToCommand(item.data as unknown as Task));
};
