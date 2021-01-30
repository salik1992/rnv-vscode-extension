export type RnvConfig = {
    paths?: {
        appConfigsDir?: string,
    },
};

export type RawPlatform = {
    buildSchemes?: Record<string, any>
}

export type Platform = {
    schemes: string[],
};

export type RawConfig = {
    id: string,
    hidden?: boolean,
    extend?: string,
    platforms?: Record<string, RawPlatform>,
}

export type Config = {
    platforms: Record<string, Platform>,
};

export type Task = {
    isTask: true,
    appConfig?: string,
    platform: string,
    buildScheme?: string,
    command: string,
};

export type TaskByTaskName = Record<string, Task>;
export type TaskByScheme = Record<string, TaskByTaskName>;
export type TaskByConfig = Record<string, TaskByScheme>;
export type TaskByPlatform = Record<string, TaskByConfig>;
