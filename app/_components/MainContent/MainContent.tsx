"use client";

import { useFileStore } from "@/app/stores/fileStore";
import WelcomePanel from "@/app/_components/WelcomePanel/WelcomePanel";
import LogViewer from "@/app/_components/LogViewer/LogViewer";

export default function MainContent() {
  const loadedFile = useFileStore((state) => state.loadedFile);
  return loadedFile ? <LogViewer /> : <WelcomePanel />;
}
