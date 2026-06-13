import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router';

import ToastContainer, { ToastProvider, useToast } from '../UI/Toast';
import { DEPARTURES_API, LINES_API, LINES_LOCATIONS_API, LOCATIONS_API, authFetch } from '../../utils/api';
import { position } from '../../utils/enums';
import useStore from '../../store/client/useStore';

// ─── shared helpers ────────────────────────────────────────────────────────────

const TABS = ['Linije', 'Stanice', 'Dodela stanica', 'Polasci'];

const DAY_TYPES = [
    { value: 'workday', label: 'Radni dan' },
    { value: 'saturday', label: 'Subota' },
    { value: 'sunday', label: 'Nedelja' },
];

const glassCard = 'bg-white/5 border border-white/10 rounded-xl';
const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-white/30';
const labelCls = 'block text-xs text-white/50 mb-1';
const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none cursor-pointer';
const btnPrimary = `${btnBase} bg-white/10 border border-white/20 text-white hover:bg-white/20`;
const btnDanger = `${btnBase} bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30`;
const btnSuccess = `${btnBase} bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30`;

// ─── Modal wrapper ──────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={`${glassCard} w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

// ─── Map click handler for stop placement ──────────────────────────────────────

const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
    return null;
};

// ─── LINES TAB ─────────────────────────────────────────────────────────────────

