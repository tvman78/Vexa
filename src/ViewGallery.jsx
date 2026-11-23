import React, { useEffect, useState } from 'react';
import { useI18n } from './context.js';
import { searchPhotos } from './photoSearch.js';

// Shows the photo that matches the selected tab: engine, interior/cockpit or exterior.
export function ViewGallery({ vehicle, view, local = [], label }) {
  const { t } = useI18n();
  const [state, setState] = useState({ status: 'loading', photos: [] });
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState([]);
  const [loadedSrc, setLoadedSrc] = useState('');
  const localKey = local.map((p) => p.src).join('|');

  useEffect(() => {
    let live = true;
    setIndex(0);
    setBroken([]);
    setLoadedSrc('');
    if (local.length) { setState({ status: 'ready', photos: local }); return undefined; }
    setState({ status: 'loading', photos: [] });
    searchPhotos(vehicle, view)
      .then((photos) => { if (live) setState({ status: photos.length ? 'ready' : 'empty', photos }); })
      .catch(() => { if (live) setState({ status: 'error', photos: [] }); });
    return () => { live = false; };
  }, [vehicle.brand, vehicle.name, view, localKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // A photo that fails to load is skipped, so the tab never stays blank.
  const photos = state.photos.filter((p) => !broken.includes(p.src));
  const status = state.status === 'ready' && !photos.length ? 'error' : state.status;
  const photo = photos[Math.min(index, Math.max(photos.length - 1, 0))];
  const step = (delta) => setIndex((i) => (i + delta + photos.length) % photos.length);
  const message = { loading: t.photoSearching, empty: t.noKindPhoto, error: t.photoError }[status];
  const waiting = !!photo && loadedSrc !== photo.src;

  return (
    <section className="gallery" data-view={view} data-status={status}>
      <div className="gallery-main">
        {photo && <img key={photo.src} src={photo.src} alt={`${vehicle.brand} ${vehicle.name} - ${label}`} onLoad={() => setLoadedSrc(photo.src)} onError={() => { setBroken((list) => [...list, photo.src]); setIndex(0); }} />}
        {!photo && <span className="no-photo view-message">{message}</span>}
        {waiting && <span className="no-photo view-message view-overlay">{t.photoSearching}</span>}
        <span className="photo-kind">{label}</span>
        {photos.length > 1 && <>
          <button className="nav prev" aria-label={t.back} onClick={() => step(-1)}><span className="flip">‹</span></button>
          <button className="nav next" aria-label={t.photoBy} onClick={() => step(1)}><span className="flip">›</span></button>
        </>}
      </div>
      {photos.length > 1 && <div className="thumbs">{photos.map((p, i) => (
        <button key={p.src} className={i === index ? 'on' : ''} aria-label={`${t.photoBy} ${i + 1}`} onClick={() => setIndex(i)}><img src={p.src} alt="" loading="lazy" /></button>
      ))}</div>}
      {photo?.url && <a className="credit" href={photo.url} target="_blank" rel="noreferrer">{t.photoBy}: <bdi>{photo.author}</bdi> · <bdi>{photo.license}</bdi> · Wikimedia Commons</a>}
    </section>
  );
}
