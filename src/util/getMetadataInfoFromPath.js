module.exports = (sourcePath, metadataInfoByFolderName) => {
    const splitPath = sourcePath.split('/');
    // the directory name is either the second from last item:
    //  directory/metadata.xml
    // or the third from last:
    //  lwc/cmpName/cmpName.js
    //  aura/cmpName/cmpName.html

    const staticResources = '/staticresources/';
    let directoryName;
    let metadataName;

    // handle exceptions to the rule
    // -static resources, which could have an unknown number of directories
    if (sourcePath.includes(staticResources)) {
        directoryName = 'staticresources';
        metadataName = splitPath[splitPath.findIndex((d) => d === directoryName) + 1];
    }

    // handle the typical metadata paths
    if (!directoryName) {
        directoryName = splitPath[splitPath.length - 2];
        metadataName = splitPath[splitPath.length - 1];
        // if the directoryName is not valid, try the previous directory
        if (!metadataInfoByFolderName[directoryName]) {
            directoryName = splitPath[splitPath.length - 3];
            metadataName = splitPath[splitPath.length - 2];
        }
    }

    console.log(directoryName);
    console.log(metadataName);

    // return undefined values if the metadata type can't be determined
    if (!metadataInfoByFolderName[directoryName]) {
        return {};
    }

    const metadataInfo = metadataInfoByFolderName[directoryName];
    const xmlName = metadataInfo.xmlName;

    // remove the suffix if it's a meta file
    if (metadataName.indexOf('.') > -1) {
        metadataName = metadataName.substring(0, metadataName.indexOf('.')); //(`.${metadataInfo.suffix}`)
    }
    return { metadataName, xmlName, directoryName };
};
