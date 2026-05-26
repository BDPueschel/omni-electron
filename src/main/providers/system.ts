import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

interface SystemCommand {
  title: string;
  subtitle: string;
  command: string;
}

const SYSTEM_COMMANDS: SystemCommand[] = [
  { title: 'Shutdown', subtitle: 'Shut down the computer', command: 'shutdown' },
  { title: 'Restart', subtitle: 'Restart the computer', command: 'restart' },
  { title: 'Sign Out', subtitle: 'Sign out of the current user', command: 'sign_out' },
  { title: 'Lock Screen', subtitle: 'Lock the screen', command: 'lock_screen' },
  { title: 'Sleep', subtitle: 'Put the computer to sleep', command: 'sleep' },
  { title: 'Empty Recycle Bin', subtitle: 'Empty the recycle bin / trash', command: 'empty_trash' },
];

export class SystemProvider implements SearchProvider {
  category: CategoryName = 'System';

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = SYSTEM_COMMANDS.filter(
      cmd =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q),
    );

    return matches.slice(0, limit).map(cmd => ({
      category: 'System',
      title: cmd.title,
      subtitle: cmd.subtitle,
      icon: '⚙️',
      kind: 'System',
      action: { type: 'system_command' as const, command: cmd.command },
    }));
  }
}
