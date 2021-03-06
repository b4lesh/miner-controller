function addZero(time: number | string): string {
  time = time.toString();
  if (time.length !== 2) {
    return '0' + time;
  }
  return time;
}

export function sleep(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export function log(text: string): void {
  const currentDate: Date = new Date();
  const seconds: string = addZero(currentDate.getSeconds());
  const minutes: string = addZero(currentDate.getMinutes());
  const hours: string = addZero(currentDate.getHours());
  console.log(`[${hours}:${minutes}:${seconds}] ${text}`);
}
