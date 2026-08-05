import React from 'react';
import { useNotes } from '../context/NotesContext';
import { FileText, CheckCircle2, Clock, Pin, Archive, Star, Trash2 } from 'lucide-react';

function DashboardStats() {
    const { stats, filter, setFilter } = useNotes();

    const cards = [
        { key: 'all', label: 'Total Notes', count: stats.total_notes || 0, icon: <FileText size={18} /> },
        { key: 'completed', label: 'Completed', count: stats.completed_count || 0, icon: <CheckCircle2 size={18} /> },
        { key: 'pending', label: 'Pending', count: stats.pending_count || 0, icon: <Clock size={18} /> },
        { key: 'pinned', label: 'Pinned', count: stats.pinned_count || 0, icon: <Pin size={18} /> },
        { key: 'favorites', label: 'Favorites', count: stats.favorites_count || 0, icon: <Star size={18} /> },
        { key: 'archived', label: 'Archived', count: stats.archived_count || 0, icon: <Archive size={18} /> },
        { key: 'deleted', label: 'Trash', count: stats.deleted_count || 0, icon: <Trash2 size={18} /> },
    ];

    return (
        <div className="stats-grid">
            {cards.map((c) => (
                <div
                    key={c.key}
                    className={`stat-card ${filter === c.key ? 'active' : ''}`}
                    onClick={() => setFilter(c.key)}
                >
                    <div className="stat-number">{c.count}</div>
                    <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {c.icon} {c.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DashboardStats;
