"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadImage } from "./upload";

/** Single image: upload or paste URL */
export function ImageField({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(f, folder));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5 text-zinc-400 hover:border-violet-500"
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6" />
        )}
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload or paste image URL" />
        <div className="flex gap-2">
          <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => input.current?.click()} disabled={busy}>
            Upload
          </button>
          {value && (
            <button type="button" className="btn-ghost px-3 py-1.5 text-xs text-red-400" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

/** Multiple images with reorder; first image is the cover */
export function MultiImageField({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [url, setUrl] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadImage(f, folder));
      onChange([...value, ...urls]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {value.map((src, i) => (
          <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-violet-600 px-1.5 text-[10px] font-bold">COVER</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1">
              <button type="button" onClick={() => move(i, -1)} className="p-1 hover:text-violet-300" aria-label="Move left"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="p-1 text-red-400" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 hover:text-violet-300" aria-label="Move right"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="grid aspect-square place-items-center rounded-xl border border-dashed border-white/20 bg-white/5 text-zinc-400 hover:border-violet-500"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
        </button>
      </div>
      <div className="flex gap-2">
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            if (url.trim()) onChange([...value, url.trim()]);
            setUrl("");
          }}
        >
          Add
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
