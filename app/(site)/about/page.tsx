import type { Metadata } from "next";
import { AboutView } from "@/components/pages/about/AboutView";

export const metadata: Metadata = { title: "About the exchange" };

export default function AboutPage() {
  return <AboutView />;
}
