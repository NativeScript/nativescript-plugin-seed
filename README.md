# Develop a NativeScript plugin [![Build Status](https://travis-ci.org/NativeScript/nativescript-plugin-seed.svg?branch=master)](https://travis-ci.org/NativeScript/nativescript-plugin-seed)

> This repo is heavily based on [@NathanWalker](https://github.com/NathanWalker)'s [Plugin Seed](https://github.com/NathanWalker/nativescript-plugin-seed). Thanks Nathan!

<!-- vscode-markdown-toc -->
* [TL;DR](#TLDR)
* [Long Description](#LongDescription)
	* [What is NativeScript plugin seed?](#WhatisNativeScriptpluginseed)
	* [Plugin folder structure](#Pluginfolderstructure)
	* [Getting started](#Gettingstarted)
		* [Development setup](#Developmentsetup)
	* [Linking to CocoaPod or Android Arsenal plugins](#LinkingtoCocoaPodorAndroidArsenalplugins)
	* [Unittesting](#Unittesting)
	* [Publish to NPM](#PublishtoNPM)
	* [TravisCI](#TravisCI)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='TLDR'></a>TL;DR
The NativeScript plugin seed is built to be used as a starting point by NativeScript plugin developers. To bootstrap your plugin development execute the following:

1. `git clone https://github.com/NativeScript/nativescript-plugin-seed nativescript-yourplugin` where `nativescript--yourplugin` is the name of your plugin.
2. `cd nativescript-yourplugin/src`
3. `npm run postclone`
4. `npm run demo.ios` or `npm run demo.android` to run the demo.
5. In another command prompt/terminal `npm run plugin.tscwatch` to watch to typescript changes in the plugin and to autmatically apply them in the demo.

## <a name='LongDescription'></a>Long Description

### <a name='WhatisNativeScriptpluginseed'></a>What is NativeScript plugin seed?

The NativeScript plugin seed is built to be used as a starting point by NativeScript plugin developers. It expands on several things [presented here](http://developer.telerik.com/featured/creating-nativescript-plugins-in-typescript/).
What does the seed give you out of the box?
* the plugin structure with option for easy development and debugging (see [Development setup section](#Developmentsetup) below)
* a simple working plugin
* a demo project working with the plugin. It is useful during development and for running tests via Travis CI
* plugin tests
* a guideline how to structure your plugin README file that will be published to NPM
* a shell script to create your plugin package
* a proper `.gitignore` to keep GitHub tidy 
* a proper `.npmignore` to ensure everyone is happy when you publish your plugin to NPM.

![Plugin seed demo](https://github.com/NativeScript/nativescript-plugin-seed/blob/master/screenshots/demo.png?raw=true)

### <a name='Pluginfolderstructure'></a>Plugin folder structure 

|Folder/File name| Description
|---|---|
|demo| The plugin demo source code|
|demo/tests| The tests for your plugin|
|src| The plugin source code|
|src/platform/android| Plugin Android specific configuration|
|src/platform/ios|Plugin ios specific configuration|
|src/README|Your plugin README stub explaining how other developers can use your plugin in their applications. Used when you publish your plugin to NPM. On postclone step, the README in the root is replaced with this one.|
|src/scripts|The postclone script run when you execute `npm run postclone`. Feel free to delete it after you have executed the postclone step from the [Getting started](#Gettingstarted) section|
|publish|Contains a shell script to create and publish your package. Read more on creating a package and publishing in the [Publish to NPM](#Publishtonpm) section|

### <a name='Gettingstarted'></a>Getting started

1. Open a command prompt/terminal and execute `git clone https://github.com/NativeScript/nativescript-plugin-seed nativescript-yourplugin` to clone the plugin seed repository into the `nativescript-yourplugin` folder  where `nativescript--yourplugin` is the name of your plugin..
2. Open a command prompt/terminal and navigate to `nativescript-yourplugin/src` folder using `cd nativescript-yourplugin/src`
3. Execute `npm run postclone` to:
    * configure your github username - it will be changed in the package.json for you
    * configure your plugin name - all files and classes in the seed will be renamed for you
    * stub your plugin README.md file
    * create a new repository for your plugin
    * npm link your plugin the demo app - this will install the plugin dependencies and will add a sym link to the plugin code in the demo project allowing you to do changes and review them in the demo without adding/removing the plugin every time you make a change. [Read more about npm link](https://docs.npmjs.com/cli/link). If you encounter an "EACCES" permission denied error, please fix you global npm permissions, which is perfectly explained [here](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

Now you can continue with the development of your plugin by using the [Development setup](#Developmentsetup) described below.

#### <a name='Developmentsetup'></a>Development setup
For easier development and debugging purposes continue with the following steps:

1. Open a command prompt/terminal, navigate to `src` folder and run `npm run demo.ios` or `npm run demo.android` to run the demo.
2. Open another command prompt/terminal, navigate to `src` folder and run `npm run plugin.tscwatch` to watch for file changes in your plugin.

Now go and make a change to your plugin. It will be automatically applied to the demo project.

NOTE: If you need to use a native library in your plugin or do some changes in Info.plist/AndroidManifest.xml, these cannot be applied to the demo project only by npm link. In such scenario you need to use `tns plugin add ../src` from the `demo` so that the native libraries and changes in the above mentioned files are applied in the demo. Then you can link again the code of your plugin in the demo by using `npm run plugin.link` from the `src`.

### <a name='LinkingtoCocoaPodorAndroidArsenalplugins'></a>Linking to CocoaPod or Android Arsenal plugins

You will want to create these folders and files in the `src` folder in order to use native APIs:

```
platforms --
  ios --
    Podfile
  android --
    include.gradle
```

Doing so will open up those native apis to your plugin :)

Take a look at these existing plugins for how that can be done very simply:

* [nativescript-cardview](https://github.com/bradmartin/nativescript-cardview/tree/master/platforms)
* [nativescript-floatingactionbutton](https://github.com/bradmartin/nativescript-floatingactionbutton/tree/master/platforms)


### <a name='Unittesting'></a>Unittesting
The plugin seed automatically adds Jasmine-based unittest support to your plugin.
Open `demo/app/tests/tests.js` and adjust its contents so the tests become meaningful in the context of your plugin and its features.

You can read more about this topic [here](https://docs.nativescript.org/tooling/testing).

Once you're ready to test your plugin's API go to `src` folder and execute one of these commands:

```
npm run test.ios
npm run test.android
```

### <a name='PublishtoNPM'></a>Publish to NPM

When you have everything ready to publish:

* Bump the version number in `src/package.json`
* Go to `publish` and execute `publish.sh` (run `chmod +x *.sh` if the file isn't executable)

If you just want to create a package, go to `publish` folder and execute `pack.sh`. The package will be created in `publish/package` folder.

**NOTE**: To run bash script on Windows you can install [GIT SCM](https://git-for-windows.github.io/) and use Git Bash.

### <a name='TravisCI'></a>TravisCI

The plugin structure comes with fully functional .travis.yml file that deploys the testing app on Android emulator nad iOS simulator and as a subsequent step runs the tests from [UnitTesting section](#Unittesting). All you have to do, after cloning the repo and implementing your plugin and tests, is to sign up at [https://travis-ci.org/](https://travis-ci.org/). Then enable your plugin's repo on "https://travis-ci.org/profile/<your github user\>" and that's it. Next time a PR is opened or change is commited to a branch TravisCI will trigger a build testing the code.

To properly show current build status you will have to edit the badge at the start of the README.md file so it matches your repo, user and branch. 
