import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { RNVTreeItem } from './view';
import { launch } from './runner';
import { onlyRnvTasks, taskToCommand, taskToName } from './utils';
import { COMMANDS, FavouriteTask, Task } from './types';

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
    const runningTasks = vscode.tasks.taskExecutions.filter(onlyRnvTasks);
    const taskToStop = await vscode.window.showQuickPick(
        runningTasks.map((execution) => ({ label: execution.task.name, execution })),
        { canPickMany: false, placeHolder: 'Task to stop' },
    );
    if (!taskToStop) return;
    const { execution } = taskToStop;
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
    const task = { ...tasksByName[taskName] }; // It is important to get new reference here
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
