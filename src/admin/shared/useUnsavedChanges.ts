import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to manage unsaved changes protection.
 * Warns users before leaving the page with unsaved changes.
 */
export function useUnsavedChanges(initialDirty = false) {
  const [isDirty, setIsDirty] = useState(initialDirty);

  // Browser reload / navigation guard
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const setDirty = useCallback((dirty: boolean = true) => {
    setIsDirty(dirty);
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    isDirty,
    setDirty,
    markClean,
  };
}
