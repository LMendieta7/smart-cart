import { useRef, useState } from "react";

export default function useSaveAction() {
  const busy = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  async function save(action) {
    if (busy.current) return;
    busy.current = true;
    setIsSaving(true);
    setError("");
    try {
      await action();
    } catch (error) {
      setError(error.message || "Could not save. Please try again.");
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  }
  return { save, isSaving, error };
}
