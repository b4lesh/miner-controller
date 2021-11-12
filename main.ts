import { exec, execFile } from 'child_process'
import { kill } from 'process'
import { getLogTime, sleep } from './helpers';
import { Process } from './interfaces/process';

async function getProcessList(): Promise<Process[]> {
  let resultFromTaskList: string = '';
  exec('tasklist', (err, stdout: string) => {
    resultFromTaskList = stdout.toLowerCase();
  })
  await sleep(1000);

  const dirtyList: Process[] = resultFromTaskList.split('\n').map((line: string) => {
    const allProcesses = line.split(' ').filter((element: string) => element !== '')
    return { name: allProcesses[0], pid: Number(allProcesses[1]) }
  })

  return dirtyList.filter((process: Process) => !isNaN(process.pid));
}

function startMiner(): void {
  execFile(
    '.\\NBMiner_Win\\nbminer.exe',
    ['-a', 'ethash', '-o', 'stratum+tcp://vethash.poolbinance.com:1800', '-u', 'Miningb4lesh.GTX1060'],
    (error, stdout) => {
      console.log(stdout.toString())
    }
  )
}

async function stopMiner(): Promise<void> {
  const processList: Process[] = await getProcessList();
  const minerPids: number[] = processList
    .filter((process: Process) => process.name === 'nbminer.exe')
    .map((process: Process) => process.pid);
  minerPids.forEach((pid: number) => kill(pid))
}

async function checkGameProcesses(): Promise<boolean> {
  const games: string[] = ['HorizonZeroDawn.exe', 'LeagueClient.exe'].map((game: string) => game.toLowerCase())
  const processList: Process[] = await getProcessList();
  return processList.some((process: Process) => games.includes(process.name));
}

function setOverclockProfile(name: 'mining' | 'gaming'): void {
  exec(`.\\overclock\\${name}.lnk`, (error, stdout) => {
    console.log(stdout.toString())
  })
}

async function main(): Promise<void> {
  let isMiner: boolean = false;
  let isGame: boolean = false;

  // Turn on script;
  console.log('Start miner');
  setOverclockProfile('mining');
  startMiner();
  isMiner = true;

  const status = true;
  while (status) {
    const result: boolean = await checkGameProcesses();
    if (result) {
      if (isMiner) {
        console.log(getLogTime(), 'Game found. Stop mining');
        isMiner = false;
        await stopMiner();
        setOverclockProfile('gaming');
      }
    } else {
      if (!isMiner) {
        console.log(getLogTime(), 'The game is off. Start mining');
        isMiner = true;
        await startMiner();
        setOverclockProfile('mining');
      }
    }

    await sleep(1000);
  }
}

main().then();
