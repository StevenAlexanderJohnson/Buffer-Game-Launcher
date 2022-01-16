const cp = require('child_process');
const fs = require('fs');
const path = require('path');
// const fetch = require('node-fetch');
import fetch from 'node-fetch';

let blacklist = ['UnityCrashHandler64.exe', 'ProjectZomboid32.exe']

export function FindGames(basePaths) {
    var output = [];
    for (let i = 0; i < basePaths.length; i++) {
        // Get contents of base path
        var files = fs.readdirSync(basePaths[i]);
        // Check base path for exe file
        var breakValue = false;
        for (var j = 0; j < files.length; j++) {
            // Get path to the checking file
            let testForExe = path.resolve(basePaths[i], files[j]);
            if (path.extname(testForExe) == '.exe') {
                output.push([files[j], testForExe]);
                breakValue = true;
                break;
            }
        }
        // If path was found break the loop
        if (breakValue) {
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
    if (gamePath.includes('hl2.exe')) {
        gamePathSplit.pop();
        gamePath = gamePathSplit.join('/') + '/steam_appid.txt';
        let appId = fs.readFileSync(gamePath).toString();
        while (gamePathSplit[gamePathSplit.length - 1] != 'Steam' && gamePathSplit.length != 0) {
            gamePathSplit.pop();
        }
        if (gamePathSplit.length == 0) {
            console.log("error");
            return;
        }
        let steamLaunch = gamePathSplit.join('/');
        try {
            cp.exec('steam.exe -applaunch ' + appId, { cwd: steamLaunch, env: process.env }, function (stdout, stderr) {
                if (stderr) {
                    console.log("WRAPPERSTDERR: " + stderr)
                }
                console.log("WRAPPERSTDOUT: " + stdout);
            })
        }
        catch (e) {
            console.log(e);
        }
        return;
    }

    for (let i = 0; i < gamePathSplit.length; i++) {
        if (gamePathSplit[i].includes(' ')) {
            gamePathSplit[i] = '"' + gamePathSplit[i] + '"';
        }
    }
    gamePath = gamePathSplit.join('/');
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

export function TestLaunchGame(gamePath) {
    let gamePathSplit = gamePath.split(/[\\+/]/);
    // Handles steam games
    if (gamePath.includes('Steam')) {
        // Use the steam api to get the list of game objects 
        // app: {appid:integer, name:""}
        fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
            .then(response => response.json())
            .then((data) => {
                let apps = data.applist.apps;
                // Get the name of the steam name by folder name
                let gameName = gamePathSplit[gamePathSplit.length - 2];
                // Iterate through the returned list and find the game by name
                for (let i = 0; i < apps.length; i++) {
                    if (apps[i].name === gameName) {
                        // Get the path to the steam directory by removing the executable, game file, common, and steamapps
                        while (gamePathSplit[gamePathSplit.length - 1] != 'Steam') {
                            gamePathSplit.pop();
                        }
                        // If for some reason the steam game is in a incorrect folder break the function
                        if (gamePathSplit.length == 0) {
                            console.log("ERROR FINDING STEAM")
                            return;
                        }
                        let steamPath = gamePathSplit.join('/');
                        // Execute the app through the steam launcher, setting current working directory to the steam path, and let the 
                        // environment be the same ass the process
                        let game = cp.exec('steam.exe -applaunch ' + apps[i].appid, { cwd: steamPath, env: process.env }, function (stdout, stderr) {
                            if (stderr) {
                                console.log("WRAPPERSTDERR: " + stderr)
                            }
                            console.log("WRAPPERSTDOUT: " + stdout);
                        });
                        game.on('close', function() {
                            console.log("closed");
                        });
                        return;
                    }
                }
            });
        return;
    }
    gamePath = '"' + gamePathSplit.join('/') + '"';
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