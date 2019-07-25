const { exec } = require('child_process');
const semver = require('semver');

exec('tns --version', (err, stdout, stderr) => {
    if (err) {
        // node couldn't execute the command
        console.log(`tns --version err: ${err}`);
        return;
    }

    // In case the current Node.js version is not supported by CLI, a warning in `tns --version` output is shown.
    // Sample output:
    //
    /*Support for Node.js ^8.0.0 is deprecated and will be removed in one of the next releases of NativeScript. Please, upgrade to the latest Node.js LTS version.

    6.0.0
    */
    // Extract the actual version (6.0.0) from it.
    const tnsVersion = semver.major((stdout.match(/^(?:\d+\.){2}\d+.*?$/m) || [])[0]);

    // execute 'tns plugin build' for {N} version > 4. This command builds .aar in platforms/android folder.
    if (tnsVersion >= 4) {
        console.log(`executing 'tns plugin build'`);
        exec('tns plugin build', (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
                console.log(`${err}`);
                return;
            }
        });
    }
});
