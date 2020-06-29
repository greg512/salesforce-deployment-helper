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
