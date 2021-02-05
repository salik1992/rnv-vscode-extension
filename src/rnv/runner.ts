import * as vscode from 'vscode';
import { taskToCommand, taskToName } from './utils';
import { Task } from './types';

type RunnableTask = Omit<Task, 'isTask'>;

const SHOULD_RESTART = 'This task is already running. Do you wish to restart it?';
const YES = 'YES';
const NO = 'NO';

const isCommandEqual = (command: string) => (execution: vscode.TaskExecution) => (
    execution.task.source === command
);

const run = (command: string, name: string, task: RunnableTask) => {
    vscode.tasks.executeTask(new vscode.Task(
        { type: 'rnv', ...task },
        vscode.TaskScope.Workspace,
        name,
        command,
        new vscode.ShellExecution(command)
    ));
};

export const launch = async (task?: RunnableTask) => {
    if (!task) return;
    const name = taskToName(task);
    const command = taskToCommand(task);
    const runningTask = vscode.tasks.taskExecutions.find(isCommandEqual(command));
    if (runningTask) {
        const shouldRestart = await vscode.window.showQuickPick(
            [YES, NO],
            { canPickMany: false, placeHolder: SHOULD_RESTART },
        );
        if (shouldRestart === NO) return;
        runningTask.terminate();
    }
    run(command, name, task);
};