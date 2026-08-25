import type { Metadata } from "next";

import FullPlaygroundClient from "@/components/playground/FullPlaygroundClient";

export const metadata: Metadata = {
  title: "Web Playground | Tech Path",

  description:
    "Experiment with HTML, CSS and JavaScript examples from Tech Path tutorials.",
};

export default function PlaygroundPage() {
  return <FullPlaygroundClient />;
}
