'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function handleAutoCapitalize(e: React.KeyboardEvent<HTMLTextAreaElement>, onChange: (v: string) => void) {
  if (e.key.length !== 1 || !/[a-z]/.test(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd, value } = textarea;
  if (selectionStart !== selectionEnd) return;
  const before = value.slice(0, selectionStart);
  if (!(before.trimEnd() === '' || /[.!?]\s+$/.test(before))) return;
  e.preventDefault();
  const next = value.slice(0, selectionStart) + e.key.toUpperCase() + value.slice(selectionStart);
  onChange(next);
  requestAnimationFrame(() => textarea.setSelectionRange(selectionStart + 1, selectionStart + 1));
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border transition-all focus-within:border-pink-400 focus-within:ring-1 focus-within:ring-pink-100" style={{ borderColor: 'var(--th-border)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ background: 'var(--th-toolbar)', borderColor: 'var(--th-border)' }}>
        <span className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--th-faint)' }}>
          {preview ? 'Preview' : 'Markdown'}
        </span>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-xs px-2.5 py-1 rounded-md border transition-all hover:border-pink-300"
          style={{ background: 'var(--th-card)', color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="min-h-64 p-4 prose max-w-none" style={{ background: 'var(--th-input)' }}>
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="italic" style={{ color: 'var(--th-faint)' }}>Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleAutoCapitalize(e, onChange)}
          placeholder={placeholder ?? 'Write your entry here... (Markdown supported)'}
          rows={14}
          className="w-full p-4 font-mono text-sm resize-y outline-none leading-relaxed placeholder:opacity-40"
          style={{ background: 'var(--th-input)', color: 'var(--th-text)' }}
        />
      )}
    </div>
  );
}
