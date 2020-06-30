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
