# updot

Copy dependencies from repos in the ../ folder to the current repo's node_modules. This is useful for development on dependent modules in a React Native project as `npm link` is broken in React Native.

Script will search in all folders at the peer level to the current project that `dotdotdep` is installed in and compare the folder name to all the folders in `node_modules`. if any match, it will call `npm run build` in that peer level folder then copy its contents into the same folder name in node_modules. If will first `rm -rf` the destination folder in `node_modules`. The contents in the source folder that it will copy will be either:

1. Files that match the `package.json` `files` array.
 or if there is no `files` array in `package.json`
2. All files excluding

   [ '/node_modules',
  '.git',
  '.idea',
  '.vscode',
  '.babelrc',
  '.eslintrc.json',
  '.flowconfig' ]

## To use

    npm install updot --save-dev

Then add a line to your `scripts` section 

    "updot": "updot",

To update the node_modules

    npm run updot

## Options

Change the source directory by passing a directory path as an argument after `-s`

    "updot": "updot -s ../../myotherfolder",

Updot only a single dependency

    npm run updot -- edge-currency-bitcoin