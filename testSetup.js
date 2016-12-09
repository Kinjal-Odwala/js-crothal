window.ii = {};

if (!window.location.origin) { // For IE.
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

ii.test = {
    root: '/cycligent',
    contextDir: 'test/',
    host: window.location.origin,
    markupFile: 'markup',
    markupExtension: '.html',
   // doImports: true,
    clientOnly: true/*,

    instrument: {
        certificate: 'MRmS5UymV%3gynWK'
    }*/
};

ii.test.markupBase = ii.test.root + '/client/' + ii.test.contextDir + ii.test.markupFile;

ii.root = {
    name: "cycligent",
    client: ii.test.host + ii.test.root + '/client',
    app: ii.test.host + ii.test.root,
    deploy: ii.test.host,
    context: ii.test.host + ii.test.root + '/client/' + ii.test.contextDir
};

window.cycligentConfigLocationOverride = ii.root.context + 'config.js';

function main() {

}