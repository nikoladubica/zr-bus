import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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

const winInput = 'win-input';
const winLabel = 'win-label';
const winBtn = 'win-btn';
const winBtnDanger = 'win-btn win-btn-danger';
const winBtnSuccess = 'win-btn win-btn-success';

// ─── Modal wrapper ──────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) =>
    createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="win-dialog flex flex-col w-full max-w-lg max-h-[90vh]">
                <div className="win-titlebar">
                    <span>{title}</span>
                    <button onClick={onClose} className="win-close-btn">✕</button>
                </div>
                <div className="overflow-y-auto p-4 flex flex-col gap-3">
                    {children}
                </div>
            </div>
        </div>,
        document.body
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
            <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>{lines.length} linija</span>
                <button className={winBtn} onClick={openCreate}>+ Dodaj liniju</button>
            </div>

            {loading ? (
                <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>Učitavanje...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="win-table">
                        <thead>
                            <tr>
                                <th>Br.</th>
                                <th>Latinični</th>
                                <th>Ćirilični</th>
                                <th>Boja</th>
                                <th>Smer</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l) => (
                                <tr key={l.id}>
                                    <td style={{ fontFamily: 'monospace' }}>{l.number}</td>
                                    <td>{l.lat_name}</td>
                                    <td>{l.cyr_name}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 14, height: 14, borderRadius: 2, border: '1px solid #808080', backgroundColor: l.hex_color, display: 'inline-block' }} />
                                            <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{l.hex_color}</span>
                                        </span>
                                    </td>
                                    <td>{l.direction ?? '—'}</td>
                                    <td>
                                        <span style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <button className={winBtn} onClick={() => openEdit(l)}>Izmeni</button>
                                            <button className={winBtnDanger} onClick={() => handleDelete(l.id)}>Obriši</button>
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div>
                            <label className={winLabel}>Broj linije</label>
                            <input className={winInput} value={form.number} onChange={setField('number')} placeholder="npr. 4" required />
                        </div>
                        <div>
                            <label className={winLabel}>Latinični naziv</label>
                            <input className={winInput} value={form.lat_name} onChange={setField('lat_name')} placeholder="Centar - Šangaj" required />
                        </div>
                        <div>
                            <label className={winLabel}>Ćirilični naziv</label>
                            <input className={winInput} value={form.cyr_name} onChange={setField('cyr_name')} placeholder="Центар - Шангај" required />
                        </div>
                        <div>
                            <label className={winLabel}>Boja</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="color" style={{ height: 24, width: 40, cursor: 'pointer', border: '1px solid #808080', padding: 1 }} value={form.hex_color} onChange={setField('hex_color')} />
                                <input className={winInput} style={{ flex: 1 }} value={form.hex_color} onChange={setField('hex_color')} placeholder="#ffffff" />
                            </div>
                        </div>
                        <div>
                            <label className={winLabel}>Smer (opciono)</label>
                            <select className={winInput} value={form.direction} onChange={setField('direction')}>
                                <option value="">Bez smera</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', paddingTop: 4 }}>
                            <button type="button" className={winBtn} onClick={() => setModalOpen(false)}>Otkaži</button>
                            <button type="submit" className={winBtnSuccess}>Sačuvaj</button>
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
    const [lines, setLines] = useState([]);
    const [filterLineId, setFilterLineId] = useState('');
    const [filteredLocationIds, setFilteredLocationIds] = useState(null);

    const fetchStops = useCallback(async () => {
        setLoading(true);
        const res = await fetch(LOCATIONS_API);
        const data = await res.json();
        setStops(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchStops(); }, [fetchStops]);

    useEffect(() => {
        fetch(LINES_API)
            .then(r => r.json())
            .then(setLines);
    }, []);

    useEffect(() => {
        if (!filterLineId) {
            setFilteredLocationIds(null);
            return;
        }
        fetch(`${LINES_LOCATIONS_API}/${filterLineId}`)
            .then(r => r.json())
            .then(data => {
                const ids = new Set(data.map(item => item.locations?.id));
                setFilteredLocationIds(ids);
            });
    }, [filterLineId]);

    const filteredStops = filteredLocationIds === null
        ? stops
        : stops.filter(s => filteredLocationIds.has(s.id));

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
            <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>
                    {filteredLocationIds !== null ? `${filteredStops.length} / ${stops.length} stanica` : `${stops.length} stanica`}
                </span>
                <button className={winBtn} onClick={openCreate}>+ Dodaj stanicu</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <label className={winLabel} style={{ marginBottom: 0 }}>Filtriraj po liniji:</label>
                <select
                    className="win-input"
                    style={{ width: 'auto' }}
                    value={filterLineId}
                    onChange={e => setFilterLineId(e.target.value)}
                >
                    <option value="">— Sve stanice —</option>
                    {lines.map(l => (
                        <option key={l.id} value={l.id}>{l.number} – {l.lat_name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>Učitavanje...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="win-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Latinični</th>
                                <th>Ćirilični</th>
                                <th>Lat</th>
                                <th>Lng</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStops.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.id}</td>
                                    <td>{s.lat_name}</td>
                                    <td>{s.cyr_name}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.lat ?? '—'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.lng ?? '—'}</td>
                                    <td>
                                        <span style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <button className={winBtn} onClick={() => openEdit(s)}>Izmeni</button>
                                            <button className={winBtnDanger} onClick={() => handleDelete(s.id)}>Obriši</button>
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div>
                            <label className={winLabel}>Latinični naziv</label>
                            <input className={winInput} value={form.lat_name} onChange={setField('lat_name')} placeholder="Trg slobode" required />
                        </div>
                        <div>
                            <label className={winLabel}>Ćirilični naziv</label>
                            <input className={winInput} value={form.cyr_name} onChange={setField('cyr_name')} placeholder="Трг слободе" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={winLabel}>Geografska širina</label>
                                <input className={winInput} value={form.lat} onChange={setField('lat')} placeholder="45.380324" />
                            </div>
                            <div>
                                <label className={winLabel}>Geografska dužina</label>
                                <input className={winInput} value={form.lng} onChange={setField('lng')} placeholder="20.390627" />
                            </div>
                        </div>
                        <div>
                            <label className={winLabel}>Klikni na mapi za koordinate</label>
                            <div style={{ height: 260, border: '2px solid #808080' }}>
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
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', paddingTop: 4 }}>
                            <button type="button" className={winBtn} onClick={() => setModalOpen(false)}>Otkaži</button>
                            <button type="submit" className={winBtnSuccess}>Sačuvaj</button>
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
        <div className="flex flex-col gap-3">
            <div>
                <label className={winLabel}>Odaberi liniju</label>
                <select className={winInput} value={selectedLineId} onChange={(e) => setSelectedLineId(e.target.value)}>
                    <option value="">— izaberi liniju —</option>
                    {lines.map((l) => (
                        <option key={l.id} value={l.id}>{l.number} — {l.lat_name}</option>
                    ))}
                </select>
            </div>

            {selectedLineId && (
                <>
                    {loadingAssignments ? (
                        <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>Učitavanje...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="win-table">
                                <thead>
                                    <tr>
                                        <th>Br.</th>
                                        <th>Stanica</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((a, i) => (
                                        <tr key={a.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: 10, width: 40 }}>{a.stop_number}</td>
                                            <td>{a.locations?.lat_name}</td>
                                            <td>
                                                <span style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                    <button className={winBtn} onClick={() => handleReorder(i, -1)} disabled={i === 0}>↑</button>
                                                    <button className={winBtn} onClick={() => handleReorder(i, 1)} disabled={i === assignments.length - 1}>↓</button>
                                                    <button className={winBtnDanger} onClick={() => handleRemove(a.id)}>Ukloni</button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="win-panel" style={{ padding: 6, display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className={winLabel}>Dodaj stanicu na liniju</label>
                            <select className={winInput} value={addStopId} onChange={(e) => setAddStopId(e.target.value)}>
                                <option value="">— izaberi stanicu —</option>
                                {allStops.filter((s) => !assignedIds.has(s.id)).map((s) => (
                                    <option key={s.id} value={s.id}>{s.lat_name}</option>
                                ))}
                            </select>
                        </div>
                        <button className={winBtnSuccess} onClick={handleAdd}>Dodaj</button>
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
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className={winLabel}>Linija</label>
                    <select className={winInput} value={selectedLineId} onChange={(e) => setSelectedLineId(e.target.value)}>
                        <option value="">— izaberi liniju —</option>
                        {lines.map((l) => (
                            <option key={l.id} value={l.id}>{l.number} — {l.lat_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={winLabel}>Stanica</label>
                    <select className={winInput} value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)} disabled={!selectedLineId}>
                        <option value="">— izaberi stanicu —</option>
                        {assignments.map((a) => (
                            <option key={a.id} value={a.id}>{a.stop_number}. {a.locations?.lat_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedAssignmentId && (
                <>
                    <div style={{ display: 'flex', gap: 2 }}>
                        {DAY_TYPES.map((dt) => (
                            <button
                                key={dt.value}
                                className={winBtn}
                                style={dayType === dt.value ? { fontWeight: 'bold', borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff' } : {}}
                                onClick={() => setDayType(dt.value)}
                            >
                                {dt.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ fontFamily: "Tahoma, 'MS Sans Serif', sans-serif", fontSize: 11 }}>Učitavanje...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="win-table">
                                <thead>
                                    <tr>
                                        <th>Vreme</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departures.map((d) => (
                                        <tr key={d.id}>
                                            <td style={{ fontFamily: 'monospace' }}>{d.departure}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className={winBtnDanger} onClick={() => handleDelete(d.id)}>Obriši</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {departures.length === 0 && (
                                        <tr>
                                            <td colSpan={2} style={{ textAlign: 'center', padding: '12px 6px', color: '#808080' }}>Nema polazaka za ovaj dan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="win-panel" style={{ padding: 6, display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                        <div>
                            <label className={winLabel}>Dodaj polazak</label>
                            <input
                                type="time"
                                className={winInput}
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                        </div>
                        <button className={winBtnSuccess} onClick={handleAdd}>Dodaj</button>
                    </div>

                    <div className="win-panel" style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label className={winLabel}>Bulk uvoz (jedno vreme po liniji ili razmakom/zarezom)</label>
                        <textarea
                            className={winInput}
                            style={{ height: 80, resize: 'none' }}
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder={'06:00\n06:30\n07:00'}
                        />
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button className={winBtnSuccess} onClick={handleBulkImport}>Uvezi</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className={winBtnDanger} onClick={handleDeleteAll}>
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
        <div style={{ minHeight: '100vh', width: '100vw', background: '#c0c0c0', fontFamily: "Tahoma, 'MS Sans Serif', sans-serif" }}>
            <ToastContainer />
            <div className="win-titlebar" style={{ padding: '4px 8px' }}>
                <span>ZR-Bus Admin</span>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => navigate('/admin/survey')} className="win-btn" style={{ fontSize: 11 }}>
                        Terensko snimanje
                    </button>
                    <button onClick={handleLogout} className="win-btn" style={{ fontSize: 11 }}>
                        Odjava
                    </button>
                </div>
            </div>
            <div style={{ padding: '8px' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div style={{ display: 'flex', borderBottom: '2px solid #808080', marginBottom: 0 }}>
                        {TABS.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(i)}
                                className={activeTab === i ? 'win-tab-active' : 'win-tab-inactive'}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="win-panel" style={{ padding: '8px', position: 'relative', zIndex: 0 }}>
                        {tabContent}
                    </div>
                </div>
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
