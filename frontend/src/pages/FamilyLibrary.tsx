import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, BookOpen, Smartphone, Star, CheckCircle, Search, User } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import type { Book } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function FamilyLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    format: 'fisico' as const,
    isbn: '',
    owned_by: '',
    status: 'disponible' as const,
    rating: '0',
    notes: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/education/library`, { headers });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingBook ? `${API_URL}/api/education/library/${editingBook.id}` : `${API_URL}/api/education/library`;
      const method = editingBook ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (res.ok) {
        fetchBooks();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este libro?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/education/library/${id}`, { method: 'DELETE', headers });
      setBooks(books.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      format: 'fisico',
      isbn: '',
      owned_by: '',
      status: 'disponible',
      rating: '0',
      notes: '',
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const availableBooks = books.filter(b => b.status === 'disponible');
  const readingBooks = books.filter(b => b.status === 'leyendo');
  const readBooks = books.filter(b => b.status === 'leido');

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'leyendo': return 'Leyendo';
      case 'leido': return 'Leído';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-700';
      case 'leyendo': return 'bg-blue-100 text-blue-700';
      case 'leido': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca Familiar</h1>
          <p className="text-gray-500 text-sm">Libros físicos y ebooks</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Nuevo libro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <BookOpen size={18} />
            <span className="text-sm">Total libros</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{books.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <CheckCircle size={18} />
            <span className="text-sm">Disponibles</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{availableBooks.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <User size={18} />
            <span className="text-sm">Leyendo ahora</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{readingBooks.length}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar libro o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todos</option>
          <option value="disponible">Disponibles</option>
          <option value="leyendo">Leyendo</option>
          <option value="leido">Leídos</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay libros</p>
          <p className="text-sm text-gray-400">Añade tu primer libro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    book.format === 'fisico' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {book.format === 'fisico' ? <BookOpen size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 line-clamp-2">{book.title}</h3>
                    {book.author && (
                      <p className="text-sm text-gray-500">{book.author}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingBook(book);
                      setFormData({
                        title: book.title,
                        author: book.author || '',
                        format: book.format,
                        isbn: book.isbn || '',
                        owned_by: book.owned_by || '',
                        status: book.status,
                        rating: book.rating?.toString() || '0',
                        notes: book.notes || '',
                      });
                      setShowForm(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(book.status)}`}>
                  {getStatusLabel(book.status)}
                </span>
                {book.owned_by && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User size={12} />
                    {book.owned_by}
                  </span>
                )}
              </div>

              {book.rating ? (
                <div className="mb-2">{renderStars(book.rating)}</div>
              ) : null}

              {book.notes && (
                <p className="text-sm text-gray-500 line-clamp-2">{book.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingBook ? 'Editar libro' : 'Nuevo libro'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="El Quijote..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Miguel de Cervantes..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="fisico">Físico</option>
                      <option value="ebook">Ebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="leyendo">Leyendo</option>
                      <option value="leido">Leído</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                  <input
                    type="text"
                    value={formData.owned_by}
                    onChange={(e) => setFormData({ ...formData, owned_by: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Papá, Mamá..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valoración</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star.toString() })}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={star <= parseInt(formData.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    {editingBook ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
