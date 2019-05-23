var fs = require('fs');
var prompt = require('prompt');
var rimraf = require('rimraf');
var exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const pathModule = require("path");

var class_name,
    inputParams = {
        plugin_name: undefined,
        github_username: undefined,
        init_git: undefined,
        include_javascript_demo: undefined,
        include_typescript_demo: undefined,
        include_angular_demo: undefined,
        include_vue_demo: undefined
    },
    seed_plugin_name = "yourplugin",
    seed_class_name = "YourPlugin",
    seed_demo_property_name = "yourPlugin",
    seed_github_username = "YourName",
    tsAppName = "demo",
    angularAppName = "demo-angular",
    // vueAppName = "demo-vue",
    demoTsFolder = "../" + tsAppName,
    demoAngularFolder = "../" + angularAppName,
    // demoVueFolder = "../" + vueAppName,
    screenshots_dir = "../screenshots",
    seed_tests_dir = "../seed-tests",
    scripts_dir = "scripts",
    filesToReplace = {
        readmeFile: {
            source: "README.md",
            destination: "../README.md"
        },
        travisFile: {
            source: ".travis.yml",
            destination: "../.travis.yml"
        }
    },
    appsToCreate = [],
    appsToInstallPluginIn = [],
    demoTsSearchTerm = ".bindingContext =",
    demoAngularSearchTerm = 'templateUrl: "app.component.html"',
    demoVueSearchTerm = '<Page class="page">',
    preDefinedInclude = [
        "../src",
        "**/*"
    ],
    preDefinedExclude = [
        "../src/node_modules",
        "node_modules",
        "platforms"
    ],
    preDefinedPaths = [
        {
            key: "*",
            value: [
                "./node_modules/*"
            ]
        }
    ],
    appNamePlaceholderStr = "appNamePlaceholder",
    pluginNamePlaceholderStr = "pluginNamePlaceholder",
    appPathPlaceholderStr = "appPathPlaceholder",
    removeAddPluginCommand = "cd appNamePlaceholder && tns plugin remove pluginNamePlaceholder && tns plugin add ../src",
    removeAddPluginCommandPlaceholderStr = "removeAddPluginCommandPlaceholder",
    cleanAppsScriptPlaceholderStr = "cleanAppsScriptPlaceholder",
    preDefinedAppScripts = [
        {
            key: "appNamePlaceholder.ios",
            value: "npm run tsc && cd appPathPlaceholder && tns run ios --syncAllFiles --emulator"
        },
        {
            key: "appNamePlaceholder.android",
            value: "npm run tsc && cd appPathPlaceholder && tns run android --syncAllFiles --emulator"
        }],
    preDefinedPrepareScript =
    {
        key: "plugin.prepare",
        value: "npm run build removeAddPluginCommandPlaceholder"
    },
    preDefinedResetScript = {
        key: "appNamePlaceholder.reset",
        value: "cd appPathPlaceholder && npx rimraf -- hooks node_modules platforms package-lock.json"
    },
    preDefinedCleanScript = {
        key: "clean",
        value: "cleanAppsScriptPlaceholder && npx rimraf -- node_modules package-lock.json && npm i",
    };

console.log('NativeScript Plugin Seed Configuration');

// Expected order: `gitHubUsername` `pluginName` `initGit` `includeTypeScriptDemo` `includeAngularDemo`
// Example: gitHubUsername=PluginAuthor pluginName=myPluginClassName initGit=n includeTypeScriptDemo=y includeAngularDemo=n
var parseArgv = function () {
    var argv = Array.prototype.slice.call(process.argv, 2);
    var result = {};
    argv.forEach(function (pairString) {
        var pair = pairString.split('=');
        result[pair[0]] = pair[1];
    });

    return result;
};
var argv = parseArgv();

