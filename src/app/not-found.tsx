import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-4 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
      <div className="relative">
        <p className="font-mono text-sm text-sky-300">404</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">This page isn&apos;t architected yet.</h1>
        <p className="mt-4 text-white/60">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-ink">Back home</Link>
          <Link href="/contact" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold">Contact</Link>
        </div>
      </div>
    </main>
  );
}
