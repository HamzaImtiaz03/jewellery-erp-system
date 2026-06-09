import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark, BRAND } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div className="app-ambient" aria-hidden />
      <BrandMark size={52} />
      <p className="relative mt-6 text-5xl font-bold tracking-tight tnum">404</p>
      <p className="relative mt-2 text-lg font-semibold">Screen not found</p>
      <p className="relative mt-1 max-w-sm text-sm text-muted-foreground">
        This route isn't part of the {BRAND.name} module map. It may have moved
        or isn't enabled for your domain.
      </p>
      <Link
        href="/dashboard"
        className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>
    </div>
  );
}
