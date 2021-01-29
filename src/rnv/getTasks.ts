import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Config, Platform, RawConfig, RnvConfig, TaskByPlatform } from './types';

const cwd = (() => {
    if (!vscode.workspace.workspaceFolders) return __dirname;
    return vscode.workspace.workspaceFolders[0].uri.toString().replace('file:', '');
})();


const getConfigs = async (rnvConfig: RnvConfig): Promise<Record<string, RawConfig>> => new Promise(
    (resolve) => {
        const configsRoot = path.resolve(cwd, rnvConfig?.paths?.appConfigsDir ?? 'appConfigs');
        fs.readdir(configsRoot, (err, dirs) => {
            if (err) throw err;
            const configs: Record<string, RawConfig> = {};
            dirs.forEach((dir) => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const config: RawConfig = require(
                        path.resolve(configsRoot, dir, 'renative.json'),
                    );
                    configs[config.id ?? dir] = config;
                } catch (e) {
                    console.log('Ignoring config ', dir);
                }
            });
            resolve(configs);
        });
    },
);

const parsePlatforms = ({ platforms }: Config | RawConfig): Record<string, Platform> => {
    const parsedPlatforms: Record<string, Platform> = {};
    if (!platforms) return {};
    Object.entries(platforms).forEach(([platform, { schemes, buildSchemes }]) => {
        parsedPlatforms[platform] = {
            schemes: schemes ?? Object.keys(buildSchemes ?? {}),
        };
    });
    return parsedPlatforms;
};

const mergePlatforms = (config: Config | RawConfig, configToExtend: Config | RawConfig | null) => {
    const platforms = parsePlatforms(config);
    if (configToExtend === null) return platforms;
    const platformsToExtend = parsePlatforms(configToExtend);
    Object.keys(platformsToExtend).forEach((platform) => {
        if (!platforms[platform]) {
            platforms[platform] = platformsToExtend[platform];
        } else {
            platformsToExtend[platform].schemes.forEach((scheme) => {
                console.log(scheme);
                if (platforms[platform].schemes.indexOf(scheme) === -1) {
                    console.log('pushing');
                    platforms[platform].schemes.push(scheme);
                }
            });
        }
    });
    return platforms;
};

const isRawConfig = (config: Config | RawConfig): config is RawConfig => (
    Object.prototype.hasOwnProperty.call(config, 'id')
);

const parseConfig = (
    config: Config | RawConfig, configs: Record<string, Config | RawConfig>,
): Config => {
    const configToExtend = isRawConfig(config) && typeof config.extend !== 'undefined'
        ? parseConfig(configs[config.extend], configs)
        : null;
    return {
        platforms: mergePlatforms(config, configToExtend),
    };
};

const parseConfigs = (configs: Record<string, Config | RawConfig>): Record<string, Config> => {
    const parsedConfigs: Record<string, Config> = {};
    Object.entries(configs).forEach(([configName, config]) => {
        if (isRawConfig(config) && config.hidden) return;
        parsedConfigs[configName] = parseConfig(config, configs);
    });
    return parsedConfigs;
};

const getTasksByPlatform = (
    configs: Record<string, Config>,
): TaskByPlatform => {
    const TASKS = ['start', 'run', 'build', 'deploy'];
    const tasksByPlatform: TaskByPlatform = {};
    Object.entries(configs).forEach(([configName, config]) => {
        const { platforms } = config;
        Object.entries(platforms).forEach(([platformName, platform]) => {
            if (!tasksByPlatform[platformName]) {
                tasksByPlatform[platformName] = {};
            }
            if (!tasksByPlatform[platformName][configName]) {
                tasksByPlatform[platformName][configName] = {};
            }
            const { schemes } = platform;
            schemes.forEach((scheme) => {
                tasksByPlatform[platformName][configName][scheme] = {};
                TASKS.forEach((task) => {
                    tasksByPlatform[platformName][configName][scheme][task] = {
                        platform: platformName,
                        appConfig: configName,
                        buildScheme: scheme,
                        action: task,
                        isTask: true,
                    };
                });
            });
        });
    });
    return tasksByPlatform;
};

const buildTasks = async () => {
    let rnvConfig: RnvConfig;
    let configs: Record<string, Config | RawConfig> = {};
    try {
         rnvConfig = require(path.resolve(cwd, 'renative.json'));
    } catch (e) {
        console.error('Could not get renative.json');
        return {};
    }
    try {
        configs = await getConfigs(rnvConfig);
    } catch (e) {
        console.error('Could not get config files', e);
        return {};
    }
    const parsedConfigs = parseConfigs(configs);
    const tasksByPlatform = getTasksByPlatform(parsedConfigs);
    return tasksByPlatform;
};

export const getTasks = async () => new Promise<TaskByPlatform>((resolve) => {
    fs.stat(path.resolve(cwd, 'renative.json'), async (err, stats) => {
        if (err) {
            vscode.window.showErrorMessage('renative.json not found');
            resolve({});
        }
        if (!stats || !stats.isFile()) {
            vscode.window.showErrorMessage('renative.json is not a file');
            resolve({});
        }
        const tasks = await buildTasks();
        resolve(tasks);
    });
});