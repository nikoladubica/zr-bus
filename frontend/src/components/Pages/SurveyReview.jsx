import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

import ToastContainer, { ToastProvider, useToast } from '../UI/Toast';
import { API_URL, SURVEY_API, authFetch } from '../../utils/api';
import { position } from '../../utils/enums';

const glassCard = 'bg-white/5 border border-white/10 rounded-xl';
const inputCls = 'px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-white/30';
const labelCls = 'block text-xs text-white/50 mb-1';
const btnBase = 'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none';

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
            <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
                <p className="text-white/40 text-sm">Učitavanje...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
            <ToastContainer />
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200 cursor-pointer"
                    >
                        ← Nazad na admin
                    </button>
                    <h1 className="text-lg font-semibold text-white">Pregled snimanja</h1>
                </div>

                <div className={`${glassCard} p-5 grid grid-cols-2 md:grid-cols-4 gap-4`}>
                    <div>
                        <p className={labelCls}>Linija</p>
                        <p className="text-white/90 text-sm font-medium">{lineName}</p>
                    </div>
                    <div>
                        <p className={labelCls}>Datum</p>
                        <p className="text-white/70 text-sm">
                            {session?.started_at
                                ? new Date(session.started_at).toLocaleDateString('sr-RS')
                                : '—'}
                        </p>
                    </div>
                    <div>
                        <p className={labelCls}>GPS tačaka</p>
                        <p className="text-white/70 text-sm tabular-nums">
                            {rawTrackPositions.length}
                        </p>
                    </div>
                    <div>
                        <p className={labelCls}>Stanica</p>
                        <p className="text-white/70 text-sm tabular-nums">{surveyStops.length}</p>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 450 }}>
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

                <div className={`${glassCard} p-5 flex flex-col gap-4`}>
                    <h2 className="text-sm font-semibold text-white">Akcije</h2>

                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className={labelCls}>Tolerancija simplifikacije</label>
                            <input
                                type="number"
                                className={inputCls}
                                value={tolerance}
                                min={0.00001}
                                max={0.001}
                                step={0.00001}
                                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                            />
                        </div>
                        <button
                            onClick={handleUseAsRoute}
                            disabled={routeUsed}
                            className={`${btnBase} bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {routeUsed ? 'Ruta primenjena' : 'Koristi kao rutu'}
                        </button>
                        <button
                            onClick={handleMergeStops}
                            disabled={stopsMerged || surveyStops.length === 0}
                            className={`${btnBase} bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {stopsMerged ? 'Stanice spojene' : 'Spoji stanice'}
                        </button>
                        <button
                            onClick={handleDiscard}
                            className={`${btnBase} bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30`}
                        >
                            Odbaci snimanje
                        </button>
                    </div>
                </div>

                {surveyStops.length > 0 && (
                    <div className={`${glassCard} overflow-x-auto`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-white/40 text-xs">
                                    <th className="text-left px-4 py-3">Latinični</th>
                                    <th className="text-left px-4 py-3">Ćirilični</th>
                                    <th className="text-left px-4 py-3">Lat</th>
                                    <th className="text-left px-4 py-3">Lng</th>
                                    <th className="text-left px-4 py-3">Pos. ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surveyStops.map((stop, i) => (
                                    <tr key={stop?.id ?? i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3 text-white/80">{stop?.candidate_name_lat ?? stop?.lat_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-white/60">{stop?.candidate_name_cyr ?? stop?.cyr_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-white/40 font-mono text-xs">{stop?.lat ?? '—'}</td>
                                        <td className="px-4 py-3 text-white/40 font-mono text-xs">{stop?.lng ?? '—'}</td>
                                        <td className="px-4 py-3 text-white/30 font-mono text-xs">{stop?.existing_location_id ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
