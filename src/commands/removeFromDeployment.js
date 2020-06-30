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
        const { metadataName, xmlName, directoryName } = getMetadataInfoFromPath(
            sourceUri.path,
            metadataInfoByFolderName
        );

        // if it's still not valid, throw an error
        if (!metadataName) {
            vscode.window.showErrorMessage(
                `Error! Unable to match the selected metadata to a valid metadata type: ${sourceUri.path}`
            );
            return;
        }

        // warn the user if removing an indidivual file but all metadata of this type is in the deployment
        const metadataList = deploymentMetadataByXmlName[xmlName] || [];
        if (metadataList === '*') {
            vscode.window.showWarningMessage(
                `Warning! ${metadataName} was not removed. First, use the "Remove from Deployment" command on the ${directoryName} folder, then add the individual metadata items to the deployment.`
            );
            return;
        }

        // remove from the deployment
        if (metadataList.includes(metadataName)) {
            deploymentMetadataByXmlName[xmlName] = metadataList.filter((md) => md !== metadataName);
            // remove the metadata type if the list is empty
            if (deploymentMetadataByXmlName[xmlName].length === 0) {
                delete deploymentMetadataByXmlName[xmlName];
            }
        } else {
            vscode.window.showInformationMessage(`${metadataName} isn't in the deployment.`);
        }
    });

    // update the deployment
    context.workspaceState.update('deploymentMetadataByXmlName', deploymentMetadataByXmlName);
    viewDeployment(context, outputChannel);
    vscode.window.showInformationMessage(`Finished removing metadata to the deployment.`);
};
