 "use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Search, Video, Music2, User } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";

type Info = {
  id: string;
  title?: string;
  cover?: string;
  play?: string;
  hdplay?: string;
  music?: string;
  duration?: number;
  play_count?: number;
  digg_count?: number;
  author?: { unique_id?: string; nickname?: string; avatar?: string };
  images?: string[];
};

export default function Downloader() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return toast.error("Masukkan URL TikTok terlebih dahulu.");

    setLoading(true);
    setInfo(null);
    try {
      const res = await fetch(`/api/tiktok/info?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal mengambil informasi.");
      setInfo(data.data);
      toast.success("Video berhasil ditemukan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"><Video size={18}/></span>
          VibeTik
        </div>
        <ThemeToggle />
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-500">TikTok Downloader</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Download video dengan simpel.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Tempel link TikTok, ambil informasinya, lalu pilih kualitas download.
            </p>
          </motion.div>

          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Search className="shrink-0 text-zinc-400" size={20}/>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/..."
                className="min-w-0 flex-1 bg-transparent outline-none"
                type="url"
                required
              />
            </div>
            <button disabled={loading} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-zinc-950">
              {loading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
              Cari Video
            </button>
          </form>
        </div>

        <AnimatePresence>
          {info && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-12 grid max-w-4xl gap-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-[220px_1fr] sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {info.cover ? (
                <img src={info.cover} alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" />
              ) : (
                <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-zinc-100 dark:bg-zinc-800"><Video/></div>
              )}

              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{info.title || "TikTok Video"}</h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                  <User size={16}/> @{info.author?.unique_id || info.author?.nickname || "unknown"}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href={`/api/tiktok/download?url=${encodeURIComponent(url)}&quality=hd`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 font-semibold text-white hover:opacity-90 dark:bg-white dark:text-zinc-950">
                    <Download size={18}/> Download HD
                  </a>
                  <a href={`/api/tiktok/download?url=${encodeURIComponent(url)}&quality=normal`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    <Download size={18}/> Download Normal
                  </a>
                </div>

                {info.music && (
                  <a href={info.music} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    <Music2 size={17}/> Buka Musik
                  </a>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
