"use client";
import { useRouter } from "next/navigation";
import { Desktop } from "@/desktop/desktop";
import { usePagePeelReady } from "@/components/v3/page-peel";
export default function Playground() {
  const router = useRouter();
  const onReady = usePagePeelReady();
  return <main style={{ height: "100dvh", position: "relative", background: "#171717" }}><Desktop backToPortfolio onReady={onReady} onEscape={() => router.push("/")} /></main>;
}
