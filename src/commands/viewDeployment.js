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