if (argv) {
    inputParams.github_username = argv.gitHubUsername;
    inputParams.plugin_name = argv.pluginName;
    inputParams.init_git = argv.initGit;
    inputParams.include_typescript_demo = argv.includeTypeScriptDemo;
    inputParams.include_angular_demo = argv.includeAngularDemo;
    // inputParams.include_vue_demo = argv.includeVueDemo;
}

if (!isInteractive() && (!inputParams.github_username || !inputParams.plugin_name || !inputParams.init_git || !inputParams.include_typescript_demo || !inputParams.include_angular_demo)) {
    console.log("Using default values for plugin creation since your shell is not interactive.");
    inputParams.github_username = "PluginAuthor";
    inputParams.plugin_name = "myPluginClassName";
    inputParams.init_git = "y";
    inputParams.include_typescript_demo = "y";
    inputParams.include_angular_demo = "n";
    // inputParams.include_vue_demo = "n";
}

askGithubUsername();

function askGithubUsername() {
    if (inputParams.github_username !== undefined) {
        askPluginName();
    } else {
        prompt.start();
        prompt.get({
            name: 'github_username',
            description: 'What is your GitHub username (used for updating package.json)? Example: NathanWalker'
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }
            if (!result.github_username) {
                return console.log("Your GitHub username is required to configure plugin's package.json.");
            }
            inputParams.github_username = result.github_username;
            askPluginName();
        });
    }
}

function askPluginName() {
    if (inputParams.plugin_name !== undefined) {
        generateClassName();
    } else {
        prompt.get({
            name: 'plugin_name',
            description: 'What will be the name of your plugin? Use lowercase characters and dashes only. Example: yourplugin / google-maps / bluetooth'
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }
            if (!result.plugin_name) {
                return console.log("Your plugin name is required to correct the file names and classes.");
            }

            inputParams.plugin_name = result.plugin_name;

            if (inputParams.plugin_name.startsWith("nativescript-")) {
                inputParams.plugin_name = inputParams.plugin_name.replace("nativescript-", "");
            }

            generateClassName();
        });
    }
}

function askTypeScriptDemo() {
    if (inputParams.include_typescript_demo !== undefined) {
        askAngularDemo();
    } else {
        prompt.start();
        prompt.get({
            name: 'include_typescript_demo',
            description: 'Do you want to include a "TypeScript NativeScript" application linked with your plugin to make development easier (y/n)?',
            default: 'y'
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }

            inputParams.include_typescript_demo = result.include_typescript_demo;
            askAngularDemo();
        });
    }
}

function askAngularDemo() {
    if (inputParams.include_angular_demo !== undefined) {
        // askVueDemo();
        createDemoAppsFromTemplates();
    } else {
        prompt.start();
        prompt.get({
            name: 'include_angular_demo',
            description: 'Do you want to include an "Angular NativeScript" application linked with your plugin to make development easier (y/n)?',
            default: 'n'
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }

            inputParams.include_angular_demo = result.include_angular_demo;
            // askVueDemo();
            createDemoAppsFromTemplates();
        });
    }
}

// function askVueDemo() {
//     if (inputParams.include_vue_demo !== undefined) {
//         createDemoAppsFromTemplates();
//     } else {
//         prompt.start();
//         prompt.get({
//             name: 'include_vue_demo',
//             description: 'Do you want to include a "Vue NativeScript" application linked with your plugin to make development easier (y/n)?',
//             default: 'n'
//         }, function (err, result) {
//             if (err) {
//                 return console.log(err);
//             }

//             inputParams.include_vue_demo = result.include_vue_demo;
//             createDemoAppsFromTemplates();
//         });
//     }
// }

