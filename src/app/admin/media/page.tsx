"use client";

import { Copy, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Btn, Empty, PageHeader, Panel } from "@/components/admin/ui";
import { supabaseBrowser } from "@/lib/supabase/browser";

type FileItem = { name: string; id: string | null; metadata: { size?: number; mimetype?: string } | null; created_at: string | null };
const BUCKET = "media";

async function fetchFiles() {
  const { data, error } = await supabaseBrowser().storage.from(BUCKET).list("uploads", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
  if (error) toast.error(error.message);
  return ((data ?? []) as FileItem[]).filter((f) => f.id);
}

export default function MediaPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const storage = supabaseBrowser().storage.from(BUCKET);

  const load = useCallback(() => fetchFiles().then(setFiles), []);

  useEffect(() => {
    fetchFiles().then(setFiles);
  }, []);

  async function upload(list: FileList | File[]) {
    setUploading(true);
    for (const file of Array.from(list)) {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
      const { error } = await storage.upload(`uploads/${file.lastModified.toString(36)}${file.size.toString(36)}-${safe}`, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (error) toast.error(`${file.name}: ${error.message}`);
    }
    setUploading(false);
    toast.success("Upload complete");
    load();
  }

  const url = (name: string) => storage.getPublicUrl(`uploads/${name}`).data.publicUrl;

  async function remove(name: string) {
    if (!confirm(`Delete ${name}? Pages using this URL will break.`)) return;
    const { error } = await storage.remove([`uploads/${name}`]);
    if (error) return toast.error(error.message);
    setFiles((f) => f.filter((x) => x.name !== name));
  }

  return (
    <>
      <PageHeader title="Media" description="Supabase Storage bucket “media” — public CDN URLs for images, OG images, videos, and PDFs (max 50 MB)." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
        className={`mb-6 grid place-items-center rounded-2xl border-2 border-dashed p-10 text-center transition ${dragging ? "border-sky-400 bg-sky-50" : "border-slate-300 bg-white"}`}
      >
        <Upload className="size-8 text-navy-900" />
        <p className="mt-3 font-medium text-ink">Drop files here</p>
        <p className="text-sm text-slate-500">PNG, JPG, WebP, AVIF, GIF, SVG, MP4, PDF</p>
        <input ref={input} type="file" multiple hidden accept="image/*,video/mp4,application/pdf" onChange={(e) => e.target.files && upload(e.target.files)} />
        <Btn className="mt-4" onClick={() => input.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Choose files</Btn>
      </div>
      <Panel>
        {files.length === 0 ? (
          <Empty>No files uploaded yet.</Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {files.map((f) => {
              const isImage = f.metadata?.mimetype?.startsWith("image/");
              return (
                <li key={f.name} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="grid aspect-video place-items-center bg-slate-100">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url(f.name)} alt={f.name} className="size-full object-cover" loading="lazy" />
                    ) : (
                      <FileText className="size-8 text-slate-400" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-ink" title={f.name}>{f.name.replace(/^\d+-/, "")}</p>
                    <p className="text-xs text-slate-400">{f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(0)} KB` : ""}</p>
                    <div className="mt-2 flex gap-2">
                      <Btn variant="ghost" className="h-8 flex-1 text-xs" onClick={() => { navigator.clipboard.writeText(url(f.name)); toast.success("URL copied"); }}><Copy className="size-3.5" /> Copy URL</Btn>
                      <Btn variant="danger" className="h-8 px-2.5" onClick={() => remove(f.name)} aria-label="Delete"><Trash2 className="size-3.5" /></Btn>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
