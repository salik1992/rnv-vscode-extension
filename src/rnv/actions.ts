import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { Task } from './types';
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
