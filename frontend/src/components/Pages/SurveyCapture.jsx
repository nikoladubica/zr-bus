import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { API_URL, SURVEY_API, authFetch } from '../../utils/api';
import { getDistance } from '../../utils/helpers';
import { position } from '../../utils/enums';

const glassCard = 'bg-white/5 border border-white/10 rounded-xl';
const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-white/30';
const labelCls = 'block text-xs text-white/50 mb-1';

const StopModal = ({ currentPos, allLocations, onConfirm, onClose }) => {
    const [nameLat, setNameLat] = useState('');
    const [nameCyr, setNameCyr] = useState('');
    const [existingId, setExistingId] = useState('');

    const nearbyLocations = allLocations.filter((loc) => {
        if (!currentPos || !loc.lat || !loc.lng) return false;
        const dist = getDistance(
            [currentPos.lat, currentPos.lng],
            [loc.lat, loc.lng],
        );
        return dist <= 200;
    }).map((loc) => ({
        ...loc,
        distance: Math.round(getDistance(
            [currentPos.lat, currentPos.lng],
            [loc.lat, loc.lng],
        )),
    })).sort((a, b) => a.distance - b.distance);

    const handleConfirm = () => {
        if (!nameLat.trim()) return;
        onConfirm({
            lat: currentPos?.lat ?? position.lat,
            lng: currentPos?.lng ?? position.lng,
            candidate_name_lat: nameLat.trim(),
            candidate_name_cyr: nameCyr.trim(),
            existing_location_id: existingId ? parseInt(existingId) : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`${glassCard} w-full max-w-md p-6 flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Označi stanicu</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">&times;</button>
                </div>
                <div>
                    <label className={labelCls}>Latinični naziv</label>
                    <input
                        className={inputCls}
                        value={nameLat}
                        onChange={(e) => setNameLat(e.target.value)}
                        placeholder="Trg slobode"
                        autoFocus
                    />
                </div>
                <div>
                    <label className={labelCls}>Ćirilični naziv</label>
                    <input
                        className={inputCls}
                        value={nameCyr}
                        onChange={(e) => setNameCyr(e.target.value)}
                        placeholder="Трг слободе"
                    />
                </div>
                {nearbyLocations.length > 0 && (
                    <div>
                        <label className={labelCls}>Poveži s postojećom stanicom (opciono)</label>
                        <select
                            className={inputCls}
                            value={existingId}
                            onChange={(e) => setExistingId(e.target.value)}
                        >
                            <option value="">— ne povezuj —</option>
                            {nearbyLocations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.lat_name} ({loc.distance}m)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex gap-2 justify-end pt-2">
                    <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-white/50 hover:text-white/70 transition-all duration-200 cursor-pointer"
                        onClick={onClose}
                    >
                        Otkaži
                    </button>
                    <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 cursor-pointer"
                        onClick={handleConfirm}
                        disabled={!nameLat.trim()}
                    >
                        Potvrdi
                    </button>
                </div>
            </div>
        </div>
    );
};

const SurveyCapture = () => {
    const navigate = useNavigate();

    const [lines, setLines] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [selectedLineId, setSelectedLineId] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [recording, setRecording] = useState(false);
    const [stopModalOpen, setStopModalOpen] = useState(false);
    const [geoError, setGeoError] = useState(null);
    const [wakeLockAvailable, setWakeLockAvailable] = useState(true);
    const [counter, setCounter] = useState({ points: 0, stops: 0 });
    const [submitting, setSubmitting] = useState(false);

    const gpsPointsRef = useRef([]);
    const markedStopsRef = useRef([]);
    const currentPosRef = useRef(null);
    const watchIdRef = useRef(null);
    const wakeLockRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/lines`).then((r) => r.json()).then(setLines);
        fetch(`${API_URL}/locations`).then((r) => r.json()).then(setAllLocations);
    }, []);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
            if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
        };
    }, []);

    const startRecording = useCallback(async () => {
        if (!navigator.geolocation) {
            setGeoError('Geolokacija nije dostupna na ovom uređaju.');
            return;
        }

        const res = await authFetch(`${SURVEY_API}/sessions`, {
            method: 'POST',
            body: JSON.stringify({ line_id: parseInt(selectedLineId) }),
        });
        const session = await res.json();
        setSessionId(session.id);

        gpsPointsRef.current = [];
        markedStopsRef.current = [];

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const point = [pos.coords.latitude, pos.coords.longitude];
                gpsPointsRef.current.push(point);
                currentPosRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 0 },
        );

        try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
            setWakeLockAvailable(false);
        }

        intervalRef.current = setInterval(() => {
            setCounter({ points: gpsPointsRef.current.length, stops: markedStopsRef.current.length });
        }, 3000);

        setRecording(true);
    }, [selectedLineId]);

    const handleMarkStop = useCallback((stopData) => {
        markedStopsRef.current.push(stopData);
        setStopModalOpen(false);
        setCounter({ points: gpsPointsRef.current.length, stops: markedStopsRef.current.length });
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (wakeLockRef.current) {
            wakeLockRef.current.release().catch(() => {});
            wakeLockRef.current = null;
        }

        await authFetch(`${SURVEY_API}/sessions/${sessionId}/submit`, {
            method: 'PATCH',
            body: JSON.stringify({ points: gpsPointsRef.current, stops: markedStopsRef.current }),
        });

        navigate(`/admin/survey/${sessionId}`);
    }, [sessionId, navigate]);

    if (geoError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 flex items-center justify-center">
                <div className={`${glassCard} p-6 max-w-sm text-center`}>
                    <p className="text-white/70 text-sm mb-4">{geoError}</p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all duration-200 cursor-pointer"
                    >
                        Nazad na admin
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
            <div className="max-w-lg mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200 cursor-pointer"
                    >
                        ← Poništi snimanje
                    </button>
                    <h1 className="text-lg font-semibold text-white">Terensko snimanje</h1>
                </div>

                {!wakeLockAvailable && recording && (
                    <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                        Drži ekran aktivan tokom snimanja
                    </div>
                )}

                {!recording ? (
                    <div className={`${glassCard} p-6 flex flex-col gap-5`}>
                        <div>
                            <label className={labelCls}>Odaberi liniju</label>
                            <select
                                className={inputCls}
                                value={selectedLineId}
                                onChange={(e) => setSelectedLineId(e.target.value)}
                            >
                                <option value="">— izaberi liniju —</option>
                                {lines.map((l) => (
                                    <option key={l.id} value={l.id}>{l.number} — {l.lat_name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={startRecording}
                            disabled={!selectedLineId}
                            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                selectedLineId
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                            }`}
                        >
                            Počni snimanje
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className={`${glassCard} p-8 text-center`}>
                            <p className="text-5xl font-bold text-white tabular-nums">{counter.points}</p>
                            <p className="text-white/40 text-sm mt-2">GPS tačaka</p>
                            <div className="mt-4 h-px bg-white/10" />
                            <p className="text-3xl font-semibold text-emerald-400 tabular-nums mt-4">{counter.stops}</p>
                            <p className="text-white/40 text-sm mt-1">stanica označeno</p>
                        </div>

                        <button
                            onClick={() => setStopModalOpen(true)}
                            className="w-full py-4 rounded-xl text-base font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 cursor-pointer"
                        >
                            + Označi stanicu
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-4 rounded-xl text-base font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Slanje...' : 'Završi snimanje'}
                        </button>
                    </div>
                )}
            </div>

            {stopModalOpen && (
                <StopModal
                    currentPos={currentPosRef.current}
                    allLocations={allLocations}
                    onConfirm={handleMarkStop}
                    onClose={() => setStopModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SurveyCapture;
