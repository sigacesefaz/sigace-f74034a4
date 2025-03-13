
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Court } from "@/types/datajud";
import { courts } from "@/services/courts";

export function useProcessSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Now courts is correctly imported above before being used
  const courtOptions = Object.values(courts).flat();

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm && !selectedCourt) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        let query = supabase.from("processes").select("*");

        if (searchTerm) {
          query = query.ilike("number", `%${searchTerm}%`);
        }

        if (selectedCourt) {
          query = query.eq("court", selectedCourt.name);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.error("Error searching processes:", error);
          throw error;
        }

        setResults(data || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCourt]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCourt,
    setSelectedCourt,
    loading,
    results,
    courtOptions
  };
}