function createDemoAppsFromTemplates() {
    if (inputParams.include_typescript_demo && inputParams.include_typescript_demo.toLowerCase() === "y") {
        appsToCreate.push({
            command: "cd ../ && tns create " + tsAppName + " --template tns-template-blank-ts && cd " + tsAppName + " && cd ../src/",
            successMessage: "TypeScript-NativeScript application created at: " + demoTsFolder,
            type: "TypeScript"
        });
        appsToInstallPluginIn.push(demoTsFolder);
    }

    if (inputParams.include_angular_demo && inputParams.include_angular_demo.toLowerCase() === "y") {
        appsToCreate.push({
            command: "cd ../ && tns create " + angularAppName + " --template tns-template-blank-ng && cd " + angularAppName + " && cd ../src/",
            successMessage: "Angular-NativeScript application created at: " + demoAngularFolder,
            type: "Angular"
        });
        appsToInstallPluginIn.push(demoAngularFolder);
    }

    // if (inputParams.include_vue_demo && inputParams.include_vue_demo.toLowerCase() === "y") {
    //     appsToCreate.push({
    //         command: "cd ../ && tns create " + vueAppName + " --vue && cd " + vueAppName + " && cd ../src/",
    //         successMessage: "Vue-NativeScript application created at: /demo-vue",
    //         type: "Vue"
    //     });
    //     appsToInstallPluginIn.push(demoVueFolder);
    // }

    let appObject = appsToCreate.pop();
    if (appObject) {
        console.log("Creating '" + appObject.type + "' application from latest template ...");
        startProcess(appObject);
    } else {
        adjustScripts();
    }
}

function startProcess(commandAndMessage) {
    let mainChildProcess = spawn(commandAndMessage.command, [], { stdio: 'inherit', shell: true, detached: false });
    mainChildProcess.on("close", function (code, signal) {
        if (commandAndMessage.successMessage) {
            console.log(commandAndMessage.successMessage);
        }

        if (appsToCreate.length == 0) {
            adjustScripts();
        } else {
            let appObject = appsToCreate.pop();
            console.log("Creating '" + appObject.type + "' application from latest template ...");
            startProcess(appObject);
        }
    });
}

function generateClassName() {
    // the class_name becomes 'GoogleMaps' when plugin_name is 'google-maps'
    class_name = "";
    var plugin_name_parts = inputParams.plugin_name.split("-");
    for (var p in plugin_name_parts) {
        var part = plugin_name_parts[p];
        class_name += (part[0].toUpperCase() + part.substr(1));
    }
    console.log('Using ' + class_name + ' as the TypeScript Class name..');
    renameFiles();
}

function renameFiles() {
    console.log('Will now rename some files..');
    var files = fs.readdirSync(".");
    for (var f in files) {
        var file = files[f];
        if (file.indexOf(seed_plugin_name) === 0) {
            var newName = inputParams.plugin_name + file.substr(file.indexOf("."));
            fs.renameSync(file, newName);
        }
    }

    askTypeScriptDemo();
}

