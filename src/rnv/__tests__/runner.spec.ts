// @ts-ignore
import * as vscodeMock from '../../../__mocks__/vscode';
import { launch } from '../runner';
import { taskToCommand, taskToName } from '../utils';

const command = 'start';
const platform = 'tizen';
const appConfig = 'basic_720';
const buildScheme = 'debug';

describe('Runner', () => {
    describe('launch', () => {
        const task = { command, platform, appConfig, buildScheme };

        afterEach(() => {
            vscodeMock.tasks.taskExecutions = [];
            vscodeMock.tasks.executeTask.mockReset();
        });

        it('should call executeTask', () => {
            launch(task);
            expect(vscodeMock.tasks.executeTask).toHaveBeenCalled();
        });

        it('should call executeTask with vscode.Task', () => {
            launch(task);
            expect(vscodeMock.tasks.executeTask.mock.calls[0][0]).toBeInstanceOf(vscodeMock.Task);
        });

        it('should prepare a Task with proper parameters', () => {
            launch(task);
            const passedTask = vscodeMock.tasks.executeTask.mock.calls[0][0];
            expect(passedTask.definition).toEqual({
                type: 'rnv', ...task,
            });
            expect(passedTask.workspace).toBe('workspace');
            expect(passedTask.name).toBe(taskToName(task));
            expect(passedTask.source).toBe(taskToCommand(task));
            expect(passedTask.execution).toBeInstanceOf(vscodeMock.ShellExecution);
            expect(passedTask.execution.command).toBe(taskToCommand(task));
        });

        it('should ask for a restart if the task is running', () => {
            launch(task);
            vscodeMock.tasks.taskExecutions.push(
                { task: vscodeMock.tasks.executeTask.mock.calls[0][0] }
            );
            launch(task);
            expect(vscodeMock.window.showQuickPick).toHaveBeenCalledWith(
                ['YES', 'NO'], expect.any(Object),
            );
        });

        it('should terminate the previous execution when answer to restart is YES', async () => {
            await launch(task);
            const terminate = jest.fn();
            vscodeMock.tasks.taskExecutions.push(
                { task: vscodeMock.tasks.executeTask.mock.calls[0][0], terminate }
            );
            vscodeMock.window.showQuickPick.mockReturnValueOnce('YES');
            await launch(task);
            expect(terminate).toHaveBeenCalled();
        });

        it('should not terminate the previous execution when answer to restart is NO', async () => {
            await launch(task);
            const terminate = jest.fn();
            vscodeMock.tasks.taskExecutions.push(
                { task: vscodeMock.tasks.executeTask.mock.calls[0][0], terminate }
            );
            vscodeMock.window.showQuickPick.mockReturnValueOnce('NO');
            await launch(task);
            expect(terminate).not.toHaveBeenCalled();
        });
    });
});
