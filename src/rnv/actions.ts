import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { COMMANDS, FavouriteTask, Task } from './types';
import { RNVTreeItem } from './view';

const runningTasks: Record<string, vscode.TaskExecution> = {};

vscode.tasks.onDidEndTask((event) => {
    const { name } = event.execution.task;
    if (runningTasks[name]) delete runningTasks[name];
});

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

const taskToName = (task: FavouriteTask) => {
    if (task.name) return task.name;
    let name = 'RNV';
    if (task.command) name += ` - ${task.command}`;
    if (task.platform) name += ` - ${task.platform}`;
    if (task.appConfig) name += ` - ${task.appConfig}`;
    if (task.buildScheme) name += ` - ${task.buildScheme}`;
    return name;
};

export const launch = async (task?: Omit<Task, 'isTask'>) => {
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
    ) ?? { label: undefined }).label
);

const askForTask = async (command: string): Promise<Task | undefined> => {
    const platforms = await getTasks();
    const platform = await ask(Object.keys(platforms), 'PLATFORM');
    if (!platform) return;
    const appConfigs = platforms[platform];
    const appConfig = await ask(Object.keys(appConfigs), 'APP CONFIG');
    if (!appConfig) return;
    const buildSchemes = appConfigs[appConfig];
    const buildScheme = await ask(Object.keys(buildSchemes), 'BUILD SCHEME');
    if (!buildScheme) return;
    return { command, platform, appConfig, buildScheme, isTask: true };
};

const askAndLaunch = async (command: string) => {
    const task = await askForTask(command);
    if (!task) return;
    launch(task);
};

export const start = () => askAndLaunch('start');
export const run = () => askAndLaunch('run');
export const build = () => askAndLaunch('build');
export const deploy = () => askAndLaunch('deploy');

export const stop = async () => {
    const name = await ask(Object.keys(runningTasks), 'TASK TO STOP');
    if (!name) return;
    const execution = runningTasks[name];
    if (!execution) return;
    execution.terminate();
};

const unsupportedConfiguration = () => {
    vscode.window.showErrorMessage('This configuration is not supported in the current project');
};

export const favourite = async () => {
    const configuration = vscode.workspace.getConfiguration('rnv');
    const favourites = configuration.get<Task[]>('favourites');
    if (!favourites || favourites.length === 0) {
        vscode.window.showInformationMessage('Please define your favourite commands in settings!');
        return;
    }
    const tasksByName: Record<string, FavouriteTask> = {};
    favourites.forEach((task) => {
        tasksByName[taskToName(task)] = task;
    });
    const taskName = await ask(favourites.map(taskToName), 'CHOOSE A CONFIGURATION');
    if (!taskName) return;
    const task = tasksByName[taskName];
    if (!task.command) task.command = await ask(COMMANDS, 'WHAT SHOULD RNV DO');
    const platforms = await getTasks();
    if (!task.platform) task.platform = await ask(Object.keys(platforms), 'PLATFORM');
    if (!task.platform) return;
    const appConfigs = platforms[task.platform];
    if (!task.appConfig) task.appConfig = await ask(Object.keys(appConfigs), 'APP CONFIG');
    if (!task.appConfig) return;
    if (!appConfigs[task.appConfig]) {
        unsupportedConfiguration();
        return;
    }
    const buildSchemes = appConfigs[task.appConfig];
    if (!task.buildScheme) task.buildScheme = await ask(Object.keys(buildSchemes), 'BUILD SCHEME');
    if (!task.buildScheme) return;
    if (!buildSchemes[task.buildScheme]) {
        unsupportedConfiguration();
        return;
    }
    launch(task as Task);
};