function adjustScripts() {
    console.log('Adjusting scripts..');

    // add all files in the root
    var files = fs.readdirSync(".");

    // add include.gradle
    files.push("platforms/android/include.gradle");

    // add the demo files
    let demoAppPath = pathModule.join(demoTsFolder + "/app/home/");
    if (fs.existsSync(demoAppPath)) {
        files.push(demoTsFolder + "/package.json");
        var demoFiles = fs.readdirSync(demoAppPath);
        for (var d in demoFiles) {
            var demoFile = demoFiles[d];
            files.push(demoAppPath + demoFile);
        }

        updateAppsTsConfigFile(pathModule.resolve(__dirname, pathModule.join("../" + demoTsFolder)));
    }

    // add the demo-angular files
    let demoAngularAppPath = pathModule.join(demoAngularFolder + "/src/app/");
    if (fs.existsSync(demoAngularAppPath)) {
        files.push(demoAngularFolder + "/package.json");
        var demoFiles = fs.readdirSync(demoAngularAppPath);
        for (var d in demoFiles) {
            var demoFile = demoFiles[d];
            files.push(demoAngularAppPath + demoFile);
        }

        updateAppsTsConfigFile(pathModule.resolve(__dirname, pathModule.join("../" + demoAngularFolder)));

    }

    // add the demo-angular files
    // let demoVueAppPath = path.join(demoVueFolder + "/app/components/");
    // if (fs.existsSync(demoVueAppPath)) {
    //     files.push(demoVueFolder + "/package.json");
    //     var demoFiles = fs.readdirSync(demoVueAppPath);
    //     for (var d in demoFiles) {
    //         var demoFile = demoFiles[d];
    //         files.push(demoVueAppPath + demoFile);
    //     }
    //     updateAppsTsConfigFile(path.resolve(__dirname, path.join("../" + demoVueFolder)));
    // }

    // prepare and cache a few Regexp thingies
    var regexp_seed_plugin_name = new RegExp(seed_plugin_name, "g");
    var regexp_seed_class_name = new RegExp(seed_class_name, "g");
    var regexp_seed_demo_property_name = new RegExp(seed_demo_property_name, "g");
    var regexp_seed_github_username = new RegExp(seed_github_username, "g");

    for (var f in files) {
        var file = files[f];

        if (fs.lstatSync(file).isFile()) {
            var contents = fs.readFileSync(file, 'utf8');
            
            // Adds an 'import' and console.log() of the 'message' filed of 'nativescript-yourplugin' to the includes apps
            contents = file.includes(pathModule.join(demoTsFolder)) ? updateApp(contents, file, demoTsSearchTerm) : contents;
            contents = file.includes(pathModule.join(demoAngularFolder)) ? updateApp(contents, file, demoAngularSearchTerm) : contents;
            // contents = file.includes(pathModule.join(demoVueFolder)) ? updateDemoVueApp(contents, file) : contents;

            var result = contents.replace(regexp_seed_plugin_name, inputParams.plugin_name);
            result = result.replace(regexp_seed_class_name, class_name);
            result = result.replace(regexp_seed_demo_property_name, class_name[0].toLowerCase() + class_name.substr(1));
            result = result.replace(regexp_seed_github_username, inputParams.github_username);
            fs.writeFileSync(file, result);
        }
    }

    replaceFiles();
    updateSrcJson();
}

function updateAppsTsConfigFile(path) {
    let jsonPath = pathModule.join(path + "/tsconfig.json");
    let jsonFile = fs.readFileSync(jsonPath);
    let jsonObject = JSON.parse(jsonFile);
    var jsonInclude = ensureJsonArray(jsonObject["include"]);
    var newInclude = updateJsonArray(preDefinedInclude, jsonInclude);
    jsonObject["include"] = newInclude;
    var jsonExclude = ensureJsonArray(jsonObject["exclude"]);
    var newExclude = updateJsonArray(preDefinedExclude, jsonExclude);
    jsonObject["exclude"] = newExclude;

    var jsonPaths = ensureJsonArray(jsonObject["compilerOptions"])["paths"];
    var newPaths = updateObject(preDefinedPaths, jsonPaths);
    jsonObject["compilerOptions"]["paths"] = newPaths;

    fs.writeFileSync(jsonPath, JSON.stringify(jsonObject, null, "\t"));
}

function updateSrcJson() {
    let jsonPath = pathModule.join(pathModule.resolve(__dirname, "../") + "/package.json");
    let jsonFile = fs.readFileSync(jsonPath);
    let jsonObject = JSON.parse(jsonFile);
    var jsonScripts = ensureJsonArray(jsonObject["scripts"]);
    let pluginScripts = getPluginScripts();

    var newScripts = updateObject(pluginScripts, jsonScripts);
    jsonObject["scripts"] = newScripts;

    fs.writeFileSync(jsonPath, JSON.stringify(jsonObject, null, "\t"));
}

