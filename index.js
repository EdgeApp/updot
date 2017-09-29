#!/usr/bin/env node
/**
 * Created by paul on 7/10/17.
 */
const fs = require('fs-extra')
const childProcess = require('child_process')

const argv = process.argv
const mylog = console.log

const _workingDir = process.cwd()
let _currentPath = _workingDir
let _srcDir = '..'
let _forceDir = null

function ncpPromise (src, dest, opts) {
  return new Promise(function (resolve, reject) {
    fs.copy(src, dest, opts, function (err, data) {
      if (err !== null) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function chdir (path) {
  mylog('chdir: ' + path)
  _currentPath = path
}

function call (cmdstring) {
  mylog(cmdstring)
  const opts = {
    encoding: 'utf8',
    timeout: 3600000,
    stdio: 'inherit',
    cwd: _currentPath,
    killSignal: 'SIGKILL'
  }
  childProcess.execSync(cmdstring, opts)
}

function cmd (cmdstring) {
  mylog(cmdstring)
  const opts = {
    encoding: 'utf8',
    timeout: 3600000,
    cwd: _currentPath,
    killSignal: 'SIGKILL'
  }
  const r = childProcess.execSync(cmdstring, opts)
  return r
}

function hashCode(string){
  var hash = 0;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function arrayIntersect (a, b) {
  return a.filter(function (n) {
    return b.indexOf(n) !== -1
  })
}

if (argv.length > 2) {
  if (argv[2] === '-s') {
    _srcDir = argv[3]
    mylog('Source dir override: ' + _srcDir)
  } else {
    _forceDir = argv[2]
    console.log('Using forced dir:' + argv[2])
  }
}

const dotdot = cmd('ls -1 ' + _srcDir)
let dotdotArray = dotdot.split('\n')
const modules = cmd('ls -1 node_modules')
const modulesArray = modules.split('\n')

if (_forceDir) {
  dotdotArray = [_forceDir]
}
console.log('dotdotArray')
console.log(dotdotArray)
console.log('modulesArray')
console.log(modulesArray)
const result = arrayIntersect(dotdotArray, modulesArray)

// mylog(result)

let excludeFiles = [
  '/node_modules',
  '.git',
  '.idea',
  '.vscode',
  '.babelrc',
  '.eslintrc.json',
  '.flowconfig'
]

let packageJsonFiles

function filter (file) {
  // if (packageJsonFiles) {
  //   mylog('filter: packageJsonFiles:')
  //   mylog(packageJsonFiles)
  //   for (const n in packageJsonFiles) {
  //     const f = packageJsonFiles[n]
  //     const s = f.replace('*', '')
  //     if (file.includes('package.json')) {
  //       mylog('filter: ' + file + 'true 1')
  //       return true
  //     }
  //     if (file.includes(s)) {
  //       mylog('filter: ' + file + 'true 2')
  //       return true
  //     }
  //   }
  //   mylog('filter: ' + file + 'false 1')
  //   return false
  // } else
  {
    for (let f of excludeFiles) {
      if (file.includes(f)) {
        mylog('copy: ' + file + ' SKIP')
        return false
      }
    }
  }
  return true
}

mylog('Found intersecting repos:')
mylog(result)

let numReposWatched = 0

main()

async function main () {
  for (let dir of result) {
    if (dir.length === 0) {
      console.log('Skipping directory')
      continue
    }
    mylog('*********************************************************')
    mylog('*** Processing: ' + dir)
    mylog('*********************************************************')
    const source = _srcDir + '/' + dir
    const dest = 'node_modules/' + dir
    const opts = {
      filter
    }

    let requirePath
    if (source.substr(0, 1) === '/') {
      requirePath = source
    } else {
      requirePath = _workingDir + '/' + source
    }

    mylog('requirePath: ' + requirePath)

    const packageJson = require(requirePath + '/package.json')

    chdir(requirePath)
    if (typeof packageJson.scripts !== 'undefined') {
      if (typeof packageJson.scripts.prepare !== 'undefined') {
        call('npm run prepare')
      } else if (typeof packageJson.scripts.build !== 'undefined') {
        call('npm run build')
      }
    }

    chdir(_workingDir)
    // const packageJson = require('./package.json')
    if (typeof packageJson.files !== 'undefined') {
      mylog('Found package.json file Including only mentioned files')
      packageJsonFiles = packageJson.files
    } else {
      mylog('Excluding default files')
      packageJsonFiles = null
    }

    mylog('rm -rf ' + dest + '/')
    mylog('Copying ' + source + " to " + dest)

    try {
      await ncpPromise(source, dest, opts)
    } catch (e) {
      console.log('Error in ncpPromise:' + source + ' ' + dest)
      mylog(e)
    }
    console.log('**** Complete ' + dir + ' ****')
  }
}

