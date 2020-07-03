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
const { getMetadataInfoFromPath, getMetadataInfo, getPathForDeployment } = require('../util');
const os = require('os');
const EOL = os.EOL;
module.exports = async (sourceUris, context, outputChannel) => {
    const metadataInfoByFolderName = await getMetadataInfo(context);
    const deploymentMetadata = context.workspaceState.get('deploymentMetadata') || [];
    const removedMetadata = [];
    sourceUris.forEach((sourceUri) => {
        // remove if there's an exact match
        const { metadataName, directoryName, isMetadataFolder } = getMetadataInfoFromPath(
            sourceUri,
            metadataInfoByFolderName
        );
        const fsPath = getPathForDeployment(sourceUri.fsPath, isMetadataFolder, directoryName, metadataName);
        const mdIndex = deploymentMetadata.findIndex((md) => md.fsPath === fsPath);
        if (mdIndex > -1) {
            removedMetadata.push(...deploymentMetadata.splice(mdIndex, 1));
            return;
        }

        // if it's still not valid, throw an error
        if (!metadataName) {
            vscode.window.showErrorMessage(
                `Error! Unable to match the selected metadata to a valid metadata type: ${sourceUri.fsPath}`
            );
            return;
        }

        // warn the user if removing an indidivual file but all metadata of this type is in the deployment
        if (!isMetadataFolder) {
            const includesAllMetadata = deploymentMetadata.some(
                (md) => md.directoryName === directoryName && md.isMetadataFolder
            );
            if (includesAllMetadata) {
                vscode.window.showWarningMessage(
                    `Warning! ${metadataName} was not removed. First, use the "Remove from Deployment" command on the ${directoryName} folder, then add the individual metadata items to the deployment.`
                );
                return;
            }
        }

        vscode.window.showInformationMessage(`${metadataName} isn't in the deployment.`);
    });

    // update the deployment
    if (removedMetadata.length > 0) {
        context.workspaceState.update('deploymentMetadata', deploymentMetadata);
        console.log(removedMetadata);
        outputChannel.appendLine(
            `${EOL}REMOVED METADATA ${EOL}${removedMetadata
                .map((md) => `${md.xmlName} - ${md.metadataName}`)
                .join(EOL)}`
        );
        vscode.window.showInformationMessage(`Removed metadata from the deployment`);
    }
};
