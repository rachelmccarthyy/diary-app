'use client';

import { useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_IMAGES = 5;
const MAX_WIDTH = 1200;
const QUALITY = 0.78;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const compressed = await Promise.all(Array.from(files).slice(0, remaining).map(compressImage));
    onChange([...images, ...compressed]);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Attached image ${i + 1}`} className="w-full h-full object-cover rounded-lg border" style={{ borderColor: 'var(--th-border)' }} />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-pink-300 hover:text-pink-400 transition-all"
          style={{ borderColor: 'var(--th-border)', color: 'var(--th-faint)' }}
        >
          <span className="text-2xl">🖼️</span>
          <p className="text-xs text-center">
            Drop images here or <span className="underline">click to upload</span>
            <br />
            <span style={{ color: 'var(--th-faint)' }}>{images.length}/{MAX_IMAGES} &middot; compressed automatically</span>
          </p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
        </div>
      )}
    </div>
  );
}
