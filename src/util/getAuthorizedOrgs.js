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
const exec = require('child_process');
const vscode = require('vscode');
module.exports = (token) => {
    try {
        return new Promise((resolve, reject) => {
            const sfdx = exec.spawn('sfdx', ['force:org:list', '--json'], {
                cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
                shell: true
            });
            let buffer = '';
            sfdx.stderr.on('data', (data) => {
                let text = data.toString();
                if (text.length > 0) {
                    buffer += text;
                }
            });

            sfdx.stdout.on('data', (data) => {
                buffer += data.toString();
            });

            sfdx.on('exit', (code) => {
                // Handle the result + errors (i.e. the text in "buffer") here.
                if (code === 1) {
                    vscode.window.showErrorMessage('There was a problem getting the list of authorized orgs.');
                    reject(buffer);
                } else {
                    const parsedBuffer = buffer.slice(buffer.indexOf('{'), buffer.lastIndexOf('}') + 1);
                    const response = JSON.parse(parsedBuffer) || {};
                    const orgList = [];
                    if (response.result) {
                        orgList.push(...response.result.nonScratchOrgs);
                        orgList.push(...response.result.scratchOrgs);
                    }
                    resolve(orgList);
                }
            });

            // handle canceling from the progress dialog
            token.onCancellationRequested(() => {
                sfdx.kill();
                vscode.window.showInformationMessage('Deployment Cancelled');
            });
        });
    } catch (error) {
        vscode.window.showErrorMessage(error.message);
    }
};
