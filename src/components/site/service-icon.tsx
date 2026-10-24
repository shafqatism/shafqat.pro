import { Cloud, Code2, Globe, Layers, Rocket, Smartphone, type LucideProps } from "lucide-react";
import type { Service } from "@/lib/content";

const map = { code: Code2, globe: Globe, layers: Layers, smartphone: Smartphone, cloud: Cloud, rocket: Rocket } as const;

export function ServiceIcon({ name, ...props }: { name: Service["icon"] } & LucideProps) {
  const Icon = map[name];
  return <Icon {...props} />;
}