function getPluginScripts() {
    let scripts = [];
    let prepareScriptCommand;
    let clearScriptResetCommands = [];
    let pluginName = `nativescript-` + inputParams.plugin_name;
    if (inputParams.include_typescript_demo === "y") {
        preDefinedAppScripts.forEach((script) => {
            scripts.push(
                {
                    key: script.key.replace(appNamePlaceholderStr, tsAppName),
                    value: script.value.replace(appPathPlaceholderStr, demoTsFolder)
                });
        });
        let resetScriptKey = preDefinedResetScript.key.replace(appNamePlaceholderStr, tsAppName);
        scripts.push({
            key: resetScriptKey,
            value: preDefinedResetScript.value.replace(appPathPlaceholderStr, demoTsFolder)
        });

        clearScriptResetCommands.push(resetScriptKey);

        let updatedRemoveAddPluginCommand = removeAddPluginCommand.replace(appNamePlaceholderStr, demoTsFolder);
        prepareScriptCommand = "&& " + updatedRemoveAddPluginCommand.replace(pluginNamePlaceholderStr, pluginName);
    }

    if (inputParams.include_angular_demo === "y") {
        preDefinedAppScripts.forEach((script) => {
            scripts.push(
                {
                    key: script.key.replace(appNamePlaceholderStr, angularAppName),
                    value: script.value.replace(appPathPlaceholderStr, demoAngularFolder)
                });
        });

        let resetScriptKey = preDefinedResetScript.key.replace(appNamePlaceholderStr, angularAppName);
        scripts.push({
            key: resetScriptKey,
            value: preDefinedResetScript.value.replace(appPathPlaceholderStr, demoAngularFolder)
        });

        clearScriptResetCommands.push(resetScriptKey);

        let updatedRemoveAddPluginCommand = removeAddPluginCommand.replace(appNamePlaceholderStr, demoAngularFolder);
        prepareScriptCommand += " && " + updatedRemoveAddPluginCommand.replace(pluginNamePlaceholderStr, pluginName);
    }

    if (inputParams.include_vue_demo) {
        preDefinedAppScripts.forEach((script) => {
            scripts.push(
                {
                    key: script.key.replace(appNamePlaceholderStr, demoVueFolder),
                    value: script.value.replace(appPathPlaceholderStr, demoVueFolder)
                });
        });

        let resetScriptKey = preDefinedResetScript.key.replace(appNamePlaceholderStr, angularAppName);
        scripts.push({
            key: resetScriptKey,
            value: preDefinedResetScript.value.replace(appPathPlaceholderStr, demoAngularFolder)
        });

        clearScriptResetCommands.push(resetScriptKey);

        let updatedRemoveAddPluginCommand = removeAddPluginCommand.replace(appNamePlaceholderStr, demoVueFolder);
        prepareScriptCommand += " && " + updatedRemoveAddPluginCommand.replace(pluginNamePlaceholderStr, pluginName);
    }

    scripts.push({
        key: preDefinedPrepareScript.key,
        value: preDefinedPrepareScript.value.replace(removeAddPluginCommandPlaceholderStr, prepareScriptCommand)
    });

    let fullAppResetCommand = "";
    clearScriptResetCommands.forEach((tag) => {
        fullAppResetCommand += fullAppResetCommand.length === 0 ? "npm run " + tag : " && npm run " + tag;
    });

    scripts.push({
        key: preDefinedCleanScript.key,
        value: preDefinedCleanScript.value.replace(cleanAppsScriptPlaceholderStr, fullAppResetCommand)
    });

    

    return scripts;
}

function updateJsonArray(newValues, oldValues) {
    newValues.forEach((value) => {
        if (!oldValues.includes(value)) {
            oldValues.push(value);
        }
    });

    return oldValues;
}

function updateObject(newObjects, oldObjects) {
    newObjects.forEach((script) => {
        oldObjects[script.key] = script.value;
    });

    return oldObjects;
}

function ensureJsonArray(jsonSection) {
    if (!jsonSection) {
        return [];
    }

    return jsonSection;
}

function updateApp(contents, file, searchTerm) {
    if (contents.includes(searchTerm)) {
        let fullPluginName = `'nativescript-` + inputParams.plugin_name + `'`;
        console.log("Updating " + file + " with " + fullPluginName + " import .");
        let typeScriptImportSnippet = `import { ` + class_name + ` } from ` + fullPluginName + `;\n`,
            typeScriptAlertSnippet = `console.log(new ` + class_name + `().message);\n`;
        contents = typeScriptAlertSnippet + contents;
        contents = typeScriptImportSnippet + contents;
    }

    return contents;
}

