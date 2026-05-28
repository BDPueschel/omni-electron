import { Icon } from './Icon';

export interface PreviewData {
  name: string;
  path: string;
  size: string;
  modified: string;
  isImage: boolean;
  isText: boolean;
  content: string | null;
  imageData: string | null;
}

interface PreviewPanelProps {
  data: PreviewData;
}

export function PreviewPanel({ data }: PreviewPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="truncate">
          <span className="text-omni-text text-sm font-medium">{data.name}</span>
          <span className="text-omni-muted text-xs ml-2 truncate">{data.path}</span>
        </div>
        <div className="flex gap-3 ml-2 shrink-0 text-xs text-omni-muted">
          <span>{data.size}</span>
          <span>{data.modified}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {data.isImage && data.imageData ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={data.imageData}
              alt={data.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : data.isText && data.content !== null ? (
          <pre className="text-xs font-mono text-omni-text whitespace-pre-wrap break-all leading-relaxed">
            {data.content}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-omni-muted gap-2">
            <span style={{ color: 'var(--color-omni-accent)' }}><Icon name="file" size={48} /></span>
            <span className="text-sm">Binary file — no preview available</span>
            <span className="text-xs">{data.size}</span>
          </div>
        )}
      </div>
    </div>
  );
}
