"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Desktop } from "@/desktop/desktop";
export default function Playground() {
  const router = useRouter();
  return <main style={{ height: "100dvh", position: "relative", background: "#171717" }}><Desktop onEscape={() => router.push("/")} /><Link href="/" className="v3-playground-back">← Back to portfolio</Link></main>;
}