const LinesTab = () => {
    const { addToast } = useToast();
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ number: '', lat_name: '', cyr_name: '', hex_color: '#ffffff', direction: '' });

    const fetchLines = useCallback(async () => {
        setLoading(true);
        const res = await fetch(LINES_API);
        const data = await res.json();
        setLines(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchLines(); }, [fetchLines]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({ number: '', lat_name: '', cyr_name: '', hex_color: '#ffffff', direction: '' });
        setModalOpen(true);
    };

    const openEdit = (line) => {
        setEditTarget(line);
        setForm({ number: line.number, lat_name: line.lat_name, cyr_name: line.cyr_name, hex_color: line.hex_color ?? '#ffffff', direction: line.direction ?? '' });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati ovu liniju?')) return;
        const res = await authFetch(`${LINES_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('Linija obrisana.', 'success');
            fetchLines();
        } else {
            addToast('Greška pri brisanju.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = { ...form, direction: form.direction || null };
        const url = editTarget ? `${LINES_API}/${editTarget.id}` : LINES_API;
        const method = editTarget ? 'PATCH' : 'POST';
        const res = await authFetch(url, { method, body: JSON.stringify(body) });
        if (res.ok) {
            addToast('Uspešno sačuvano!', 'success');
            setModalOpen(false);
            fetchLines();
        } else {
            const err = await res.json().catch(() => ({}));
            addToast(`Greška: ${err.message ?? res.status}`, 'error');
        }
    };

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">{lines.length} linija</span>
                <button className={btnPrimary} onClick={openCreate}>+ Dodaj liniju</button>
            </div>

            {loading ? (
                <p className="text-sm text-white/40">Učitavanje...</p>
            ) : (
                <div className={`${glassCard} overflow-x-auto`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-white/40 text-xs">
                                <th className="text-left px-4 py-3">Br.</th>
                                <th className="text-left px-4 py-3">Latinični</th>
                                <th className="text-left px-4 py-3">Ćirilični</th>
                                <th className="text-left px-4 py-3">Boja</th>
                                <th className="text-left px-4 py-3">Smer</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l) => (
                                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-4 py-3 text-white/90 font-mono">{l.number}</td>
                                    <td className="px-4 py-3 text-white/80">{l.lat_name}</td>
                                    <td className="px-4 py-3 text-white/60">{l.cyr_name}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: l.hex_color }} />
                                            <span className="text-white/40 text-xs font-mono">{l.hex_color}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white/50">{l.direction ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex gap-2 justify-end">
                                            <button className={btnPrimary} onClick={() => openEdit(l)}>Izmeni</button>
                                            <button className={btnDanger} onClick={() => handleDelete(l.id)}>Obriši</button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <Modal title={editTarget ? 'Izmeni liniju' : 'Nova linija'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Broj linije</label>
                            <input className={inputCls} value={form.number} onChange={setField('number')} placeholder="npr. 4" required />
                        </div>
                        <div>
                            <label className={labelCls}>Latinični naziv</label>
                            <input className={inputCls} value={form.lat_name} onChange={setField('lat_name')} placeholder="Centar - Šangaj" required />
                        </div>
                        <div>
                            <label className={labelCls}>Ćirilični naziv</label>
                            <input className={inputCls} value={form.cyr_name} onChange={setField('cyr_name')} placeholder="Центар - Шангај" required />
                        </div>
                        <div>
                            <label className={labelCls}>Boja</label>
                            <div className="flex items-center gap-3">
                                <input type="color" className="h-9 w-16 rounded-lg cursor-pointer bg-transparent border border-white/10" value={form.hex_color} onChange={setField('hex_color')} />
                                <input className={`${inputCls} flex-1`} value={form.hex_color} onChange={setField('hex_color')} placeholder="#ffffff" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Smer (opciono)</label>
                            <select className={inputCls} value={form.direction} onChange={setField('direction')}>
                                <option value="">Bez smera</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" className={btnBase + ' border border-white/10 text-white/50 hover:text-white/70'} onClick={() => setModalOpen(false)}>Otkaži</button>
                            <button type="submit" className={btnSuccess}>Sačuvaj</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

// ─── STOPS TAB ─────────────────────────────────────────────────────────────────

const StopsTab = () => {
    const { addToast } = useToast();
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ lat_name: '', cyr_name: '', lat: '', lng: '' });

    const fetchStops = useCallback(async () => {
        setLoading(true);
        const res = await fetch(LOCATIONS_API);
        const data = await res.json();
        setStops(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchStops(); }, [fetchStops]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({ lat_name: '', cyr_name: '', lat: '', lng: '' });
        setModalOpen(true);
    };

    const openEdit = (stop) => {
        setEditTarget(stop);
        setForm({ lat_name: stop.lat_name, cyr_name: stop.cyr_name, lat: stop.lat ?? '', lng: stop.lng ?? '' });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati ovu stanicu?')) return;
        const res = await authFetch(`${LOCATIONS_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('Stanica obrisana.', 'success');
            fetchStops();
        } else {
            addToast('Greška pri brisanju.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            lat_name: form.lat_name,
            cyr_name: form.cyr_name,
            lat: form.lat !== '' ? parseFloat(form.lat) : undefined,
            lng: form.lng !== '' ? parseFloat(form.lng) : undefined,
        };
        const url = editTarget ? `${LOCATIONS_API}/${editTarget.id}` : LOCATIONS_API;
        const method = editTarget ? 'PATCH' : 'POST';
        const res = await authFetch(url, { method, body: JSON.stringify(body) });
        if (res.ok) {
            addToast('Uspešno sačuvano!', 'success');
            setModalOpen(false);
            fetchStops();
        } else {
            const err = await res.json().catch(() => ({}));
            addToast(`Greška: ${err.message ?? res.status}`, 'error');
        }
    };

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleMapClick = useCallback((lat, lng) => {
        setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
    }, []);

    const markerPos = useMemo(() => {
        const lat = parseFloat(form.lat);
        const lng = parseFloat(form.lng);
        return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
    }, [form.lat, form.lng]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">{stops.length} stanica</span>
                <button className={btnPrimary} onClick={openCreate}>+ Dodaj stanicu</button>
            </div>

            {loading ? (
                <p className="text-sm text-white/40">Učitavanje...</p>
            ) : (
                <div className={`${glassCard} overflow-x-auto`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-white/40 text-xs">
                                <th className="text-left px-4 py-3">ID</th>
                                <th className="text-left px-4 py-3">Latinični</th>
                                <th className="text-left px-4 py-3">Ćirilični</th>
                                <th className="text-left px-4 py-3">Lat</th>
                                <th className="text-left px-4 py-3">Lng</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stops.map((s) => (
                                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-4 py-3 text-white/30 font-mono text-xs">{s.id}</td>
                                    <td className="px-4 py-3 text-white/90">{s.lat_name}</td>
                                    <td className="px-4 py-3 text-white/60">{s.cyr_name}</td>
                                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{s.lat ?? '—'}</td>
                                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{s.lng ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex gap-2 justify-end">
                                            <button className={btnPrimary} onClick={() => openEdit(s)}>Izmeni</button>
                                            <button className={btnDanger} onClick={() => handleDelete(s.id)}>Obriši</button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <Modal title={editTarget ? 'Izmeni stanicu' : 'Nova stanica'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Latinični naziv</label>
                            <input className={inputCls} value={form.lat_name} onChange={setField('lat_name')} placeholder="Trg slobode" required />
                        </div>
                        <div>
                            <label className={labelCls}>Ćirilični naziv</label>
                            <input className={inputCls} value={form.cyr_name} onChange={setField('cyr_name')} placeholder="Трг слободе" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Geografska širina</label>
                                <input className={inputCls} value={form.lat} onChange={setField('lat')} placeholder="45.380324" />
                            </div>
                            <div>
                                <label className={labelCls}>Geografska dužina</label>
                                <input className={inputCls} value={form.lng} onChange={setField('lng')} placeholder="20.390627" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Klikni na mapi za koordinate</label>
                            <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: 260 }}>
                                <MapContainer
                                    center={markerPos ?? [position.lat, position.lng]}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                >
                                    <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
                                    <MapClickHandler onMapClick={handleMapClick} />
                                    {markerPos && <Marker position={markerPos} />}
                                </MapContainer>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" className={btnBase + ' border border-white/10 text-white/50 hover:text-white/70'} onClick={() => setModalOpen(false)}>Otkaži</button>
                            <button type="submit" className={btnSuccess}>Sačuvaj</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

// ─── ASSIGNMENTS TAB ───────────────────────────────────────────────────────────

const AssignmentsTab = () => {
    const { addToast } = useToast();
    const [lines, setLines] = useState([]);
    const [allStops, setAllStops] = useState([]);
    const [selectedLineId, setSelectedLineId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [addStopId, setAddStopId] = useState('');

    useEffect(() => {
        fetch(LINES_API).then((r) => r.json()).then(setLines);
        fetch(LOCATIONS_API).then((r) => r.json()).then(setAllStops);
    }, []);

    const fetchAssignments = useCallback(async (lineId) => {
        if (!lineId) { setAssignments([]); return; }
        setLoadingAssignments(true);
        const res = await fetch(`${LINES_LOCATIONS_API}/${lineId}`);
        const data = await res.json();
        const sorted = [...data].sort((a, b) => a.stop_number - b.stop_number);
        setAssignments(sorted);
        setLoadingAssignments(false);
    }, []);

    useEffect(() => { fetchAssignments(selectedLineId); }, [selectedLineId, fetchAssignments]);

    const handleReorder = useCallback(async (index, direction) => {
        const next = [...assignments];
        const swapIndex = index + direction;
        if (swapIndex < 0 || swapIndex >= next.length) return;

        const tmp = next[index].stop_number;
        next[index] = { ...next[index], stop_number: next[swapIndex].stop_number };
        next[swapIndex] = { ...next[swapIndex], stop_number: tmp };
        next.sort((a, b) => a.stop_number - b.stop_number);
        setAssignments(next);

        const items = next.map((a) => ({ id: a.id, stop_number: a.stop_number }));
        const res = await authFetch(`${LINES_LOCATIONS_API}/reorder`, {
            method: 'PATCH',
            body: JSON.stringify({ items }),
        });
        if (!res.ok) {
            addToast('Greška pri reorderovanju.', 'error');
            fetchAssignments(selectedLineId);
        }
    }, [assignments, selectedLineId, fetchAssignments, addToast]);

    const handleRemove = async (id) => {
        if (!window.confirm('Ukloniti stanicu sa linije?')) return;
        const res = await authFetch(`${LINES_LOCATIONS_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('Stanica uklonjena.', 'success');
            fetchAssignments(selectedLineId);
        } else {
            addToast('Greška pri uklanjanju.', 'error');
        }
    };

    const handleAdd = async () => {
        if (!addStopId || !selectedLineId) return;
        const maxStop = assignments.reduce((m, a) => Math.max(m, a.stop_number), 0);
        const res = await authFetch(LINES_LOCATIONS_API, {
            method: 'POST',
            body: JSON.stringify({ line_id: parseInt(selectedLineId), location_id: parseInt(addStopId), stop_number: maxStop + 1 }),
        });
        if (res.ok) {
            addToast('Stanica dodata.', 'success');
            setAddStopId('');
            fetchAssignments(selectedLineId);
        } else {
            addToast('Greška pri dodavanju.', 'error');
        }
    };

    const assignedIds = useMemo(() => new Set(assignments.map((a) => a.locations?.id)), [assignments]);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className={labelCls}>Odaberi liniju</label>
                <select className={inputCls} value={selectedLineId} onChange={(e) => setSelectedLineId(e.target.value)}>
                    <option value="">— izaberi liniju —</option>
                    {lines.map((l) => (
                        <option key={l.id} value={l.id}>{l.number} — {l.lat_name}</option>
                    ))}
                </select>
            </div>

            {selectedLineId && (
                <>
                    {loadingAssignments ? (
                        <p className="text-sm text-white/40">Učitavanje...</p>
                    ) : (
                        <div className={`${glassCard} overflow-x-auto`}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-white/40 text-xs">
                                        <th className="text-left px-4 py-3">Br.</th>
                                        <th className="text-left px-4 py-3">Stanica</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((a, i) => (
                                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 text-white/40 font-mono text-xs w-12">{a.stop_number}</td>
                                            <td className="px-4 py-3 text-white/80">{a.locations?.lat_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="flex gap-1 justify-end">
                                                    <button className={btnPrimary} onClick={() => handleReorder(i, -1)} disabled={i === 0}>↑</button>
                                                    <button className={btnPrimary} onClick={() => handleReorder(i, 1)} disabled={i === assignments.length - 1}>↓</button>
                                                    <button className={btnDanger} onClick={() => handleRemove(a.id)}>Ukloni</button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={`${glassCard} p-4 flex gap-3 items-end`}>
                        <div className="flex-1">
                            <label className={labelCls}>Dodaj stanicu na liniju</label>
                            <select className={inputCls} value={addStopId} onChange={(e) => setAddStopId(e.target.value)}>
                                <option value="">— izaberi stanicu —</option>
                                {allStops.filter((s) => !assignedIds.has(s.id)).map((s) => (
                                    <option key={s.id} value={s.id}>{s.lat_name}</option>
                                ))}
                            </select>
                        </div>
                        <button className={btnSuccess} onClick={handleAdd}>Dodaj</button>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── DEPARTURES TAB ────────────────────────────────────────────────────────────

const DeparturesTab = () => {
    const { addToast } = useToast();
    const [lines, setLines] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [departures, setDepartures] = useState([]);
    const [selectedLineId, setSelectedLineId] = useState('');
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [dayType, setDayType] = useState('workday');
    const [loading, setLoading] = useState(false);
    const [newTime, setNewTime] = useState('');
    const [bulkText, setBulkText] = useState('');

    useEffect(() => {
        fetch(LINES_API).then((r) => r.json()).then(setLines);
    }, []);

    useEffect(() => {
        if (!selectedLineId) { setAssignments([]); setSelectedAssignmentId(''); return; }
        fetch(`${LINES_LOCATIONS_API}/${selectedLineId}`)
            .then((r) => r.json())
            .then((data) => {
                const sorted = [...data].sort((a, b) => a.stop_number - b.stop_number);
                setAssignments(sorted);
                setSelectedAssignmentId('');
            });
    }, [selectedLineId]);

    const fetchDepartures = useCallback(async () => {
        if (!selectedAssignmentId) { setDepartures([]); return; }
        setLoading(true);
        const res = await fetch(`${DEPARTURES_API}/${selectedAssignmentId}`);
        const data = await res.json();
        const filtered = data.filter((d) => d.day_type === dayType);
        filtered.sort((a, b) => a.departure.localeCompare(b.departure));
        setDepartures(filtered);
        setLoading(false);
    }, [selectedAssignmentId, dayType]);

    useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

    const handleAdd = async () => {
        if (!newTime || !selectedAssignmentId) return;
        const res = await authFetch(DEPARTURES_API, {
            method: 'POST',
            body: JSON.stringify({ lines_locations_id: parseInt(selectedAssignmentId), departure: newTime, day_type: dayType }),
        });
        if (res.ok) {
            addToast('Polazak dodat.', 'success');
            setNewTime('');
            fetchDepartures();
        } else {
            addToast('Greška pri dodavanju.', 'error');
        }
    };

    const handleBulkImport = async () => {
        if (!bulkText.trim() || !selectedAssignmentId) return;
        const departures = bulkText
            .split(/[\n,\s]+/)
            .map((t) => t.trim())
            .filter((t) => /^\d{1,2}:\d{2}$/.test(t));
        if (departures.length === 0) { addToast('Nisu pronađeni ispravni polasci.', 'error'); return; }
        const res = await authFetch(`${DEPARTURES_API}/bulk`, {
            method: 'POST',
            body: JSON.stringify({ lines_locations_id: parseInt(selectedAssignmentId), departures, day_type: dayType }),
        });
        if (res.ok) {
            addToast(`Uvezeno ${departures.length} polazaka.`, 'success');
            setBulkText('');
            fetchDepartures();
        } else {
            addToast('Greška pri uvozu.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati ovaj polazak?')) return;
        const res = await authFetch(`${DEPARTURES_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('Polazak obrisan.', 'success');
            fetchDepartures();
        } else {
            addToast('Greška pri brisanju.', 'error');
        }
    };

    const handleDeleteAll = async () => {
        if (!selectedAssignmentId) return;
        if (!window.confirm(`Obrisati SVE polaske za ovu stanicu (${DAY_TYPES.find((d) => d.value === dayType)?.label})?`)) return;
        const res = await authFetch(`${DEPARTURES_API}/by-lines-location/${selectedAssignmentId}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('Svi polasci obrisani.', 'success');
            fetchDepartures();
        } else {
            addToast('Greška pri brisanju.', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>Linija</label>
                    <select className={inputCls} value={selectedLineId} onChange={(e) => setSelectedLineId(e.target.value)}>
                        <option value="">— izaberi liniju —</option>
                        {lines.map((l) => (
                            <option key={l.id} value={l.id}>{l.number} — {l.lat_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Stanica</label>
                    <select className={inputCls} value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)} disabled={!selectedLineId}>
                        <option value="">— izaberi stanicu —</option>
                        {assignments.map((a) => (
                            <option key={a.id} value={a.id}>{a.stop_number}. {a.locations?.lat_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedAssignmentId && (
                <>
                    <div className="flex gap-2">
                        {DAY_TYPES.map((dt) => (
                            <button
                                key={dt.value}
                                className={`${btnBase} border ${dayType === dt.value ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white/60'}`}
                                onClick={() => setDayType(dt.value)}
                            >
                                {dt.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p className="text-sm text-white/40">Učitavanje...</p>
                    ) : (
                        <div className={`${glassCard} overflow-x-auto`}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-white/40 text-xs">
                                        <th className="text-left px-4 py-3">Vreme</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departures.map((d) => (
                                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 text-white/90 font-mono">{d.departure}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button className={btnDanger} onClick={() => handleDelete(d.id)}>Obriši</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {departures.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-6 text-center text-white/30 text-xs">Nema polazaka za ovaj dan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={`${glassCard} p-4 flex gap-3 items-end`}>
                        <div>
                            <label className={labelCls}>Dodaj polazak</label>
                            <input
                                type="time"
                                className={inputCls}
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                        </div>
                        <button className={btnSuccess} onClick={handleAdd}>Dodaj</button>
                    </div>

                    <div className={`${glassCard} p-4 flex flex-col gap-3`}>
                        <label className={labelCls}>Bulk uvoz (jedno vreme po liniji ili razmakom/zarezom)</label>
                        <textarea
                            className={`${inputCls} h-28 resize-none`}
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder={'06:00\n06:30\n07:00'}
                        />
                        <div className="flex gap-2">
                            <button className={btnSuccess} onClick={handleBulkImport}>Uvezi</button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className={btnDanger} onClick={handleDeleteAll}>
                            Obriši sve polaske za {DAY_TYPES.find((d) => d.value === dayType)?.label}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Root Admin component ───────────────────────────────────────────────────────

const AdminInner = () => {
    const logout = useStore((s) => s.logout);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/prijava', { replace: true });
    };

    const tabContent = useMemo(() => {
        switch (activeTab) {
            case 0: return <LinesTab />;
            case 1: return <StopsTab />;
            case 2: return <AssignmentsTab />;
            case 3: return <DeparturesTab />;
            default: return null;
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 md:p-6">
            <ToastContainer />
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Admin panel</h1>
                        <p className="text-sm text-white/50 mt-1">ZR-Bus administracija</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/admin/survey')}
                            className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all duration-200"
                        >
                            Terensko snimanje
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all duration-200"
                        >
                            Odjava
                        </button>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-white/10 pb-0">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                                activeTab === i
                                    ? 'bg-white/10 text-white border border-white/10 border-b-0'
                                    : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>{tabContent}</div>
            </div>
        </div>
    );
};

const Admin = () => (
    <ToastProvider>
        <AdminInner />
    </ToastProvider>
);

export default Admin;