// function updateDemoVueApp(contents, file) {
//     if (contents.includes(demoVueSearchTerm)) {
//         let pluginName = `'nativescript-`+ inputParams.plugin_name + `'`;
//         console.log("Updating " + file + " with " + pluginName + " import");
//         let typeScriptImportSnippet = `import { ` + class_name + ` } from ` + pluginName + `;\n`,
//             typeScriptAlertSnippet = `console.log(new ` + class_name + `().message);\n`;
//         // contents = typeScriptAlertSnippet + contents;
//         // contents = typeScriptImportSnippet + contents;
//         // TODO: insert this after the <script> tag on the next line
//     }

//     return contents;
// }

function askInitGit() {
    if (inputParams.init_git !== undefined) {
        initGit();
    } else {
        prompt.get({
            name: 'init_git',
            description: 'Do you want to init a fresh local git project? If you previously \'git clone\'d this repo that would be wise (y/n)',
            default: 'y'
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }

            inputParams.init_git = result.init_git;
            initGit();
        });
    }
}

function replaceFiles() {
    for (key in filesToReplace) {
        var file = filesToReplace[key];
        var contents = fs.readFileSync(file.source);
        fs.writeFileSync(file.destination, contents);
        fs.unlinkSync(file.source);
    }

    addPluginToDemoApps();
}

function addPluginToDemoApps() {
    if (appsToInstallPluginIn.length > 0) {
        let appToInstallIn = appsToInstallPluginIn.pop();
        console.log("Installing plugin to " + appToInstallIn + " ...");
        exec("cd " + appToInstallIn + " && tns plugin add ../src", function (err, stdout, stderr) {
            if (err) {
                console.log(err);
            } else {
                if (appsToInstallPluginIn.length == 0) {
                    rimraf(screenshots_dir, function () {
                        console.log('Screenshots removed.');
                        rimraf(seed_tests_dir, function () {
                            console.log('Seed tests removed.');

                            // delete postclone.js
                            rimraf.sync('../CONTRIBUTING.md');
                            rimraf.sync('../CODE_OF_CONDUCT.md');
                            rimraf.sync(scripts_dir + '/postclone.js');

                            askInitGit();
                        });
                    });
                } else {
                    addPluginToDemoApps();
                }
            }
        });
    } else {
        askInitGit();
    }
}

function isInteractive() {
	const result = isRunningInTTY() && !isCIEnvironment();
	return result;
}

/**
 * Checks if current process is running in Text Terminal (TTY)
 */
function isRunningInTTY() {
	return process.stdout &&
		process.stdout.isTTY &&
		process.stdin &&
		process.stdin.isTTY;
}

function isCIEnvironment() {
	// The following CI environments set their own environment variables that we respect:
	//  travis: "CI",
	//  circleCI: "CI",
	//  jenkins: "JENKINS_HOME"

	return !!(process.env && (process.env.CI || process.env.JENKINS_HOME));
}

function initGit() {
    if (inputParams.init_git && inputParams.init_git.toLowerCase() === 'y') {
        rimraf.sync('../.git');
        exec('git init -q ..', function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                finishSetup();
            } else {
                exec("git add \"../*\" \"../.*\"", function (err, stdout, stderr) {
                    if (err) {
                        console.log(err);
                    }
                    finishSetup();
                });
            }
        });
    } else {
        finishSetup();
    }
}

function finishSetup() {
    console.log("Configuration finished! If you're not happy with the result please clone the seed again and start over.");
    console.log("Visit the NativeScript documentation for detailed steps on how to proceed from here.");
    console.log("https://docs.nativescript.org/plugins/building-plugins#step-2-set-up-a-development-workflow");

    process.exit();
}