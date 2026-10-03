import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Download, ImagePlus, Loader2, Wand2 } from "lucide-react";
import { PageHeader } from "../components/AppShell";
import { aiImage, fileToAttachment, saveItem, type Attachment } from "../lib/ai";

const ASSETS = ["Website banner", "Lifestyle product image", "Studio product image", "Packaging concept", "Email header"];
const STYLES = ["Clean studio", "Premium minimal", "Lifestyle in use"];
const RATIOS = ["Square 1:1", "Portrait 4:5", "Landscape 16:9"];

type Gen = { image: string; prompt: string; assetType: string; product: string };

export default function DesignStudio() {
  const [assetType, setAssetType] = useState(ASSETS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [refs, setRefs] = useState<Attachment[]>([]);
  const [context, setContext] = useState<string | null>(null);
  const [gens, setGens] = useState<Gen[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const c = localStorage.getItem("procenai:context"); if (c) { setContext(c); localStorage.removeItem("procenai:context"); } } catch { /* ignore */ } }, []);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const next: Attachment[] = [];
    for (const f of Array.from(list).slice(0, 3)) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image.`); continue; }
      if (f.size > 6 * 1024 * 1024) { toast.error(`${f.name} is larger than 6 MB.`); continue; }
      next.push(await fileToAttachment(f));
    }
    setRefs((p) => [...p, ...next].slice(0, 3));
  }
  async function generate() {
    setBusy(true);
    try {
      const r = await aiImage({ assetType, style, ratio, product, notes, references: refs, context });
      setGens((g) => [{ image: r.image, prompt: r.prompt, assetType, product }, ...g]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not generate the visual."); }
    finally { setBusy(false); }
  }
  async function save(g: Gen) {
    try { await saveItem("product", `${g.assetType} — ${g.product || "Untitled"}`, { prompt: g.prompt, image: g.image }, { subtitle: "Visual concept" }); toast.success("Saved to your library."); }
    catch { toast.error("Could not save."); }
  }

  return (
    <>
      <PageHeader title="AI Design Studio" sub="Generate ad creatives, banners and lifestyle visuals from approved product data. Generated images are concepts — review them for accuracy and rights before publishing." />
      {context && <div className="panel mb-4 border-primary/40 bg-primary/5 px-4 py-2.5 text-sm">Using approved product information from the AI Workspace.</div>}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="panel space-y-4 self-start p-5">
          <div><label className="label">Asset type</label><select className="input" value={assetType} onChange={(e) => setAssetType(e.target.value)}>{ASSETS.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Style</label><select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Aspect ratio</label><select className="input" value={ratio} onChange={(e) => setRatio(e.target.value)}>{RATIOS.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label className="label">Product</label><input className="input" value={product} onChange={(e) => setProduct(e.target.value)} /></div>
          <div><label className="label">Creative notes</label><textarea className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div>
            <button className="btn btn-outline w-full" onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" /> Add product photo or logo</button>
            <input ref={fileRef} type="file" multiple hidden accept="image/*" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
            {refs.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{refs.map((r) => r.name).join(", ")}</p>}
          </div>
          <button className="btn btn-primary w-full" disabled={busy} onClick={() => void generate()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate visual</button>
        </div>
        <div className="space-y-4">
          {gens.length === 0 && !busy && <div className="panel grid place-items-center p-12 text-center text-sm text-muted-foreground">Generated visuals appear here with the prompt used, so your team can reproduce or adjust them.</div>}
          {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Rendering your visual…</div>}
          {gens.map((g, i) => (
            <div key={i} className="panel overflow-hidden">
              <img src={g.image} alt={`${g.assetType} concept for ${g.product || "product"}`} className="w-full" />
              <div className="p-4">
                <div className="eyebrow text-primary">{g.assetType} — {g.product || "Untitled"}</div>
                <p className="mt-2 text-xs text-muted-foreground">{g.prompt}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-outline !py-1 !text-xs" onClick={() => void save(g)}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                  <a className="btn btn-outline !py-1 !text-xs" href={g.image} download={`${g.assetType.toLowerCase().replace(/\W+/g, "-")}.png`}><Download className="h-3.5 w-3.5" /> Download</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
