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
module.exports = (context, outputChannel) => {
    const deploymentMetadataByXmlName = context.workspaceState.get('deploymentMetadataByXmlName') || {};

    if (Object.keys(deploymentMetadataByXmlName).length === 0) {
        outputChannel.appendLine('The current deployment has no metadata.');
    } else {
        let formattedOutput = '';
        outputChannel.appendLine('CURRENT DEPLOYMENT:');
        for (let prop in deploymentMetadataByXmlName) {
            const md = deploymentMetadataByXmlName[prop];
            formattedOutput += `${prop}\n`;
            if (md === '*') {
                formattedOutput += `    ${md}\n`;
            } else {
                formattedOutput += md.reduce((acc, curVal) => (acc += `    ${curVal}\n`), '');
            }
        }
        outputChannel.appendLine(formattedOutput);
    }
    outputChannel.show(true);
};
