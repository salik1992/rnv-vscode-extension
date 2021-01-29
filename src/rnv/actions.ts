import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { Task } from './types';
import { RNVTreeItem } from './view';

const runningTasks: Record<string, vscode.TaskExecution> = {};

vscode.tasks.onDidEndTask((event) => {
    const { name } = event.execution.task;
    if (runningTasks[name]) delete runningTasks[name];
});

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

export const launch = async (task?: Task) => {
    if (!task) return;
    const { action, platform, appConfig, buildScheme } = task;
    const name = `RNV - ${action} - ${platform} - ${appConfig} - ${buildScheme}`;
    if (runningTasks[name]) {
        vscode.window.showErrorMessage('This task is already running!');
        return;
    }
    const command = taskToCommand(task);
    const execution = await vscode.tasks.executeTask(new vscode.Task(
        { type: 'rnv', ...task },
        vscode.TaskScope.Workspace,
        name,
        command,
        new vscode.ShellExecution(command)
    ));
    runningTasks[name] = execution;
};

export const copy = (item: RNVTreeItem) => {
    // Only final item tasks can run this command
    vscode.env.clipboard.writeText(taskToCommand(item.data as unknown as Task));
};

const ask = async (picks: string[], placeHolder: string) => (
    (await vscode.window.showQuickPick(
        picks.map((label) => ({ label })),
        { canPickMany: false, placeHolder }
    ) ?? { label: null }).label
);

const askForTask = async (action: string): Promise<Task | null> => {
    const platforms = await getTasks();
    const platform = await ask(Object.keys(platforms), 'PLATFORM');
    if (platform === null) return null;
    const appConfigs = platforms[platform];
    const appConfig = await ask(Object.keys(appConfigs), 'APP CONFIG');
    if (appConfig === null) return null;
    const buildSchemes = appConfigs[appConfig];
    const buildScheme = await ask(Object.keys(buildSchemes), 'BUILD SCHEME');
    if (buildScheme === null) return null;
    return { action, platform, appConfig, buildScheme, isTask: true };
};

const askAndLaunch = async (action: string) => {
    const task = await askForTask(action);
    if (task === null) return;
    launch(task);
};

export const start = () => askAndLaunch('start');
export const run = () => askAndLaunch('run');
export const build = () => askAndLaunch('build');
export const deploy = () => askAndLaunch('deploy');

export const stop = async () => {
    const name = await ask(Object.keys(runningTasks), 'TASK TO STOP');
    if (name === null) return;
    const execution = runningTasks[name];
    if (!execution) return;
    execution.terminate();
};
