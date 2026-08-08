import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pin, Palette, Tag, FolderPlus, X } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import { getNoteCardStyle } from '../utils/themeUtils';

function CreateArea({ onAdd }) {
    const { categories, addCategory } = useNotes();
    const { darkMode } = useTheme();
    const [isExpanded, setExpanded] = useState(false);
    const formRef = useRef(null);
    const [note, setNote] = useState({
        title: '',
        content: '',
        color: '#ffffff',
        is_pinned: false,
        category_id: '',
        labelsStr: '',
    });
    const [showColors, setShowColors] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCatInput, setShowNewCatInput] = useState(false);

    const colors = [
        '#ffffff',
        '#fff3cd', // Yellow
        '#d4edda', // Green
        '#d1ecf1', // Blue
        '#f8d7da', // Pink
        '#e2d9f3', // Purple
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (formRef.current && !formRef.current.contains(event.target)) {
                if (isExpanded) {
                    if (note.title.trim() || note.content.trim()) {
                        saveNote();
                    } else {
                        closeForm();
                    }
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, note]);

    function handleChange(event) {
        const { name, value } = event.target;
        setNote((prevNote) => ({
            ...prevNote,
            [name]: value,
        }));
    }

    function expand() {
        setExpanded(true);
    }

    function closeForm() {
        setNote({
            title: '',
            content: '',
            color: '#ffffff',
            is_pinned: false,
            category_id: '',
            labelsStr: '',
        });
        setExpanded(false);
        setShowColors(false);
        setShowNewCatInput(false);
    }

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        const created = await addCategory(newCategoryName.trim());
        if (created) {
            setNote((prev) => ({ ...prev, category_id: created.id }));
            setNewCategoryName('');
            setShowNewCatInput(false);
        }
    }

    function saveNote() {
        if (!note.title.trim() && !note.content.trim()) {
            closeForm();
            return;
        }

        const labels = note.labelsStr
            ? note.labelsStr.split(',').map((l) => l.trim()).filter((l) => l.length > 0)
            : [];

        onAdd({
            title: note.title,
            content: note.content,
            color: note.color,
            is_pinned: note.is_pinned,
            category_id: note.category_id ? parseInt(note.category_id, 10) : null,
            labels,
        });

        closeForm();
    }

    function submitNote(event) {
        event.preventDefault();
        saveNote();
    }

    return (
        <div>
            <form ref={formRef} className="create-note" style={getNoteCardStyle(note.color, darkMode)}>
                {isExpanded && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <input
                            name="title"
                            onChange={handleChange}
                            value={note.title}
                            placeholder="Title"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={() => setNote((prev) => ({ ...prev, is_pinned: !prev.is_pinned }))}
                                title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
                            >
                                <Pin size={20} color={note.is_pinned ? '#f5ba13' : 'currentColor'} />
                            </button>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={closeForm}
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <textarea
                    name="content"
                    onClick={expand}
                    onChange={handleChange}
                    value={note.content}
                    placeholder="Take a note..."
                    rows={isExpanded ? 3 : 1}
                />

                {isExpanded && (
                    <>
                        <div className="create-note-actions">
                            <div className="action-buttons-left">
                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={() => setShowColors(!showColors)}
                                    title="Choose Color"
                                >
                                    <Palette size={18} />
                                </button>

                                <select
                                    name="category_id"
                                    className="select-dropdown"
                                    value={note.category_id}
                                    onChange={handleChange}
                                >
                                    <option value="">No Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                                    title="Add Category"
                                >
                                    <FolderPlus size={18} />
                                </button>
                            </div>
                        </div>

                        {showNewCatInput && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="New Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    style={{ fontSize: '0.85rem', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                />
                                <button type="button" className="chip active" onClick={handleAddCategory}>
                                    Save
                                </button>
                            </div>
                        )}

                        {showColors && (
                            <div className="color-picker">
                                {colors.map((c) => (
                                    <div
                                        key={c}
                                        className={`color-dot ${note.color === c ? 'selected' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setNote((prev) => ({ ...prev, color: c }))}
                                    />
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={14} color="var(--text-muted)" />
                            <input
                                name="labelsStr"
                                onChange={handleChange}
                                value={note.labelsStr}
                                placeholder="Tags (comma separated: work, personal)"
                                style={{ fontSize: '0.82rem' }}
                            />
                        </div>

                        <button className="add-btn" onClick={submitNote} title="Add Note">
                            <Plus size={24} />
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

export default CreateArea;
