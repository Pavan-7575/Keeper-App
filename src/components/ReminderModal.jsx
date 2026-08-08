import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Bell, Volume2, Trash2 } from 'lucide-react';
import { playNotificationTone } from '../utils/audio';

function ReminderModal({ note, onClose, onSave, onRemove }) {
    const [datetime, setDatetime] = useState(
        note?.reminder_datetime ? new Date(note.reminder_datetime).toISOString().slice(0, 16) : ''
    );
    const [sound, setSound] = useState(note?.notification_sound || 'chime');
    const [repeat, setRepeat] = useState(note?.repeat_type || 'none');
    const hasReminder = Boolean(note?.reminder_datetime);

    const handleTestSound = (soundName) => {
        setSound(soundName);
        playNotificationTone(soundName);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!datetime) return;

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        onSave({
            reminder_datetime: datetime,
            notification_sound: sound,
            repeat_type: repeat,
        });
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Bell size={20} color="#f5ba13" /> {hasReminder ? 'Edit Reminder' : 'Set Reminder'}</h2>
                    <button type="button" className="icon-btn" onClick={onClose} title="Close"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={datetime}
                            onChange={(e) => setDatetime(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Notification Sound</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['chime', 'bell', 'digital', 'alarm', 'wave'].map((snd) => (
                                <button
                                    key={snd}
                                    type="button"
                                    className={`chip ${sound === snd ? 'active' : ''}`}
                                    onClick={() => handleTestSound(snd)}
                                >
                                    <Volume2 size={14} /> {snd.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Repeat Cycle</label>
                        <select
                            className="select-dropdown"
                            style={{ width: '100%' }}
                            value={repeat}
                            onChange={(e) => setRepeat(e.target.value)}
                        >
                            <option value="none">Does not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                        {hasReminder && onRemove ? (
                            <button
                                type="button"
                                className="chip"
                                onClick={() => {
                                    onRemove();
                                    onClose();
                                }}
                                style={{
                                    color: '#e74c3c',
                                    background: 'rgba(231, 76, 60, 0.1)',
                                    border: '1px solid rgba(231, 76, 60, 0.3)',
                                    padding: '8px 14px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Trash2 size={14} color="#e74c3c" /> Remove Reminder
                            </button>
                        ) : <div />}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="chip" onClick={onClose} style={{ padding: '8px 16px', fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" style={{ margin: 0, width: 'auto', padding: '10px 24px' }}>
                                Save Reminder
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ReminderModal;
