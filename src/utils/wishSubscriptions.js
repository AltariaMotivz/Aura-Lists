// Keep legacy data when available; older deployments intentionally deny that collection.
export function wishTime(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function subscribeWishSources(ownerIds, listen, onChange) {
  const ids = [...new Set(ownerIds.filter(Boolean))];
  const sources = [];
  for (let i = 0; i < ids.length; i += 10) {
    for (const collection of ['wishes', 'wishlist']) {
      sources.push({ collection, ids: ids.slice(i, i + 10), items: [], pending: true, error: false });
    }
  }
  let active = true;
  const publish = () => {
    if (!active) return;
    onChange({
      items: sources.flatMap(source => source.items).sort((a, b) => wishTime(b.createdAt) - wishTime(a.createdAt)),
      loading: sources.some(source => source.pending),
      error: sources.some(source => source.error)
    });
  };
  publish();
  const unsubscribes = sources.map(source => listen(source.collection, source.ids,
    items => { source.items = items; source.pending = false; source.error = false; publish(); },
    error => {
      source.pending = false;
      source.items = [];
      source.error = !(source.collection === 'wishlist' && ['permission-denied', 'firestore/permission-denied'].includes(error.code));
      publish();
    }
  ));
  return () => { active = false; unsubscribes.forEach(unsubscribe => unsubscribe()); };
}
