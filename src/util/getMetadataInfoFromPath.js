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
const isUriAMetadataFolder = require('./isUriAMetadataFolder');
module.exports = (uri, metadataInfoByFolderName) => {
    const isMetadataFolder = isUriAMetadataFolder(metadataInfoByFolderName, uri);
    const sourcePath = uri.path;
    const splitPath = sourcePath.split('/');
    const staticResources = `staticresources`;
    const lwc = `lwc`;
    const aura = `aura`;
    const objects = `/objects/`;
    const multilevelMetadata = [lwc, aura, staticResources];
    let directoryName;
    let metadataName;
    let xmlName;
    if (isMetadataFolder) {
        directoryName = splitPath[splitPath.length - 1];
        metadataName = 'All';
        xmlName = (metadataInfoByFolderName[directoryName] || {}).xmlName;
    } else {
        // handle the typical metadata paths
        if (!directoryName) {
            directoryName = splitPath[splitPath.length - 2];
            metadataName = splitPath[splitPath.length - 1];
            // if the directoryName is not valid, try the previous directory
            // if (!metadataInfoByFolderName[directoryName]) {
            //     directoryName = splitPath[splitPath.length - 3];
            //     metadataName = splitPath[splitPath.length - 2];
            // }
        }

        // if the typical path isn't valid, try the metadata with potentially deeper levels
        if (!metadataInfoByFolderName[directoryName]) {
            directoryName = multilevelMetadata.find((md) => sourcePath.includes(`/${md}/`));
            if (directoryName) {
                metadataName = splitPath[splitPath.findIndex((d) => d === directoryName) + 1];
            }
        }

        // determine which child metadata is selected if it came from objects
        if (!metadataInfoByFolderName[directoryName] && sourcePath.includes(objects)) {
            directoryName = 'objects';
            metadataName = splitPath[splitPath.length - 1];
        }

        // return undefined values if the metadata type can't be determined
        if (!metadataInfoByFolderName[directoryName]) {
            return {};
        }

        const metadataInfo = metadataInfoByFolderName[directoryName];
        xmlName = metadataInfo.xmlName;

        // remove the suffix if it's a meta file
        if (metadataName.indexOf('.') > -1) {
            metadataName = metadataName.substring(0, metadataName.indexOf('.')); //(`.${metadataInfo.suffix}`)
        }
    }

    return { metadataName, xmlName, directoryName, isMetadataFolder };
};
