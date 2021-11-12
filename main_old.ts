import { exec } from 'child_process'
import { sleep } from './helpers';

async function main() {
  const processList = [];
  let resultFromTaskList;
  exec('tasklist', function (err, stdout, stderr) {
    resultFromTaskList = stdout;
    // process = new RegExp(/.+\.exe/gm, stdout);
  })
  await sleep(1000);
  const list = resultFromTaskList
    .split('\n')
    .map((str) => {
      const r = str.split(' ').filter((str) => str !== '')
      return { name: r[0], pid: r[1] }
    })
  console.log(list)
}

main().then();

//
// setTimeout(() => {
//   console.log(result)
//   // const re = /.+\.exe/gm;
//   // const found = result.match(re);
//   // console.error(found.indexOf('nbminer.exe'));
// }, 1000);

// execFile(
//   '.\\NBMiner_Win\\nbminer.exe',
//   ['-a', 'ethash', '-o', 'stratum+tcp://vethash.poolbinance.com:1800', '-u', 'Miningb4lesh.GTX1060'],
//   (error, stdout, stderr) => {
//     console.log(stdout.toString())
//   }
// )

// const process = require('process');
// process.kill(8188, 'SIGHUP');

// const { spawn } = require('child_process');
// const grep = spawn('.\\NBMiner_Win\\nbminer.exe', ['-a', 'ethash', '-o', 'stratum+tcp://vethash.poolbinance.com:1800', '-u', 'Miningb4lesh.GTX1060']);
//
// grep.on('close', (code, signal) => {
//   console.log(
//     `child process terminated due to receipt of signal ${signal}`);
// });
//
// setTimeout(() => {
//   // Send SIGHUP to process.
//   grep.kill();
// }, 10000)


// kill(15612);



