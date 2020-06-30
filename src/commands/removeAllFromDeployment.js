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
const viewDeployment = require('./viewDeployment');
module.exports = (sourceUri, context, outputChannel) => {
    const splitPath = sourceUri.path.split('/');
    const metadataInfoByFolderName = context.workspaceState.get('metadataInfoByFolderName');
    const deploymentMetadataByXmlName = context.workspaceState.get('deploymentMetadataByXmlName') || {};
    // the directory name is the last item
    let directoryName = splitPath[splitPath.length - 1];
    if (!metadataInfoByFolderName[directoryName]) {
        // if it's still not valid, throw an error
        vscode.window.showErrorMessage(
            `Error! Unable to match the selected metadata to a valid metadata type: ${sourceUri.path}`
        );
        return;
    }

    const metadataInfo = metadataInfoByFolderName[directoryName];
    const xmlName = metadataInfo.xmlName;
    // add to the package
    delete deploymentMetadataByXmlName[xmlName];
    context.workspaceState.update('deploymentMetadataByXmlName', deploymentMetadataByXmlName);
    vscode.window.showInformationMessage(`Removed all ${xmlName} from the deployment.`);
    viewDeployment(context, outputChannel);
};
