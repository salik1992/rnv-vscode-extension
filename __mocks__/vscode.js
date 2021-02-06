// MARK: workspace
const getConfiguration = jest.fn(() => ({
    get: () => 'npx',
}));

// MARK: window

const showQuickPick = jest.fn((options) => Promise.resolve(options[0]));

// MARK: classes

class Task {
    constructor(definition, workspace, name, source, execution) {
        this.definition = definition;
        this.workspace = workspace;
        this.name = name;
        this.source = source;
        this.execution = execution;
    }
}

class ShellExecution {
    constructor(command) {
        this.command = command;
    }
}

// MARK: tasks

const executeTask = jest.fn();

// MARK: vscode mock

const mock = {
    Task,
    TaskScope: { Workspace: 'workspace' },
    ShellExecution,
    workspace: {
        getConfiguration,
    },
    window: {
        showQuickPick,
    },
    tasks: {
        executeTask,
        taskExecutions: [],
    }
};

module.exports = mock;
