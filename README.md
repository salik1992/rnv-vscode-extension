# ReNative VSCode Extension
This extension tries to make your life easier to work with ReNative on a daily basis by providing you
some clickable tools that will ease up your command line work.

## ReNative platforms x appConfigs x buildSchemes x commands Tree View
It adds a **ReNative** section into the Explorer tab where it lists all available combinations of
your launchable configurations in an easy-to-navigate tree view.

## Commands in Command Palette 
It adds a command for each of rnv's start, run, build and deploy commands. Running these commands
from VSCode command palette will prompt you for platform, appConfig and buildScheme, and providing
you the options to choose from, of course.

## Favourite commands
Allows you to define you favourite commands to run. Head into settings to start adding your commands.
Favourite commands are stored as an array of objects in settings:

Each command should have at least one of these keys. The rest will be prompted.
- name: optional name of the configuration to display in the prompt menu (will be generated otherwise)
- command: rnv command (start, run, etc.)
- platform: platform to work with (same as -p parameter of rnv)
- appConfig: appConfig to use (same as -c parameter of rnv)
- buildScheme: buildScheme to use (same as -s parameter or rnv)

```ts
{
    "rnv.favourites": [
        {   // will launch "rnv start -p web -c base -s debug"
            "name": "Start base web",
            "command": "start",
            "platform": "web",
            "appConfig": "base",
            "buildScheme": "debug"
        },
        {   // will prompt you for appConfig and will launch "rnv start -p web -c [prompted:appConfig] -s debug"
            "name": "Start web",
            "command": "start",
            "platform": "web",
            "buildScheme": "debug"
        }
    ]
}
```

## Configurable runner
Allows you to prepend `rnv` with a runner (defaults to recommended `npx`).
