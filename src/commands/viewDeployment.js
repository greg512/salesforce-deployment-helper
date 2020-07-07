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
const os = require('os');
const EOL = os.EOL;
const { Traversal } = require('../util');
module.exports = (context, outputChannel) => {
    const deploymentMetadata = context.workspaceState.get('deploymentMetadata') || [];
    if (deploymentMetadata.length === 0) {
        outputChannel.appendLine('The current deployment has no metadata.');
    } else {
        // construct tree from list of source files in deployment
        let result = [];
        let level = { result };
        deploymentMetadata.forEach((dm) => {
            dm.splitPath.reduce((r, name, i) => {
                if (!r[name]) {
                    let nodeName = name;
                    const isFirst = i === 0;
                    const isLast = dm.splitPath.length - 1 === i;
                    if (isFirst && isLast) {
                        nodeName = `${dm.xmlName} - ${dm.metadataName}`;
                    } else if (isFirst) {
                        nodeName = dm.xmlName;
                    } else if (isLast) {
                        nodeName = dm.metadataName;
                    }
                    r[name] = { result: [] };
                    r.result.push({ name: nodeName, children: r[name].result, level: i });
                }
                return r[name];
            }, level);
        });
        // Output the formatted, current metadata list
        outputChannel.appendLine(EOL + 'CURRENT DEPLOYMENT METADATA');
        new Traversal(result, (val, level) => {
            let indentSpace = '';
            if (level === 0) indentSpace = EOL + indentSpace;
            for (let i = 0; i < level; i++) {
                indentSpace += '    ';
            }
            outputChannel.appendLine(indentSpace + val);
        });
        outputChannel.show(true);
    }
};
