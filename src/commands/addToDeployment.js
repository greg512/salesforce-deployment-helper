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
