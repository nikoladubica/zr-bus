import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';

import { API_URL, SURVEY_API, authFetch } from '../../utils/api';
import { getDistance } from '../../utils/helpers';
import { position } from '../../utils/enums';

const winInput = 'win-input';
const winLabel = 'win-label';
const winBtn = 'win-btn';

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

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="win-dialog flex flex-col w-full max-w-md max-h-[90vh]">
                <div className="win-titlebar">
                    <span>Označi stanicu</span>
                    <button onClick={onClose} className="win-close-btn">✕</button>
                </div>
                <div className="overflow-y-auto p-4 flex flex-col gap-3">
                    <div>
                        <label className={winLabel}>Latinični naziv</label>
                        <input
                            className={winInput}
                            value={nameLat}
                            onChange={(e) => setNameLat(e.target.value)}
                            placeholder="Trg slobode"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className={winLabel}>Ćirilični naziv</label>
                        <input
                            className={winInput}
                            value={nameCyr}
                            onChange={(e) => setNameCyr(e.target.value)}
                            placeholder="Трг слободе"
                        />
                    </div>
                    {nearbyLocations.length > 0 && (
                        <div>
                            <label className={winLabel}>Poveži s postojećom stanicom (opciono)</label>
                            <select
                                className={winInput}
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
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button type="button" className={winBtn} onClick={onClose}>Otkaži</button>
                        <button
                            type="button"
                            className="win-btn win-btn-success"
                            onClick={handleConfirm}
                            disabled={!nameLat.trim()}
                        >
                            Potvrdi
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
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
            <div style={{ minHeight: '100vh', width: '100vw', background: '#c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="win-panel" style={{ maxWidth: 360, padding: 16, textAlign: 'center' }}>
                    <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11, marginBottom: 8 }}>{geoError}</p>
                    <button className={winBtn} onClick={() => navigate('/admin')}>Nazad na admin</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#c0c0c0', fontFamily: "Tahoma, 'MS Sans Serif', sans-serif" }}>
            <div className="win-titlebar" style={{ padding: '4px 8px' }}>
                <span>Terensko snimanje</span>
                <button className={winBtn} style={{ fontSize: 11 }} onClick={() => navigate('/admin')}>← Admin</button>
            </div>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: 8 }}>
                {!wakeLockAvailable && recording && (
                    <div className="win-panel" style={{ padding: '6px 10px', marginBottom: 8, border: '2px solid #808080' }}>
                        <span style={{ fontSize: 11 }}>Drži ekran aktivan tokom snimanja</span>
                    </div>
                )}

                {!recording ? (
                    <div className="win-panel" style={{ padding: 8 }}>
                        <div style={{ marginBottom: 8 }}>
                            <label className={winLabel}>Odaberi liniju</label>
                            <select
                                className={winInput}
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
                            className="win-btn win-btn-success"
                            style={{ width: '100%', padding: '8px 0' }}
                            onClick={startRecording}
                            disabled={!selectedLineId}
                        >
                            Počni snimanje
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="win-panel" style={{ padding: 12, textAlign: 'center' }}>
                            <p style={{ fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace', margin: '0 0 2px 0' }}>{counter.points}</p>
                            <p style={{ fontSize: 11, color: '#444', margin: '0 0 10px 0' }}>GPS tačaka</p>
                            <div style={{ height: 1, background: '#808080', margin: '8px 0' }} />
                            <p style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', margin: '8px 0 2px 0' }}>{counter.stops}</p>
                            <p style={{ fontSize: 11, color: '#444', margin: 0 }}>stanica označeno</p>
                        </div>

                        <button
                            className="win-btn win-btn-success"
                            style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                            onClick={() => setStopModalOpen(true)}
                        >
                            + Označi stanicu
                        </button>

                        <button
                            className="win-btn win-btn-danger"
                            style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                            onClick={handleSubmit}
                            disabled={submitting}
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
