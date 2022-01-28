// The one with Promise.all:
const promFS = require('./promisfied-fs.js');

const TGT_DIR = './tstCpDir';
const CPY_TO = './tstCpDir-cp';

(async () => {
    let before = (new Date());
    await promFS.cp(TGT_DIR, CPY_TO);
    let after = (new Date());
    console.log('time: ' + (after - before) + " msec");
})();

