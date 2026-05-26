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
    const q = query.trim();
    if (!q) return [];

    let matches: SystemCommand[];

    try {
      const { Fzf } = await import('fzf');
      const fzf = new Fzf(SYSTEM_COMMANDS, { selector: (item: SystemCommand) => `${item.title} ${item.subtitle}` });
      matches = fzf.find(q).map((r: { item: SystemCommand }) => r.item).slice(0, limit);
    } catch {
      const ql = q.toLowerCase();
      matches = SYSTEM_COMMANDS.filter(
        cmd =>
          cmd.title.toLowerCase().includes(ql) ||
          cmd.subtitle.toLowerCase().includes(ql),
      ).slice(0, limit);
    }

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
