// Serialize writes and discard results from an earlier list selection or load.
export function createListRequests() {
  let selectedId = "";
  let version = 0;
  let queue = Promise.resolve();
  return {
    select(id) {
      if (selectedId === id) return false;
      selectedId = id;
      version += 1;
      return true;
    },
    load(id, operation, onSuccess, onError) {
      const token = ++version;
      let cancelled = false;
      queue.then(operation).then((detail) => {
        if (!cancelled && selectedId === id && token === version) onSuccess(detail);
      }).catch((error) => {
        if (!cancelled && selectedId === id && token === version) onError(error);
      });
      return () => { cancelled = true; };
    },
    mutate(id, operation, onSuccess) {
      const pending = queue.then(async () => {
        const token = selectedId === id ? ++version : version;
        const detail = await operation();
        if (selectedId === id && token === version) onSuccess(detail);
      });
      queue = pending.catch(() => {});
      return pending;
    },
  };
}
