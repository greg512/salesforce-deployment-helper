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
const { addToDeployment, removeFromDeployment, deployMetadata, viewDeployment } = require('./commands');
const { getSourceFiles } = require('./util');
let outputChannel;
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    try {
        outputChannel = vscode.window.createOutputChannel('Salesforce Deployment Helper');
        // Add to Deployment command
        let addToDeploymentCmd = vscode.commands.registerCommand('sfdh.addToDeployment', async (sourceUri) => {
            // set uri as the active editor there is one
            if (!sourceUri) {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId !== 'forcesourcemanifest') {
                    sourceUri = editor.document.uri;
                }
            }
            const sourceUris = await getSourceFiles(sourceUri, 'Add to Deployment');
            addToDeployment(sourceUris, context, outputChannel);
        });

        // Add Multiple Files to Deployment command
        let addMultipleToDeploymentCmd = vscode.commands.registerCommand('sfdh.addMultipleToDeployment', async () => {
            const sourceUris = await getSourceFiles(undefined, 'Add to Deployment');
            addToDeployment(sourceUris, context, outputChannel);
        });

        // Remove from Deployment command
        let removeFromDeploymentCmd = vscode.commands.registerCommand(
            'sfdh.removeFromDeployment',
            async (sourceUri) => {
                const sourceUris = await getSourceFiles(sourceUri, 'Remove from Deployment');
                removeFromDeployment(sourceUris, context, outputChannel);
            }
        );

        // Deploy command
        let deployMetadataCmd = vscode.commands.registerCommand('sfdh.deploy', function () {
            deployMetadata(context, outputChannel);
        });

        // Clear deployment command
        let clearDeployMetadataCmd = vscode.commands.registerCommand('sfdh.clearDeployment', function () {
            context.workspaceState.update('deploymentMetadata', []);
            vscode.window.showInformationMessage(`Removed all metadata from the deployment.`);
        });

        // View deployment command
        let viewDeploymentCmd = vscode.commands.registerCommand('sfdh.viewDeployment', () => {
            viewDeployment(context, outputChannel);
        });

        context.subscriptions.push(
            addToDeploymentCmd,
            addMultipleToDeploymentCmd,
            removeFromDeploymentCmd,
            deployMetadataCmd,
            clearDeployMetadataCmd,
            viewDeploymentCmd
        );

        vscode.commands.executeCommand('setContext', 'sfdh:project_opened', true);
    } catch (error) {
        vscode.window.showErrorMessage(`Error! ${error}`);
    }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    vscode.commands.executeCommand('setContext', 'sfdh:project_opened', false);
    // dispose the channel
    if (outputChannel && outputChannel.dispose) {
        outputChannel.dispose();
    }
    // clear the metadata info from workplace state
    context.workspaceState.update('deploymentMetadata', null);
}

module.exports = {
    activate,
    deactivate
};
