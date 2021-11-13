import { exec, execFile } from 'child_process'
import { exit, kill } from 'process'
import { log, sleep } from './helpers';
import { Process } from './interfaces/process';
import { readFileSync } from 'fs';

async function greeting(): Promise<void> {
  console.clear();
  log('Start inspector');
  if (await checkGameProcesses()) {
    log('Game mode. Miner disabling');
  }
}

async function getProcessList(): Promise<Process[]> {
  let resultFromTaskList: string = '';
  exec('tasklist', (err, stdout: string) => {
    resultFromTaskList = stdout.toLowerCase();
  })
  await sleep(1000);

  const dirtyList: Array<Process | null> = resultFromTaskList.split('\n').map((line: string) => {
    const dirtyMatch: string[] | null = line.match(/.+\.exe/gm);
    if (dirtyMatch === null) {
      return null;
    }
    const name: string = dirtyMatch[0].toLowerCase();
    const columns = line.replace(name, '').split(' ').filter((element: string) => element !== '');
    return { name: name, pid: Number(columns[0]) }
  })

  return dirtyList.filter((process: Process | null) =>
    process !== null && !isNaN(process.pid)
  ) as Process[];
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
  const configLines: string[] = readFileSync('./config', 'utf8')
    .toLowerCase()
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line !== '');

  let games: string[];
  if (configLines[0] === '[GameProcesses]'.toLowerCase()) {
    games = configLines.splice(1);
  } else {
    log('Ошибка конфигурационного файла');
    exit(1);
  }
  const processList: Process[] = await getProcessList();
  return processList.some((process: Process) => games.includes(process.name));
}

function setOverclockProfile(name: 'mining' | 'gaming'): void {
  exec(`.\\overclock\\${name}.lnk`)
}

async function main(): Promise<void> {
  await greeting();
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
    await sleep(10000);
  }
}

main().then();
