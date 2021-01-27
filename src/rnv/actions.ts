import * as vscode from 'vscode';
import { Task } from "./types";
import { RNVTask } from './view';

const dataToCommand = (data: Task) => {
    const configuration = vscode.workspace.getConfiguration('rnv');
    const runner = configuration.get<string>('runner');
    return `${runner === '' ? '' : `${runner} `}rnv ${data.task} -p ${data.platform} -c ${data.config} -s ${data.scheme}`;
};

export const launch = (data?: Task) => {
    const terminal = vscode.window.createTerminal({
        name: 'RNV',
    });
    terminal.show();
    terminal.sendText(
        data
            ? dataToCommand(data)
            : 'npx rnv --help',
    );
};

export const copy = (item: RNVTask) => {
    // Only final item tasks can run this command
    vscode.env.clipboard.writeText(dataToCommand(item.data as unknown as Task));
};
