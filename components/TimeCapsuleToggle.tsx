'use client';

interface Props {
  enabled: boolean;
  revealDate: string;
  onToggle: (enabled: boolean) => void;
  onDateChange: (date: string) => void;
}

export default function TimeCapsuleToggle({ enabled, revealDate, onToggle, onDateChange }: Props) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className="flex items-center gap-3 w-full text-left transition-opacity hover:opacity-80"
      >
        <div
          className="w-10 h-6 rounded-full flex items-center transition-all px-0.5"
          style={{
            background: enabled ? 'var(--th-accent)' : 'var(--th-border)',
            justifyContent: enabled ? 'flex-end' : 'flex-start',
          }}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
        </div>
        <span className="text-sm" style={{ color: 'var(--th-text)' }}>
          Make this a time capsule
        </span>
      </button>

      {enabled && (
        <div className="pl-13">
          <label className="text-xs block mb-1" style={{ color: 'var(--th-faint)' }}>
            Reveal date
          </label>
          <input
            type="date"
            value={revealDate}
            min={minDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
            style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
        </div>
      )}
    </div>
  );
}
