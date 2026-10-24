"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteSettings } from "@/lib/settings";
import { revalidateSite, supabaseBrowser } from "@/lib/supabase/browser";

/** Loads the single site_settings row and saves shallow-merged changes, then refreshes the live site. */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabaseBrowser()
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setSettings(data.data as SiteSettings);
      });
  }, []);

  const save = useCallback(
    async (patch: Partial<SiteSettings>) => {
      if (!settings) return;
      setSaving(true);
      const next = { ...settings, ...patch };
      const { error } = await supabaseBrowser().from("site_settings").update({ data: next }).eq("id", 1);
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
      setSettings(next);
      try {
        await revalidateSite(["settings", "seo"]);
        toast.success("Saved — live site refreshed");
      } catch {
        toast.success("Saved (site will refresh within the hour)");
      }
      setSaving(false);
    },
    [settings],
  );

  return { settings, setSettings, save, saving };
}
