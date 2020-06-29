const exec = require('child_process');
const vscode = require('vscode');
module.exports = (context) => {
    return new Promise((resolve, reject) => {
        let metadataInfoByFolderName = context.workspaceState.get('metadataInfoByFolderName');
        if (metadataInfoByFolderName) {
            resolve(metadataInfoByFolderName);
            return;
        }
        const sfdx = exec.spawn('sfdx', ['force:mdapi:describemetadata', '--json'], {
            cwd: vscode.workspace.workspaceFolders[0].uri.path
        });
        let buffer = '';
        sfdx.stderr.on('data', (data) => {
            let text = data.toString();

            if (text.length > 0) {
                buffer += '\n' + text;
            }
        });

        sfdx.stdout.on('data', (data) => {
            buffer += '\n' + data.toString();
        });

        sfdx.on('exit', (code) => {
            // Handle the result + errors (i.e. the text in "buffer") here.

            if (code === 1) {
                vscode.window.showErrorMessage(
                    'There was a problem retrieving metadata info from the default project org.'
                );
                reject(buffer);
            } else {
                const response = JSON.parse(buffer.replace(/\s/g, ''));
                metadataInfoByFolderName = {};
                response.result.metadataObjects.forEach((md) => {
                    metadataInfoByFolderName[md.directoryName] = md;
                });
                context.workspaceState.update('metadataInfoByFolderName', metadataInfoByFolderName);
                resolve(response);
            }
        });
    });
};
