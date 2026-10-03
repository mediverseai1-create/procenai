import { useRef, useState } from "react";
import { ArrowUp, Image as ImageIcon, Link2, Mic, Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fileToAttachment, type Attachment } from "../lib/ai";

export type ComposerValue = { text: string; productUrl?: string; attachments: Attachment[] };

export function Composer({ onSubmit, busy = false, placeholder = "Ask ProcenAI to evaluate a product, compare suppliers or plan procurement…", initial = "" }: {
  onSubmit: (v: ComposerValue) => void | Promise<void>; busy?: boolean; placeholder?: string; initial?: string;
}) {
  const [text, setText] = useState(initial);
  const [url, setUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [listening, setListening] = useState(false);
  const docRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  async function addFiles(list: FileList | null, imagesOnly = false) {
    if (!list) return;
    const next: Attachment[] = [];
    for (const f of Array.from(list).slice(0, 5)) {
      if (imagesOnly && !f.type.startsWith("image/")) { toast.error(`${f.name} is not an image.`); continue; }
      if (f.size > 6 * 1024 * 1024) { toast.error(`${f.name} is larger than 6 MB.`); continue; }
      next.push(await fileToAttachment(f));
    }
    setFiles((p) => [...p, ...next].slice(0, 5));
  }

  function toggleMic() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.info("Voice input is not supported in this browser."); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = (e: any) => setText((t) => (t ? t + " " : "") + e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  }

  async function send() {
    if (busy || (!text.trim() && !url.trim() && files.length === 0)) return;
    await onSubmit({ text: text.trim(), productUrl: url.trim() || undefined, attachments: files });
    setText(""); setUrl(""); setShowUrl(false); setFiles([]);
  }

  const iconBtn = "grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground";
  return (
    <div className="panel overflow-hidden text-left shadow-lg shadow-primary/5">
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
        className="block w-full resize-none bg-transparent px-4 pt-4 text-[15px] outline-none placeholder:text-muted-foreground"
      />
      {(files.length > 0 || showUrl) && (
        <div className="space-y-2 px-4 pb-2">
          {showUrl && <input className="input" placeholder="Paste a marketplace or product link" value={url} onChange={(e) => setUrl(e.target.value)} />}
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {f.name}
                <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label="Remove"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-1">
          <button className={iconBtn} title="Attach quotes, specs or spreadsheets" onClick={() => docRef.current?.click()}><Paperclip className="h-4 w-4" /></button>
          <button className={iconBtn} title="Add product photo" onClick={() => imgRef.current?.click()}><ImageIcon className="h-4 w-4" /></button>
          <button className={iconBtn} title="Paste a link" onClick={() => setShowUrl((s) => !s)}><Link2 className="h-4 w-4" /></button>
          <button className={`${iconBtn} ${listening ? "bg-primary/10 text-primary" : ""}`} title="Dictate" onClick={toggleMic}><Mic className="h-4 w-4" /></button>
          <input ref={docRef} type="file" multiple hidden accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,image/*" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={imgRef} type="file" multiple hidden accept="image/*" onChange={(e) => { void addFiles(e.target.files, true); e.target.value = ""; }} />
        </div>
        <button className="btn btn-primary" disabled={busy} onClick={() => void send()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />} Send
        </button>
      </div>
    </div>
  );
}
