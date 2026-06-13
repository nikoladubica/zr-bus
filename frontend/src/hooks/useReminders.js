import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'zrbus_reminders';
const LEAD_MIN = 5;

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};

const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const makeTag = (lineId, stopId, depMins) => `zrbus_${lineId}_${stopId}_${depMins}`;

const postToSW = (msg) => {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  }
};

export const useReminders = () => {
  const [tags, setTags] = useState(() => new Set(Object.keys(load())));
  const [permDenied, setPermDenied] = useState(false);

  useEffect(() => {
    const register = () => {
      const stored = load();
      const now = Date.now();
      const active = {};
      for (const [tag, entry] of Object.entries(stored)) {
        if (entry.fireAt > now) {
          postToSW({ type: 'SCHEDULE_NOTIFICATION', tag, ...entry });
          active[tag] = entry;
        }
      }
      save(active);
      setTags(new Set(Object.keys(active)));
    };

    if (navigator.serviceWorker?.controller) register();
    navigator.serviceWorker?.addEventListener('controllerchange', register);
    return () => navigator.serviceWorker?.removeEventListener('controllerchange', register);
  }, []);

  const schedule = useCallback(async ({ lineId, stopId, lineNumber, dest, depMins, isCyrillic }) => {
    if (Notification.permission === 'denied') { setPermDenied(true); return false; }
    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') { setPermDenied(true); return false; }
    }
    setPermDenied(false);

    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const delayMins = depMins - nowMins - LEAD_MIN;
    if (delayMins <= 0) return false;

    const tag = makeTag(lineId, stopId, depMins);
    const title = isCyrillic ? `Аутобус ${lineNumber}` : `Autobus ${lineNumber}`;
    const body = isCyrillic
      ? `→ ${dest} полази за ${LEAD_MIN} мин`
      : `→ ${dest} polazi za ${LEAD_MIN} min`;
    const fireAt = Date.now() + delayMins * 60_000;

    const stored = load();
    stored[tag] = { fireAt, title, body };
    save(stored);

    postToSW({ type: 'SCHEDULE_NOTIFICATION', tag, title, body, fireAt });
    setTags((prev) => new Set([...prev, tag]));
    return true;
  }, []);

  const cancel = useCallback(({ lineId, stopId, depMins }) => {
    const tag = makeTag(lineId, stopId, depMins);
    const stored = load();
    delete stored[tag];
    save(stored);
    postToSW({ type: 'CANCEL_NOTIFICATION', tag });
    setTags((prev) => { const n = new Set(prev); n.delete(tag); return n; });
  }, []);

  const isScheduled = useCallback(
    (lineId, stopId, depMins) => tags.has(makeTag(lineId, stopId, depMins)),
    [tags]
  );

  return { schedule, cancel, isScheduled, permDenied };
};
