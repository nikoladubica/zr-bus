import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

import ToastContainer, { ToastProvider, useToast } from '../UI/Toast';
import { API_URL, SURVEY_API, authFetch } from '../../utils/api';
import { position } from '../../utils/enums';

const winInput = 'win-input';
const winLabel = 'win-label';
const winBtn = 'win-btn';

const TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

const SurveyReviewInner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [session, setSession] = useState(null);
    const [existingRoute, setExistingRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tolerance, setTolerance] = useState(0.0001);
    const [routeUsed, setRouteUsed] = useState(false);
    const [stopsMerged, setStopsMerged] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            const res = await authFetch(`${SURVEY_API}/sessions/${id}`);
            const data = await res.json();
            if (cancelled) return;
            setSession(data);

            if (data?.line_id) {
                const routeRes = await fetch(`${API_URL}/lines-routes/${data.line_id}`);
                if (!cancelled && routeRes.ok) {
                    const routeData = await routeRes.json();
                    setExistingRoute(routeData);
                }
            }
            setLoading(false);
        };

        load();
        return () => { cancelled = true; };
    }, [id]);

    const rawTrackPositions = useMemo(() => {
        const points = session?.raw_track?.coordinates ?? session?.points ?? [];
        return points.map(([lng, lat]) => [lat, lng]);
    }, [session]);

    const existingRoutePositions = useMemo(() => {
        const coords = existingRoute?.route?.coordinates ?? existingRoute?.coordinates ?? [];
        return coords.map(([lng, lat]) => [lat, lng]);
    }, [existingRoute]);

    const mapCenter = useMemo(() => {
        if (rawTrackPositions.length > 0) return rawTrackPositions[0];
        return [position.lat, position.lng];
    }, [rawTrackPositions]);

    const surveyStops = useMemo(() => session?.stops ?? [], [session]);

    const handleUseAsRoute = useCallback(async () => {
        const res = await authFetch(`${SURVEY_API}/sessions/${id}/use-as-route`, {
            method: 'POST',
            body: JSON.stringify({ simplify_tolerance: tolerance }),
        });
        if (res.ok) {
            addToast('Ruta uspešno primenjena!', 'success');
            setRouteUsed(true);
        } else {
            addToast('Greška pri primeni rute.', 'error');
        }
    }, [id, tolerance, addToast]);

    const handleMergeStops = useCallback(async () => {
        const res = await authFetch(`${SURVEY_API}/sessions/${id}/merge-stops`, {
            method: 'POST',
        });
        if (res.ok) {
            addToast('Stanice uspešno spojene!', 'success');
            setStopsMerged(true);
        } else {
            addToast('Greška pri spajanju stanica.', 'error');
        }
    }, [id, addToast]);

    const handleDiscard = useCallback(async () => {
        if (!window.confirm('Odbaciti ovo snimanje? Ova akcija je nepovratna.')) return;
        const res = await authFetch(`${SURVEY_API}/sessions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            navigate('/admin');
        } else {
            addToast('Greška pri brisanju.', 'error');
        }
    }, [id, navigate, addToast]);

    const lineColor = session?.line_hex_color ?? session?.line?.hex_color ?? '#3b82f6';
    const lineName = session?.line_number
        ? `${session.line_number} — ${session.line_lat_name}`
        : session?.line
            ? `${session.line.number} — ${session.line.lat_name}`
            : `Linija #${session?.line_id ?? id}`;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>Učitavanje...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#c0c0c0', fontFamily: "Tahoma, 'MS Sans Serif', sans-serif" }}>
            <ToastContainer />
            <div className="win-titlebar" style={{ padding: '4px 8px' }}>
                <span>Pregled snimanja</span>
                <button className={winBtn} style={{ fontSize: 11 }} onClick={() => navigate('/admin')}>← Admin</button>
            </div>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="win-panel" style={{ padding: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        <div>
                            <p className={winLabel}>Linija</p>
                            <p style={{ fontSize: 11, margin: 0 }}>{lineName}</p>
                        </div>
                        <div>
                            <p className={winLabel}>Datum</p>
                            <p style={{ fontSize: 11, margin: 0 }}>
                                {session?.started_at
                                    ? new Date(session.started_at).toLocaleDateString('sr-RS')
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className={winLabel}>GPS tačaka</p>
                            <p style={{ fontSize: 11, fontFamily: 'monospace', margin: 0 }}>{rawTrackPositions.length}</p>
                        </div>
                        <div>
                            <p className={winLabel}>Stanica</p>
                            <p style={{ fontSize: 11, fontFamily: 'monospace', margin: 0 }}>{surveyStops.length}</p>
                        </div>
                    </div>
                </div>

                <div className="win-panel" style={{ padding: 4 }}>
                    <div style={{ height: 420, border: '2px inset #808080' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url={TILE_URL} />

                            {existingRoutePositions.length > 0 && (
                                <Polyline
                                    positions={existingRoutePositions}
                                    pathOptions={{ color: lineColor, opacity: 0.4, weight: 4 }}
                                />
                            )}

                            {rawTrackPositions.length > 0 && (
                                <Polyline
                                    positions={rawTrackPositions}
                                    pathOptions={{ color: '#3b82f6', opacity: 0.9, weight: 3, dashArray: '8 6' }}
                                />
                            )}

                            {surveyStops.map((stop, i) => (
                                stop?.lat && stop?.lng ? (
                                    <Marker key={stop?.id ?? i} position={[stop.lat, stop.lng]}>
                                        <Popup>
                                            <strong>{stop.candidate_name_lat ?? stop.lat_name}</strong>
                                            {stop.candidate_name_cyr && (
                                                <><br />{stop.candidate_name_cyr}</>
                                            )}
                                        </Popup>
                                    </Marker>
                                ) : null
                            ))}
                        </MapContainer>
                    </div>
                </div>

                <div className="win-panel" style={{ padding: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>Akcije</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 6 }}>
                        <div>
                            <label className={winLabel}>Tolerancija simplifikacije</label>
                            <input
                                type="number"
                                className={winInput}
                                value={tolerance}
                                min={0.00001}
                                max={0.001}
                                step={0.00001}
                                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                                style={{ width: 120 }}
                            />
                        </div>
                        <button
                            className="win-btn win-btn-success"
                            onClick={handleUseAsRoute}
                            disabled={routeUsed}
                        >
                            {routeUsed ? 'Ruta primenjena' : 'Koristi kao rutu'}
                        </button>
                        <button
                            className={winBtn}
                            onClick={handleMergeStops}
                            disabled={stopsMerged || surveyStops.length === 0}
                        >
                            {stopsMerged ? 'Stanice spojene' : 'Spoji stanice'}
                        </button>
                        <button
                            className="win-btn win-btn-danger"
                            onClick={handleDiscard}
                        >
                            Odbaci snimanje
                        </button>
                    </div>
                </div>

                {surveyStops.length > 0 && (
                    <div className="win-panel" style={{ padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>Kandidati za stanice</p>
                        <div className="overflow-x-auto">
                            <table className="win-table">
                                <thead>
                                    <tr>
                                        <th>Latinični</th>
                                        <th>Ćirilični</th>
                                        <th>Lat</th>
                                        <th>Lng</th>
                                        <th>Pos. ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surveyStops.map((stop, i) => (
                                        <tr key={stop?.id ?? i}>
                                            <td>{stop?.candidate_name_lat ?? stop?.lat_name ?? '—'}</td>
                                            <td>{stop?.candidate_name_cyr ?? stop?.cyr_name ?? '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{stop?.lat ?? '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{stop?.lng ?? '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{stop?.existing_location_id ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SurveyReview = () => (
    <ToastProvider>
        <SurveyReviewInner />
    </ToastProvider>
);

export default SurveyReview;
