/**
 *    Copyright 2020 Greg Lovelidge

 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
const vscode = require('vscode');
const exec = require('child_process');
const { YES, TEST_LEVEL_OPTIONS, YES_NO_OPTIONS } = require('../constants');
const { getAuthorizedOrgs } = require('../util');

module.exports = async (context, outputChannel) => {
    try {
        // get the deploy command arguments
        const deploymentMetadata = context.workspaceState.get('deploymentMetadata') || [];
        if (deploymentMetadata.length === 0) {
            throw new Error('There is no metadata in your deployment.');
        }
        const cmdArguments = await getDeployCmdArguments(deploymentMetadata);
        outputChannel.appendLine(cmdArguments.join(' '));
        outputChannel.show(true);
        // show the progress indicator while deploying
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Deploying metadata...',
                cancellable: true
            },
            (progress, token) => {
                return new Promise((resolve) => {
                    // execute the deploy command
                    const sfdx = exec.spawn('sfdx', cmdArguments, {
                        cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
                        shell: true
                    });
                    let isCancelled = false;
                    let buffer = '';

                    sfdx.stderr.on('data', (data) => {
                        let text = data.toString();

                        if (text.length > 0) {
                            buffer += '\n' + text;
                        }
                    });

                    sfdx.stdout.on('data', (data) => {
                        buffer += '\n' + data.toString();
                    });

                    sfdx.on('exit', (code) => {
                        if (isCancelled) {
                            vscode.window.showInformationMessage('Deployment Cancelled');
                        } else if (code === 1) {
                            vscode.window.showErrorMessage('Deployment Error. See the output log for details.');
                        } else {
                            vscode.window.showInformationMessage('Deployment Successful');
                        }
                        outputChannel.appendLine(buffer);
                        outputChannel.show(true);
                        resolve();
                    });

                    // handle canceling from the progress dialog
                    token.onCancellationRequested(() => {
                        sfdx.kill();
                        isCancelled = true;
                    });
                });
            }
        );
    } catch (error) {
        console.log('error', error);
        if (!error.message.includes('cancelled')) {
            vscode.window.showErrorMessage('Deployment Error: ' + error.message);
        }
    }
};

async function getDeployCmdArguments(deploymentMetadata) {
    // base arguments for the command
    const cmdArguments = ['force:source:deploy', '--json', '--loglevel', 'fatal'];

    const aliasOptions = [];

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Getting available target orgs...',
            cancellable: true
        },
        async (progress, token) => {
            const orgs = await getAuthorizedOrgs(token);
            orgs.forEach((org) => {
                if (org.isDefaultUsername) {
                    aliasOptions.unshift(org.alias || org.username);
                } else {
                    aliasOptions.push(org.alias || org.username);
                }
            });
        }
    );

    // ask the user to enter the username of the target org
    const targetUsername = await showQuickPick(aliasOptions, {
        placeHolder: 'Target Username/Alias. Leave blank to use the project default.'
    });

    // set the test level for the deployment
    const testLevel = await showQuickPick(TEST_LEVEL_OPTIONS, {
        placeHolder: 'Specify which level of deployment tests to run.'
    });
    // ask if check only
    const checkOnly = await showQuickPick(YES_NO_OPTIONS, {
        placeHolder: 'Validate only?'
    });

    // add the user defined params
    cmdArguments.push('-p', `"${deploymentMetadata.map((md) => md.fsPath).join(',')}"`);
    cmdArguments.push('-l', testLevel);
    if (checkOnly === YES) {
        cmdArguments.push('-c');
    }
    if ((targetUsername || '').length > 0) {
        cmdArguments.push('-u', targetUsername);
    }
    return cmdArguments;
}

/**
 * Show the vs code quick pick.
 *
 * @param {Array} items List of strings to show as options
 * @param {Object} quickPickOpts The options for the quick pick
 * @returns  {Promise<String>} The selected value.
 */
async function showQuickPick(items, quickPickOpts) {
    const result = await vscode.window.showQuickPick(items, quickPickOpts);
    if (result === undefined) {
        throw new Error('cancelled');
    }
    return result;
}
