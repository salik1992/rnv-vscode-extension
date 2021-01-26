import { platform } from 'os';
import { PerformanceObserver } from 'perf_hooks';
import * as vscode from 'vscode';
import { getTasks } from './getTasks';
import { TaskByConfig, TaskByPlatform, TaskByScheme, TaskByTaskName } from './types';

type AnyTask = TaskByPlatform | TaskByConfig | TaskByScheme | TaskByTaskName;

const isFinalTask = (data: AnyTask): data is TaskByTaskName => !!data.isTask;

export class RNVTasksTreeView implements vscode.TreeDataProvider<RNVTask> {
    getTreeItem(element: RNVTask): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RNVTask): Thenable<RNVTask[]> {
        if (!element) {
            return new Promise((resolve) => {
                getTasks().then((tasks) => {
                    resolve(Object.entries(tasks).map(([platformName, platform]) => (
                        new RNVTask(
                            platformName,
                            platform,
                            vscode.TreeItemCollapsibleState.Collapsed,
                        )
                    )));
                });
            });
        } else {
            const { data } = element;
            return Promise.resolve(Object.entries(data!).map(([label, data]) => (
                new RNVTask(
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

class RNVTask extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly data: AnyTask,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.description = this.label;
        if (isFinalTask(data)) {
            this.command = {
                title: this.label,
                command: 'extension.rnv.launch',
                arguments: [data],
            };
        }
    }
}
