import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-black text-violet-500">404</p>
      <p className="mt-3 text-zinc-400">This page doesn&apos;t exist.</p>
      <Link href="/products" className="btn-primary mt-6">Browse phones</Link>
    </div>
  );
}
