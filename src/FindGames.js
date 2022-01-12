const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let blacklist = ['UnityCrashHandler64.exe', 'ProjectZomboid32.exe']

export function FindGames(basePaths) {
    var output = [];
    for (let i = 0; i < basePaths.length; i++) {
        // Get contents of base path
        var files = fs.readdirSync(basePaths[i]);
        // Check base path for exe file
        var breakValue = false;
        for(var j = 0; j < files.length; j++) {
            // Get path to the checking file
            let testForExe = path.resolve(basePaths[i], files[j]);
            if(path.extname(testForExe) == '.exe') {
                output.push([files[j], testForExe]);
                breakValue = true;
                break;
            }
        }
        // If path was found break the loop
        if(breakValue) {
            continue;
        }
        // Otherwise loop over each of the folders in the directory
        files.forEach(function (file) {
            let newPath = path.resolve(basePaths[i], file);
            let stat = fs.lstatSync(newPath);
            if (stat.isDirectory()) {
                var executable = FindExeHelper(newPath);
                if (executable != null) {
                    output.push([file, executable]);
                }
            }
        });
    }
    return output;
}

function FindExeHelper(directory) {
    var files = fs.readdirSync(directory);
    var directories = [];

    for (let i = 0; i < files.length; i++) {
        if (blacklist.includes(files[i])) {
            continue;
        }
        let filePath = path.resolve(directory, files[i]);
        let stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
            directories.push(filePath);
            continue;
        }
        if (path.extname(filePath) === '.exe') {
            return filePath;
        }
    }
    for (var i = 0; i < directories.length; i++) {
        let executable = FindExeHelper(directories[i]);
        if (executable != null) {
            return executable;
        }
    }
    return null;
}

export function LaunchGame(gamePath) {
    let gamePathSplit = gamePath.split('\\' || '/');
    for (var i = 0; i < gamePathSplit.length; i++) {
        if (gamePathSplit[i].includes(' ')) {
            gamePathSplit[i] = '"' + gamePathSplit[i] + '"';
        }
    }
    gamePath = gamePathSplit.join('/');
    if(gamePath.includes("Team Fortress 2")) {
        gamePath += " -game tf -windowed -noborder -sv_pure 0 -Viewmodel_fov 90";
    }
    cp.exec(gamePath, (error, stdout, stderr) => {
        if (error) {
            console.log("ERROR: " + error.message);
        }
        if (stderr) {
            console.log("STDERR: " + stderr)
        }
        console.log("STDOUT: " + stdout);
    });
}