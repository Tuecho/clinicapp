import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, ExternalLink, Package, Tv, Sofa, Laptop, Camera, Search, X, Settings } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Appliance {
  id: string;
  name: string;
  category_id: number;
  category: string;
  category_icon: string;
  category_color: string;
  purchase_date?: string;
  warranty_end_date?: string;
  manual_url?: string;
  notes?: string;
  image_url?: string;
}

export function HomeInventory() {
  const [items, setItems] = useState<Appliance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Appliance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    purchase_date: '',
    warranty_end_date: '',
    manual_url: '',
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'package',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/home/categories`, { headers });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/home/appliances`, { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingItem ? `${API_URL}/api/home/appliances/${editingItem.id}` : `${API_URL}/api/home/appliances`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingItem?.id || crypto.randomUUID(),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        fetchItems();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/home/appliances/${id}`, { method: 'DELETE', headers });
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingCategory 
        ? `${API_URL}/api/home/categories/${editingCategory.id}` 
        : `${API_URL}/api/home/categories`;
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(categoryForm) });
      if (res.ok) {
        fetchCategories();
        resetCategoryForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Los artículos asociados se quedarán sin categoría.')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/home/categories/${id}`, { method: 'DELETE', headers });
      fetchCategories();
      fetchItems();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: '',
      purchase_date: '',
      warranty_end_date: '',
      manual_url: '',
      notes: '',
    });
  };

  const resetCategoryForm = () => {
    setShowCategoryManager(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', icon: 'package', color: '#3b82f6' });
  };

  const isWarrantyExpiring = (endDate?: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const isWarrantyExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const getCategoryIcon = (icon?: string) => {
    switch (icon) {
      case 'tv': return <Tv size={18} />;
      case 'sofa': return <Sofa size={18} />;
      case 'laptop': return <Laptop size={18} />;
      case 'camera': return <Camera size={18} />;
      default: return <Package size={18} />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || String(item.category_id) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const expiringWarranties = items.filter(i => isWarrantyExpiring(i.warranty_end_date));
  const expiredWarranties = items.filter(i => isWarrantyExpired(i.warranty_end_date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario del Hogar</h1>
          <p className="text-gray-500 text-sm">Electrodomésticos, muebles y electrónica</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Settings size={18} />
            Categorías
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Nuevo artículo
          </button>
        </div>
      </div>

      {expiringWarranties.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-800">{expiringWarranties.length} garantía(s) por vencer</p>
            <p className="text-sm text-amber-700">{expiringWarranties.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      {expiredWarranties.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-red-800">{expiredWarranties.length} garantía(s) vencida(s)</p>
            <p className="text-sm text-red-700">{expiredWarranties.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar artículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay artículos</p>
          <p className="text-sm text-gray-400">Añade tu primer electrodoméstico o mueble</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: item.category_color ? `${item.category_color}20` : '#f3f4f6',
                      color: item.category_color || '#6b7280'
                    }}
                  >
                    {getCategoryIcon(item.category_icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category || 'Sin categoría'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingItem(item); setFormData({
                      name: item.name,
                      category_id: item.category_id ? String(item.category_id) : '',
                      purchase_date: item.purchase_date || '',
                      warranty_end_date: item.warranty_end_date || '',
                      manual_url: item.manual_url || '',
                      notes: item.notes || '',
                    }); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {item.purchase_date && (
                <p className="text-sm text-gray-500 mb-1">
                  Comprado: {new Date(item.purchase_date).toLocaleDateString('es-ES')}
                </p>
              )}

              {item.warranty_end_date && (
                <div className={`text-sm font-medium ${
                  isWarrantyExpired(item.warranty_end_date) ? 'text-red-600' :
                  isWarrantyExpiring(item.warranty_end_date) ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {isWarrantyExpired(item.warranty_end_date) ? '⚠️ Garantía vencida' :
                   isWarrantyExpiring(item.warranty_end_date) ? '⚠️ Garantía por vencer' :
                   `Garantía hasta ${new Date(item.warranty_end_date).toLocaleDateString('es-ES')}`}
                </div>
              )}

              {item.manual_url && (
                <a
                  href={item.manual_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink size={14} />
                  Ver manual
                </a>
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
                {editingItem ? 'Editar artículo' : 'Nuevo artículo'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Lavadora, Sofá, TV..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de compra</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin garantía</label>
                  <input
                    type="date"
                    value={formData.warranty_end_date}
                    onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del manual</label>
                  <input
                    type="url"
                    value={formData.manual_url}
                    onChange={(e) => setFormData({ ...formData, manual_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingItem ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Gestionar Categorías</h2>
                <button onClick={resetCategoryForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              {!editingCategory ? (
                <>
                  <div className="space-y-2 mb-6">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <span className="font-medium text-gray-800">{cat.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, icon: cat.icon, color: cat.color }); }}
                            className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-200"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No hay categorías</p>
                    )}
                  </div>
                  
                  <form onSubmit={handleCategorySubmit} className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800">Nueva Categoría</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Electrodomésticos..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Crear Categoría
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <h3 className="font-medium text-gray-800">Editar Categoría</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
