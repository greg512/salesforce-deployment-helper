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
const { getMetadataInfoFromPath, getMetadataInfo, getPathForDeployment } = require('../util');
const path = require('path');
module.exports = async (sourceUris, context, outputChannel) => {
    const metadataInfoByFolderName = await getMetadataInfo(context);
    const deploymentMetadata = context.workspaceState.get('deploymentMetadata') || [];
    const newMetadata = [];
    sourceUris.forEach((sourceUri) => {
        // check if this metadata is already in the deployment
        const alreadyInDeployment = deploymentMetadata.some((md) => md.fsPath === sourceUri.fsPath);
        if (alreadyInDeployment) return;
        const { metadataName, directoryName, isMetadataFolder, xmlName } = getMetadataInfoFromPath(
            sourceUri,
            metadataInfoByFolderName
        );

        // if it's still not valid, show a warning message
        if (!metadataName) {
            vscode.window.showWarningMessage(
                `Warning: Unable to match the "${sourceUri.fsPath}" to a valid metadata type.`
            );
            return;
        }

        // check if deployment already included or if all are selected
        if (!isMetadataFolder) {
            const includesAllMetadata = deploymentMetadata.some((md) => md.xmlName === xmlName && md.isMetadataFolder);
            if (includesAllMetadata) {
                vscode.window.showWarningMessage(
                    `The deployment already includes all ${directoryName} metadata. Remove the folder first if you want to only deploy ${metadataName}.`
                );
                return;
            }
        }

        let fsPath = getPathForDeployment(sourceUri.fsPath, isMetadataFolder, directoryName, metadataName);
        const splitPath = fsPath.split(path.sep);
        const metadataStartIndex = splitPath.indexOf(directoryName);
        newMetadata.push({
            fsPath,
            isMetadataFolder,
            metadataName,
            xmlName,
            splitPath: splitPath.slice(metadataStartIndex)
        });
    });
    if (newMetadata.length > 0) {
        deploymentMetadata.push(...newMetadata);
        context.workspaceState.update('deploymentMetadata', deploymentMetadata);
        viewDeployment(context, outputChannel);
        vscode.window.showInformationMessage(`Finished adding metadata to the deployment.`);
    }
};
