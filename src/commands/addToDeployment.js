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
const { getMetadataInfoFromPath } = require('../util');
module.exports = (sourceUris, context, outputChannel) => {
    const metadataInfoByFolderName = context.workspaceState.get('metadataInfoByFolderName');
    const deploymentMetadataByXmlName = context.workspaceState.get('deploymentMetadataByXmlName') || {};
    sourceUris.forEach((sourceUri) => {
        const { metadataName, xmlName } = getMetadataInfoFromPath(sourceUri.path, metadataInfoByFolderName);

        // if it's still not valid, show a warning message
        if (!metadataName) {
            vscode.window.showWarningMessage(
                `Warning: Unable to match the "${sourceUri.path}" to a valid metadata type.`
            );
            return;
        }

        // check if deployment already included or if all are selected
        if (!deploymentMetadataByXmlName[xmlName]) {
            deploymentMetadataByXmlName[xmlName] = [];
        } else if (deploymentMetadataByXmlName[xmlName] === '*') {
            vscode.window.showInformationMessage(`The deployment already includes all ${xmlName} metadata.`);
            return;
        }
        // add to the deployment
        if (!deploymentMetadataByXmlName[xmlName].includes(metadataName)) {
            deploymentMetadataByXmlName[xmlName].push(metadataName);
        }
    });
    context.workspaceState.update('deploymentMetadataByXmlName', deploymentMetadataByXmlName);
    viewDeployment(context, outputChannel);
    vscode.window.showInformationMessage(`Finished adding metadata to the deployment.`);
};
