import React, { useState } from 'react';
import { X, Bell, Volume2 } from 'lucide-react';
import { playNotificationTone } from '../utils/audio';

function ReminderModal({ note, onClose, onSave }) {
    const [datetime, setDatetime] = useState(
        note?.reminder_datetime ? new Date(note.reminder_datetime).toISOString().slice(0, 16) : ''
    );
    const [sound, setSound] = useState(note?.notification_sound || 'chime');
    const [repeat, setRepeat] = useState(note?.repeat_type || 'none');

    const handleTestSound = (soundName) => {
        setSound(soundName);
        playNotificationTone(soundName);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!datetime) return;
        onSave({
            reminder_datetime: datetime,
            notification_sound: sound,
            repeat_type: repeat,
        });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Bell size={20} color="#f5ba13" /> Set Reminder</h2>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
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
                            {['chime', 'bell', 'digital', 'wave'].map((snd) => (
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

                    <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                        Save Reminder
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReminderModal;
