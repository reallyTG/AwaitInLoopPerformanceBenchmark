// The one with Promise.all:
// const promFS = require('./promisfied-fs.js');
// The one with await-in-a-loop:
const promFS = require('./promisfied-fs-await.js');

const TGT_DIR = './tstCpDir';
const CPY_TO = './tstCpDir-cp';

(async () => {
    let before = (new Date());
    await promFS.cp(TGT_DIR, CPY_TO);
    let after = (new Date());
    console.log('time: ' + (after - before) + " msec");
})();

// Times:
//      With the await in a loop: 658 msec
//      Without:                  ??? msec
