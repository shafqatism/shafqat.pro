import {
  BookOpenCheck,
  Car,
  Globe,
  GraduationCap,
  Hospital,
  Megaphone,
  Pill,
  ScanBarcode,
  Scale,
  ShoppingCart,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Users,
  Warehouse,
  Workflow,
  FolderKanban,
  type LucideProps,
} from "lucide-react";
import type { ProductIcon } from "@/lib/content";

const icons = {
  stethoscope: Stethoscope,
  hospital: Hospital,
  graduation: GraduationCap,
  learning: BookOpenCheck,
  law: Scale,
  pos: ScanBarcode,
  restaurant: UtensilsCrossed,
  truck: Truck,
  warehouse: Warehouse,
  hr: Users,
  projects: FolderKanban,
  pharma: Pill,
  erp: Workflow,
  marketing: Megaphone,
  car: Car,
  globe: Globe,
  cart: ShoppingCart,
} as const;

export function ProductGlyph({ name, ...props }: { name: ProductIcon } & LucideProps) {
  const Icon = icons[name];
  return <Icon {...props} />;
}
