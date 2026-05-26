import { execFile } from 'child_process';

export function executeSystemCommand(command: string): void {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  const commands: Record<string, () => void> = {
    shutdown: () => {
      if (isWin) execFile('shutdown', ['/s', '/t', '0']);
      else if (isMac) execFile('osascript', ['-e', 'tell app "System Events" to shut down']);
    },
    restart: () => {
      if (isWin) execFile('shutdown', ['/r', '/t', '0']);
      else if (isMac) execFile('osascript', ['-e', 'tell app "System Events" to restart']);
    },
    sign_out: () => {
      if (isWin) execFile('shutdown', ['/l']);
      else if (isMac) execFile('osascript', ['-e', 'tell app "System Events" to log out']);
    },
    lock: () => {
      if (isWin) execFile('rundll32.exe', ['user32.dll,LockWorkStation']);
      else if (isMac) execFile('pmset', ['displaysleepnow']);
    },
    lock_screen: () => {
      if (isWin) execFile('rundll32.exe', ['user32.dll,LockWorkStation']);
      else if (isMac) execFile('pmset', ['displaysleepnow']);
    },
    sleep: () => {
      if (isWin) execFile('rundll32.exe', ['powrprof.dll,SetSuspendState', '0', '1', '0']);
      else if (isMac) execFile('pmset', ['sleepnow']);
    },
    empty_trash: () => {
      if (isWin) execFile('PowerShell', ['-Command', 'Clear-RecycleBin -Force']);
      else if (isMac) execFile('osascript', ['-e', 'tell app "Finder" to empty trash']);
    },
  };

  commands[command]?.();
}
