'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function handleAutoCapitalize(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  onChange: (v: string) => void
) {
  // Only act on bare lowercase letter keystrokes
  if (e.key.length !== 1 || !/[a-z]/.test(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;

  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd, value } = textarea;

  // Only capitalize single-cursor (no selection)
  if (selectionStart !== selectionEnd) return;

  const before = value.slice(0, selectionStart);
  const shouldCapitalize = before.trimEnd() === '' || /[.!?]\s+$/.test(before);
  if (!shouldCapitalize) return;

  e.preventDefault();
  const upper = e.key.toUpperCase();
  const next = value.slice(0, selectionStart) + upper + value.slice(selectionStart);
  onChange(next);
  // Restore cursor after React re-render
  requestAnimationFrame(() => {
    textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
  });
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="flex flex-col border border-stone-200 rounded-lg overflow-hidden focus-within:border-pink-400 focus-within:ring-1 focus-within:ring-pink-100 transition-all">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-200">
        <span className="text-xs text-stone-400 font-medium tracking-wide uppercase">
          {preview ? 'Preview' : 'Markdown'}
        </span>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-xs px-2.5 py-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-all"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-64 p-4 prose prose-stone prose-sm max-w-none bg-white">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-stone-400 italic">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleAutoCapitalize(e, onChange)}
          placeholder={placeholder ?? 'Write your entry here... (Markdown supported)'}
          rows={14}
          className="w-full p-4 font-mono text-sm text-stone-800 placeholder:text-stone-400 bg-white resize-y outline-none leading-relaxed"
        />
      )}
    </div>
  );
}
