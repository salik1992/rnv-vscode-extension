import * as vscode from 'vscode';
import { Task, FavouriteTask } from './types';

export const taskToCommand = (task: Omit<Task, 'isTask'>) => {
    const configuration = vscode.workspace.getConfiguration('rnv');
    const runner = configuration.get<string>('runner');
    let command = runner === '' ? 'rnv' : `${runner} rnv`;
    command += ` ${task.command}`;
    command += ` -p ${task.platform}`;
    if (task.appConfig) command += ` -c ${task.appConfig}`;
    if (task.buildScheme) command += ` -s ${task.buildScheme}`;
    return command;
};

export const taskToName = (task: FavouriteTask) => {
    if (task.name) return task.name;
    let name = 'RNV';
    if (task.command) name += ` - ${task.command}`;
    if (task.platform) name += ` - ${task.platform}`;
    if (task.appConfig) name += ` - ${task.appConfig}`;
    if (task.buildScheme) name += ` - ${task.buildScheme}`;
    return name;
};

export const onlyRnvTasks = (execution: vscode.TaskExecution) => (
    execution.task.definition.type === 'rnv'
);
