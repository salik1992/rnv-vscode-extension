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
    command += ` ${task.command}`;
    command += ` -p ${task.platform}`;
    if (task.appConfig) command += ` -c ${task.appConfig}`;
    if (task.buildScheme) command += ` -s ${task.buildScheme}`;
    return command;
};

const taskToName = (task: Task) => {
    let name = `RNV - ${task.command} - ${task.platform}`;
    if (task.appConfig) name += ` - ${task.appConfig}`;
    if (task.buildScheme) name += ` - ${task.buildScheme}`;
    return name;
};

export const launch = async (task?: Task) => {
    if (!task) return;
    const name = taskToName(task);
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

const askForTask = async (command: string): Promise<Task | null> => {
    const platforms = await getTasks();
    const platform = await ask(Object.keys(platforms), 'PLATFORM');
    if (platform === null) return null;
    const appConfigs = platforms[platform];
    const appConfig = await ask(Object.keys(appConfigs), 'APP CONFIG');
    if (appConfig === null) return null;
    const buildSchemes = appConfigs[appConfig];
    const buildScheme = await ask(Object.keys(buildSchemes), 'BUILD SCHEME');
    if (buildScheme === null) return null;
    return { command, platform, appConfig, buildScheme, isTask: true };
};

const askAndLaunch = async (command: string) => {
    const task = await askForTask(command);
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

export const favourite = async () => {
    const configuration = vscode.workspace.getConfiguration('rnv');
    const favourites = configuration.get<Task[]>('favourites');
    if (!favourites || favourites.length === 0) {
        vscode.window.showInformationMessage('Please define your favourite commands in settings!');
        return;
    }
    const tasksByName: Record<string, Task> = {};
    favourites.forEach((task) => {
        tasksByName[taskToName(task)] = task;
    });
    const taskName = await ask(favourites.map(taskToName), 'CHOOSE A CONFIGURATION');
    if (taskName === null) return;
    launch(tasksByName[taskName]);
};
