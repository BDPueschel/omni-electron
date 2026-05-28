import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

interface SystemCommand {
  title: string;
  subtitle: string;
  command: string;
  aliases: string[];
  icon: string;
}

const SYSTEM_COMMANDS: SystemCommand[] = [
  { title: 'Lock Screen', subtitle: 'Lock the workstation', command: 'lock_screen', aliases: ['lock', 'lock screen', 'lock pc'], icon: 'settings' },
  { title: 'Sleep', subtitle: 'Suspend the computer', command: 'sleep', aliases: ['sleep', 'suspend'], icon: 'settings' },
  { title: 'Shutdown', subtitle: 'Shut down the computer', command: 'shutdown', aliases: ['shutdown', 'shut down', 'power off'], icon: 'settings' },
  { title: 'Restart', subtitle: 'Restart the computer', command: 'restart', aliases: ['restart', 'reboot'], icon: 'settings' },
  { title: 'Empty Recycle Bin', subtitle: 'Clear the recycle bin', command: 'empty_trash', aliases: ['recycle', 'recycle bin', 'empty recycle', 'trash', 'empty trash'], icon: 'settings' },
  { title: 'Sign Out', subtitle: 'Sign out of current user', command: 'sign_out', aliases: ['sign out', 'log out', 'logout', 'logoff'], icon: 'settings' },
];

export class SystemProvider implements SearchProvider {
  category: CategoryName = 'System';

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = SYSTEM_COMMANDS.filter(cmd =>
      cmd.aliases.some(alias => alias.startsWith(q) || alias.includes(q)),
    );

    return matches.slice(0, limit).map(cmd => ({
      category: 'System',
      title: cmd.title,
      subtitle: cmd.subtitle,
      icon: cmd.icon,
      kind: 'System',
      action: { type: 'system_command' as const, command: cmd.command },
    }));
  }
}
