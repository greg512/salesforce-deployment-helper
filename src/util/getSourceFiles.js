const vscode = require('vscode');
module.exports = async (sourceUri, selectFilesLabel) => {
    let sourceUris = [];
    try {
        if (sourceUri) {
            sourceUris.push(sourceUri);
        } else {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId !== 'forcesourcemanifest') {
                sourceUris.push(editor.document.uri);
            } else {
                sourceUris = await vscode.window.showOpenDialog({
                    openLabel: selectFilesLabel,
                    canSelectMany: true,
                    defaultUri: vscode.workspace.workspaceFolders[0].uri
                });
            }
            // throw an error if no valid source files or directories are found
            if (sourceUris.length === 0) {
                const errorMessage = 'You can only select source files or directories.';
                throw new Error(errorMessage);
            }
        }
    } catch (error) {
        console.log('error', error);
        vscode.window.showErrorMessage(error.message);
    }
    return sourceUris;
};
