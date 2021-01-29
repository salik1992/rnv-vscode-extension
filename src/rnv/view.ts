import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { TaskByConfig, TaskByPlatform, TaskByScheme, TaskByTaskName } from './types';

type AnyTask = TaskByPlatform | TaskByConfig | TaskByScheme | TaskByTaskName;

const isFinalTask = (data: AnyTask): data is TaskByTaskName => !!data.isTask;

export class RNVTasksTreeView implements vscode.TreeDataProvider<RNVTreeItem> {
    getTreeItem(element: RNVTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RNVTreeItem): Thenable<RNVTreeItem[]> {
        if (!element) {
            return getTasks().then((tasks) => (
                Object.entries(tasks).map(([platformName, platform]) => (
                    new RNVTreeItem(
                        platformName,
                        platform,
                        vscode.TreeItemCollapsibleState.Collapsed,
                    )
                )))
            );
        } else {
            const { data } = element;
            return Promise.resolve(Object.entries(data!).map(([label, data]) => (
                new RNVTreeItem(
                    label,
                    data,
                    isFinalTask(data)
                        ? vscode.TreeItemCollapsibleState.None
                        : vscode.TreeItemCollapsibleState.Collapsed,
                )
            )));
        }
    }
}

export class RNVTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly data: AnyTask,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.description = isFinalTask(data)
            ? `rnv ${data.action} -p ${data.platform} -c ${data.appConfig} -s ${data.buildScheme}`
            : '';
        if (isFinalTask(data)) {
            this.command = {
                title: this.label,
                command: 'extension.rnv.launch',
                arguments: [data],
            };
            this.contextValue = 'rnvLaunch';
        }
    }
}
