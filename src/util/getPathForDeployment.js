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
const path = require('path');
module.exports = (fsPath, isMetadataFolder, directoryName, metadataName) => {
    let metadataPath = fsPath;
    // handle lwc and aura directory structure
    if (
        !isMetadataFolder && // not a whole folder
        (directoryName === 'lwc' || directoryName === 'aura') && // lwc or aura
        path.extname(metadataPath).length > 0 // has an extension
    ) {
        metadataPath = metadataPath.substring(0, metadataPath.lastIndexOf(path.sep));
    }
    // handle static resource directory structure
    if (
        !isMetadataFolder && // not a whole folder
        directoryName === 'staticresources' // is a static resource
    ) {
        // always throw out everything after the resource name and append the xml suffix
        metadataPath =
            metadataPath.substring(0, metadataPath.indexOf(metadataName) + metadataName.length) + '.resource-meta.xml';
    }
    return metadataPath;
};
