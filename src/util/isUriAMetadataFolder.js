const path = require('path');

module.exports = (metadataInfoByFolderName, sourceUri) => {
    if (sourceUri && metadataInfoByFolderName[path.basename(sourceUri.path)]) {
        return true;
    }
    return false;
};
