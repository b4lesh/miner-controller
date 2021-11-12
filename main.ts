import { exec, execFile } from 'child_process'
import { kill } from 'process'
import { log, sleep } from './helpers';
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

async function getMinerPids(): Promise<number[]> {
  const processList: Process[] = await getProcessList();
  return processList
    .filter((process: Process) => process.name === 'nbminer.exe')
    .map((process: Process) => process.pid);
}

async function startMiner(): Promise<void> {
  const minerPids: number[] = await getMinerPids();
  if (minerPids.length === 0) {
    log('Mining mode. Miner launching');
    execFile(
      '.\\NBMiner_Win\\nbminer.exe',
      ['-a', 'ethash', '-o', 'stratum+tcp://vethash.poolbinance.com:1800', '-u', 'Miningb4lesh.GTX1060']
    );
  }
}

async function stopMiner(): Promise<void> {
  const minerPids: number[] = await getMinerPids();
  if (minerPids.length > 0) {
    log('Game mode. Miner disabling');
    minerPids.forEach((pid: number) => kill(pid));
  }
}

async function checkGameProcesses(): Promise<boolean> {
  const games: string[] = ['HorizonZeroDawn.exe', 'LeagueClient.exe'].map((game: string) => game.toLowerCase())
  const processList: Process[] = await getProcessList();
  return processList.some((process: Process) => games.includes(process.name));
}

function setOverclockProfile(name: 'mining' | 'gaming'): void {
  exec(`.\\overclock\\${name}.lnk`)
}

async function main(): Promise<void> {
  const status = true;
  while (status) {
    const result: boolean = await checkGameProcesses();
    if (result) {
      await stopMiner();
      setOverclockProfile('gaming');
    } else {
      await startMiner();
      setOverclockProfile('mining');
    }
    await sleep(60000);
  }
}

main().then();
