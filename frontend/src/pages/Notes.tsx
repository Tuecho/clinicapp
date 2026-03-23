import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, X, Check, Search, Share2, FolderOpen, Settings, Copy, MessageCircle, Send, CheckCircle, LayoutGrid, CheckSquare, Square } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Note {
  id: number;
  owner_id: number;
  title: string;
  content: string;
  category: string;
  board_id: number | null;
  created_at: string;
  updated_at: string;
}

interface NoteBoard {
  id: number;
  owner_id: number;
  name: string;
  color: string;
  notes: Note[];
}

const DEFAULT_CATEGORIES = ['general', 'trabajo', 'familia', 'personal', 'importante'];
const BOARD_COLORS = ['#eab308', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function Notes() {
  const [boards, setBoards] = useState<NoteBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<NoteBoard | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  
  const [boardForm, setBoardForm] = useState({ name: '', color: '#eab308' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: 'general' });
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories.filter(c => !DEFAULT_CATEGORIES.includes(c))];

  useEffect(() => {
    fetchBoards();
    loadCustomCategories();
  }, []);

  const fetchBoards = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/note-boards`, { headers });
      const data = await response.json();
      setBoards(data);
      if (data.length > 0 && activeBoardId === null) {
        setActiveBoardId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
    setLoading(false);
  };

  const loadCustomCategories = () => {
    const saved = localStorage.getItem('note_categories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  };

  const saveCustomCategories = (cats: string[]) => {
    localStorage.setItem('note_categories', JSON.stringify(cats));
    setCustomCategories(cats);
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardForm.name.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/note-boards`, {
        method: 'POST',
        headers,
        body: JSON.stringify(boardForm)
      });
      const data = await response.json();
      if (data.success) {
        setBoards(prev => [...prev, data.board]);
        setActiveBoardId(data.board.id);
      }
      setBoardForm({ name: '', color: '#eab308' });
      setShowBoardModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !boardForm.name.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/note-boards/${editingBoard.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(boardForm)
      });
      setBoards(prev => prev.map(b => 
        b.id === editingBoard.id ? { ...b, ...boardForm } : b
      ));
      setEditingBoard(null);
      setBoardForm({ name: '', color: '#eab308' });
      setShowBoardModal(false);
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleDeleteBoard = async (id: number) => {
    if (!window.confirm('¿Eliminar este tablero? Las notas se moverán a "Sin tablero".')) return;

    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/note-boards/${id}`, { method: 'DELETE', headers });
      const newBoards = boards.filter(b => b.id !== id);
      setBoards(newBoards);
      if (activeBoardId === id) {
        setActiveBoardId(newBoards.length > 0 ? newBoards[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const openEditBoard = (board: NoteBoard) => {
    setEditingBoard(board);
    setBoardForm({ name: board.name, color: board.color });
    setShowBoardModal(true);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...noteForm, board_id: activeBoardId })
      });
      setNoteForm({ title: '', content: '', category: 'general' });
      setShowNoteModal(false);
      fetchBoards();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !noteForm.title.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...noteForm, board_id: activeBoardId })
      });
      setEditingNote(null);
      setNoteForm({ title: '', content: '', category: 'general' });
      setShowNoteModal(false);
      fetchBoards();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content, category: note.category });
    setShowNoteModal(true);
  };

  const deleteNote = async (id: number) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/notes/${id}`, { method: 'DELETE', headers });
      fetchBoards();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const moveNoteToBoard = async (note: Note, targetBoardId: number) => {
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/notes/${note.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          category: note.category,
          board_id: targetBoardId === 0 ? null : targetBoardId
        })
      });
      fetchBoards();
    } catch (error) {
      console.error('Error moving note:', error);
    }
  };

  const generateNoteShareText = (note: Note) => {
    return `📝 *${note.title}*\n\n${note.content}\n\n— Enviado desde Family Agent`;
  };

  const shareNoteToWhatsApp = (note: Note) => {
    const text = encodeURIComponent(generateNoteShareText(note));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareNoteToTelegram = (note: Note) => {
    const text = encodeURIComponent(generateNoteShareText(note));
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  const copyNoteToClipboard = async (note: Note) => {
    const text = generateNoteShareText(note).replace(/[*_]/g, '');
    await navigator.clipboard.writeText(text);
    alert('¡Nota copiada al portapapeles!');
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const cat = newCategory.toLowerCase().trim().replace(/\s+/g, '-');
    if (categories.includes(cat)) {
      alert('Esta categoría ya existe');
      return;
    }
    saveCustomCategories([...customCategories, cat]);
    setNewCategory('');
  };

  const updateCategory = () => {
    if (!editingCategory) return;
    const oldCat = editingCategory.old;
    const newCat = editingCategory.new.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (categories.includes(newCat) && newCat !== oldCat) {
      alert('Esta categoría ya existe');
      return;
    }
    
    const updated = customCategories.map(c => c === oldCat ? newCat : c);
    saveCustomCategories(updated);
    setEditingCategory(null);
  };

  const deleteCategory = (cat: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat}"?`)) return;
    const updated = customCategories.filter(c => c !== cat);
    saveCustomCategories(updated);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trabajo': return 'bg-blue-100 text-blue-700';
      case 'familia': return 'bg-purple-100 text-purple-700';
      case 'personal': return 'bg-green-100 text-green-700';
      case 'importante': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      trabajo: 'Trabajo',
      familia: 'Familia',
      personal: 'Personal',
      importante: 'Importante'
    };
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotes = activeBoard?.notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 sm:p-3 rounded-xl">
            <StickyNote size={24} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Notas</h2>
            <p className="text-sm text-gray-500">{boards.length} tableros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Gestionar categorías"
          >
            <FolderOpen size={18} />
          </button>
          <button
            onClick={() => setViewMode(v => v === 'board' ? 'grid' : 'board')}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title={viewMode === 'board' ? 'Vista cuadrícula' : 'Vista tablero'}
          >
            {viewMode === 'board' ? <LayoutGrid size={18} /> : <CheckSquare size={18} />}
          </button>
          <button
            onClick={() => {
              setEditingBoard(null);
              setBoardForm({ name: '', color: '#eab308' });
              setShowBoardModal(true);
            }}
            className="flex items-center gap-2 bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo tablero</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {boards.map(board => (
          <div
            key={board.id}
            className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-sm transition-all group ${
              activeBoardId === board.id
                ? 'text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
            style={activeBoardId === board.id ? { backgroundColor: board.color } : {}}
          >
            <button
              onClick={() => setActiveBoardId(board.id)}
              className="flex items-center gap-1"
            >
              {board.name}
              <span className={`text-xs ${activeBoardId === board.id ? 'opacity-80' : 'text-gray-400'}`}>
                ({board.notes.length})
              </span>
            </button>
            {board.id !== 0 && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditBoard(board); }}
                  className={`p-1 rounded hover:bg-black/10 ${activeBoardId === board.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity`}
                  title="Editar tablero"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}
                  className={`p-1 rounded hover:bg-black/10 ${activeBoardId === board.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'} opacity-0 group-hover:opacity-100 transition-opacity`}
                  title="Eliminar tablero"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : !activeBoard ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg text-gray-600 font-medium">Crea tu primer tablero</p>
          <p className="text-sm text-gray-400 mt-1">Organiza tus notas en diferentes tableros</p>
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setEditingNote(null);
              setNoteForm({ title: '', content: '', category: 'general' });
              setShowNoteModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-all mb-4"
          >
            <Plus size={20} />
            Nueva nota
          </button>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No hay notas en este tablero</p>
            </div>
          ) : viewMode === 'board' ? (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(note.category)}`}>
                      {getCategoryLabel(note.category)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => shareNoteToWhatsApp(note)}
                        className="p-1.5 text-gray-400 hover:text-green-500"
                        title="WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        onClick={() => shareNoteToTelegram(note)}
                        className="p-1.5 text-gray-400 hover:text-blue-500"
                        title="Telegram"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        onClick={() => copyNoteToClipboard(note)}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                        title="Copiar"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => openEditNote(note)}
                        className="p-1.5 text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2">{note.title}</h3>
                  
                  {note.content && (
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatDate(note.updated_at)}
                    </p>
                    {boards.length > 1 && (
                      <select
                        onChange={(e) => moveNoteToBoard(note, parseInt(e.target.value))}
                        className="text-xs border rounded px-2 py-1 text-gray-500"
                        title="Mover a otro tablero"
                      >
                        <option value="">Mover a...</option>
                        {boards.filter(b => b.id !== activeBoardId).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all group min-h-[120px]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(note.category)}`}>
                      {getCategoryLabel(note.category)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => shareNoteToWhatsApp(note)}
                        className="p-1 text-gray-400 hover:text-green-500"
                        title="WhatsApp"
                      >
                        <MessageCircle size={12} />
                      </button>
                      <button
                        onClick={() => shareNoteToTelegram(note)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Telegram"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        onClick={() => copyNoteToClipboard(note)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copiar"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => openEditNote(note)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{note.title}</h3>
                  
                  {note.content && (
                    <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showBoardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingBoard ? 'Editar tablero' : 'Nuevo tablero'}
              </h3>
              <button onClick={() => setShowBoardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingBoard ? handleUpdateBoard : handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del tablero *</label>
                <input
                  type="text"
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  placeholder="Ej: Ideas, Recetas, Viajes..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {BOARD_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBoardForm({ ...boardForm, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${boardForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    >
                      {boardForm.color === color && <Check size={16} className="text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="flex-1 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium shadow-sm"
                >
                  {editingBoard ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingNote ? 'Editar nota' : 'Nueva nota'}
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Título de la nota..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Escribe tu nota aquí..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none min-h-[150px]"
                  rows={5}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {editingNote ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FolderOpen size={20} className="text-yellow-500" />
                Gestionar Categorías
              </h3>
              <button onClick={() => setShowCategoriesModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva categoría</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nombre de la categoría..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Categorías por defecto</h4>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <span
                      key={cat}
                      className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(cat)}`}
                    >
                      {getCategoryLabel(cat)}
                    </span>
                  ))}
                </div>
              </div>

              {customCategories.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Categorías personalizadas</h4>
                  <div className="space-y-2">
                    {customCategories.map(cat => (
                      <div key={cat} className="flex items-center gap-2">
                        {editingCategory?.old === cat ? (
                          <>
                            <input
                              type="text"
                              value={editingCategory.new}
                              onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                              className="flex-1 px-3 py-1 border rounded-lg text-sm"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && updateCategory()}
                            />
                            <button onClick={updateCategory} className="p-1 text-green-500 hover:text-green-600">
                              <Check size={18} />
                            </button>
                            <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400 hover:text-gray-600">
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`flex-1 px-3 py-1 rounded-lg text-sm ${getCategoryColor(cat)}`}>
                              {getCategoryLabel(cat)}
                            </span>
                            <button
                              onClick={() => setEditingCategory({ old: cat, new: cat })}
                              className="p-1 text-gray-400 hover:text-blue-500"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteCategory(cat)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCategoriesModal(false)}
              className="w-full mt-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
