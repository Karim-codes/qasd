// One record per storage key. Subscribers share hydration and an ordered write queue.
// Keeping this independent of React/native storage lets us test restart and failure cases.
export interface RecordStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
}

export function createLocalRecord<T>(storage: RecordStorage, key: string, initial: T, validate: (raw: unknown) => T, legacyKeys: string[] = []) {
  let snapshot = { value: initial, ready: false, saving: false, error: null as string | null };
  let loading: Promise<void> | null = null;
  let writes = Promise.resolve();
  let revision = 0;
  const listeners = new Set<() => void>();
  const emit = (patch: Partial<typeof snapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const hydrate = () => {
    if (snapshot.ready) return Promise.resolve();
    if (loading) return loading;
    loading = (async () => {
      try {
        let raw = await storage.getItem(key);
        let migrated = false;
        if (raw === null) {
          for (const legacyKey of legacyKeys) {
            raw = await storage.getItem(legacyKey);
            if (raw !== null) { migrated = true; break; }
          }
        }
        const value = raw === null ? initial : validate(JSON.parse(raw));
        if (migrated) await storage.setItem(key, JSON.stringify(value));
        emit({ value, ready: true, error: null });
      } catch {
        emit({ error: 'Could not load saved progress. Retry before making changes.' });
      } finally {
        loading = null;
      }
    })();
    return loading;
  };
  const update = (change: (previous: T) => T) => {
    if (!snapshot.ready) return Promise.resolve(false);
    const value = change(snapshot.value);
    if (value === snapshot.value) return Promise.resolve(true);
    const current = ++revision;
    const serialized = JSON.stringify(value);
    emit({ value, saving: true, error: null });
    const result = writes.then(async () => {
      try {
        await storage.setItem(key, serialized);
        if (current === revision) emit({ saving: false, error: null });
        return true;
      } catch {
        if (current === revision) emit({ saving: false, error: 'Changes are not saved. Keep the app open and retry.' });
        return false;
      }
    });
    writes = result.then(() => {});
    return result;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate,
    update,
    retry: () => snapshot.ready ? update(value => ({ ...value })) : hydrate(),
  };
}
