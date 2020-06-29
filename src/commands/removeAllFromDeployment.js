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
