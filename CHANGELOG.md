# Changelog

# 0.2.2
- fixed restarting even if prompt cancelled by ESC, now it restarts only after clicking YES
- fixed commands showing up in command palette even if the extension was inactive
- added refresh functionality to the tree view

## 0.2.1
- fixed build bug

## 0.2.0
- added optional name to favourite commands
- favourite commands can now be partials and will prompt you for missing info
- using vscode tasks list to manage running rnv tasks
- if task is already running, gives an option to restart

## 0.1.0
- big code refactor
- adds commands to start, run, build, deploy to the Command Palette
- runs rnv as a task instead of manually manipulating terminal window
- added monitoring of running tasks and a command to stop them
- added favourite commands adjustable in settings

## 0.0.4
- adds configuration for runner (defaults to npx)

## 0.0.3
- adds right click to copy the command

## 0.0.2
- does not display hidden appConfigs in the tree vies
- runs rnv through npx

## 0.0.1
- initial version