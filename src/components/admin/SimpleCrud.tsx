"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ImageField } from "./ImageField";
import { Toast } from "./Toast";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "image" | "checkbox";
  required?: boolean;
  placeholder?: string;
  help?: string;
};

type Row = Record<string, unknown> & { id: string };

export function SimpleCrud({
  table,
  title,
  fields,
  columns,
  defaults,
  slugFrom,
  folder,
}: {
  table: string;
  title: string;
  fields: FieldDef[];
  columns: { key: string; label: string; type?: "image" | "bool" }[];
  defaults: Record<string, unknown>;
  slugFrom?: string;
  folder: string;
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" }>({ msg: "", type: "ok" });
  const clearToast = useCallback(() => setToast({ msg: "", type: "ok" }), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("sort_order").order("created_at");
    if (error) setToast({ msg: error.message, type: "err" });
    setRows((data as Row[]) || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload: Record<string, unknown> = { ...editing };
    delete payload.created_at;
    if (slugFrom && "slug" in payload && !payload.slug) payload.slug = slugify(String(payload[slugFrom] || ""));
    const { error } = payload.id
      ? await supabase.from(table).update(payload).eq("id", payload.id as string)
      : await supabase.from(table).insert(payload);
    setSaving(false);
    if (error) return setToast({ msg: error.message, type: "err" });
    setToast({ msg: "Saved", type: "ok" });
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return setToast({ msg: error.message, type: "err" });
    setToast({ msg: "Deleted", type: "ok" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button className="btn-primary" onClick={() => setEditing({ ...defaults })}>
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center text-zinc-400">Nothing here yet.</div>
      ) : (
        <div className="card divide-y divide-white/5 overflow-hidden">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 sm:p-4">
              {columns.map((c) =>
                c.type === "image" ? (
                  <div key={c.key} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:h-14 sm:w-20">
                    {r[c.key] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(r[c.key])} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ) : c.type === "bool" ? (
                  <span key={c.key} className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${r[c.key] ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                    {r[c.key] ? c.label : `Not ${c.label.toLowerCase()}`}
                  </span>
                ) : (
                  <div key={c.key} className="min-w-0 flex-1">
                    <p className="truncate font-medium">{String(r[c.key] ?? "") || "—"}</p>
                    {"slug" in r && c.key !== "slug" && <p className="truncate text-xs text-zinc-500">/{String(r.slug)}</p>}
                  </div>
                )
              )}
              <div className="ml-auto flex shrink-0 gap-1">
                <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setEditing({ ...r })} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={() => setEditing(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-zinc-950 p-5 sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? "Edit" : "Add"} {title.replace(/s$/, "").toLowerCase()}</h2>
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1.5 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {fields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing[f.key]} onChange={(v) => setEditing((p) => ({ ...p!, [f.key]: v }))} folder={folder} />
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary flex-1" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
            </div>
          </form>
        </div>
      )}
      <Toast msg={toast.msg} type={toast.type} onDone={clearToast} />
    </div>
  );
}

export function FieldInput({
  field: f,
  value,
  onChange,
  folder,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  folder: string;
}) {
  if (f.type === "checkbox")
    return (
      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-violet-600" />
        <span className="text-sm">{f.label}</span>
      </label>
    );
  return (
    <div>
      <label className="label">{f.label}{f.required && " *"}</label>
      {f.type === "image" ? (
        <ImageField value={String(value ?? "")} onChange={onChange} folder={folder} />
      ) : f.type === "textarea" ? (
        <textarea className="input min-h-28" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} required={f.required} />
      ) : (
        <input
          className="input"
          type={f.type}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
          placeholder={f.placeholder}
          required={f.required}
        />
      )}
      {f.help && <p className="mt-1 text-xs text-zinc-500">{f.help}</p>}
    </div>
  );
}
