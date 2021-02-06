import * as vscode from 'vscode';
// @ts-ignore
import * as vscodeMock from '../../../__mocks__/vscode';
import { FavouriteTask, Task } from '../types';
import { taskToCommand, taskToName, onlyRnvTasks } from '../utils';

const platform = 'tizen';
const appConfig = 'basic_720';
const buildScheme = 'debug';
const command = 'start';

describe('Utils', () => {
    describe('onlyRnvTasks', () => {
        it('should filter out not rnv tasks', () => {
            const EXECUTIONS = [
                { task: { definition: { type: 'rnv' } } },
                { task: { definition: { type: 'npm' } } },
                { task: { definition: { type: 'rnv' } } },
                { task: { definition: { type: 'shell' } } },
            ] as unknown as vscode.TaskExecution[];
            const filtered = EXECUTIONS.filter(onlyRnvTasks);
            expect(filtered).toHaveLength(2);
            expect(filtered.map((e) => e.task.definition.type).join(',')).toBe('rnv,rnv');
        });
    });

    describe('taskToName', () => {
        it('should return the name if present in the task', () => {
            const task: FavouriteTask = {
                name: 'Test task', platform, appConfig, buildScheme, command,
            };
            expect(taskToName(task)).toBe(task.name);
        });

        it('should generate name from a full task', () => {
            const task: FavouriteTask = { platform, appConfig, buildScheme, command };
            expect(taskToName(task)).toBe(
                `RNV - ${command} - ${platform} - ${appConfig} - ${buildScheme}`,
            );
        });

        it('should generate name without a command', () => {
            const task: FavouriteTask = { platform, appConfig, buildScheme };
            expect(taskToName(task)).toBe(
                `RNV - ${platform} - ${appConfig} - ${buildScheme}`,
            );
        });

        it('should generate name without a platform', () => {
            const task: FavouriteTask = { appConfig, buildScheme, command };
            expect(taskToName(task)).toBe(
                `RNV - ${command} - ${appConfig} - ${buildScheme}`,
            );
        });

        it('should generate name without an appConfig', () => {
            const task: FavouriteTask = { platform, buildScheme, command };
            expect(taskToName(task)).toBe(
                `RNV - ${command} - ${platform} - ${buildScheme}`,
            );
        });

        it('should generate name without a buildScheme', () => {
            const task: FavouriteTask = { platform, appConfig, command };
            expect(taskToName(task)).toBe(
                `RNV - ${command} - ${platform} - ${appConfig}`,
            );
        });
    });

    describe('taskToCommand', () => {
        it('should generate a command using default runner', () => {
            const task: Omit<Task, 'isTask'> = {
                command, platform, appConfig, buildScheme,
            };
            expect(taskToCommand(task)).toBe(
                `npx rnv ${command} -p ${platform} -c ${appConfig} -s ${buildScheme}`
            );
        });

        it('should generate a command using a custom runner', () => {
            const task: Omit<Task, 'isTask'> = {
                command, platform, appConfig, buildScheme,
            };
            vscodeMock.workspace.getConfiguration.mockReturnValueOnce({ get: () => 'runner' });
            expect(taskToCommand(task)).toBe(
                `runner rnv ${command} -p ${platform} -c ${appConfig} -s ${buildScheme}`
            );
        });

        it('should skip appConfig if not specified', () => {
            const task: Omit<Task, 'isTask'> = {
                command, platform, buildScheme,
            };
            expect(taskToCommand(task)).toBe(
                `npx rnv ${command} -p ${platform} -s ${buildScheme}`
            );
        });

        it('should skip buildScheme if not specified', () => {
            const task: Omit<Task, 'isTask'> = {
                command, platform, appConfig,
            };
            expect(taskToCommand(task)).toBe(
                `npx rnv ${command} -p ${platform} -c ${appConfig}`
            );
        });

        it('should skip appConfig and buildScheme if not specified', () => {
            const task: Omit<Task, 'isTask'> = {
                command, platform,
            };
            expect(taskToCommand(task)).toBe(
                `npx rnv ${command} -p ${platform}`
            );
        });
    });
});
