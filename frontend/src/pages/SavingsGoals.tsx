import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, PiggyBank, Target, Calendar, TrendingUp, Award, Wallet, ChevronRight } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import type { SavingsPig, SavingsGoal } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const PIG_COLORS = [
  { name: 'Verde', value: '#10B981' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Amarillo', value: '#EAB308' },
];

const PIG_ICONS = ['🐷', '🎯', '✈️', '🏖️', '🚗', '🏠', '💻', '📱', '🎓', '💰', '🎁', '🎉'];

export function SavingsGoals() {
  const [pigs, setPigs] = useState<SavingsPig[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPig, setSelectedPig] = useState<string | null>(null);
  const [showPigForm, setShowPigForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingPig, setEditingPig] = useState<SavingsPig | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [pigFormData, setPigFormData] = useState({
    name: '',
    icon: '🐷',
    color: '#10B981',
    notes: '',
  });

  const [goalFormData, setGoalFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    icon: '🎯',
    notes: '',
  });

  useEffect(() => {
    fetchPigs();
    fetchGoals();
  }, []);

  useEffect(() => {
    if (selectedPig) {
      fetchGoals(selectedPig);
    } else {
      fetchGoals();
    }
  }, [selectedPig]);

  const fetchPigs = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/finance/savings-pigs`, { headers });
      const data = await res.json();
      setPigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pigs:', error);
    }
  };

  const fetchGoals = async (pigId?: string) => {
    try {
      const headers = getAuthHeaders();
      const url = pigId 
        ? `${API_URL}/api/finance/savings-goals?pig_id=${pigId}`
        : `${API_URL}/api/finance/savings-goals`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingPig ? `${API_URL}/api/finance/savings-pigs/${editingPig.id}` : `${API_URL}/api/finance/savings-pigs`;
      const method = editingPig ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(pigFormData) });
      if (res.ok) {
        fetchPigs();
        resetPigForm();
      }
    } catch (error) {
      console.error('Error saving pig:', error);
    }
  };

  const handlePigDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta hucha? Se borrarán todas las metas dentro.')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/finance/savings-pigs/${id}`, { method: 'DELETE', headers });
      setPigs(pigs.filter(p => p.id !== id));
      if (selectedPig === id) setSelectedPig(null);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting pig:', error);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingGoal ? `${API_URL}/api/finance/savings-goals/${editingGoal.id}` : `${API_URL}/api/finance/savings-goals`;
      const method = editingGoal ? 'PUT' : 'POST';
      
      const data = {
        ...goalFormData,
        pig_id: selectedPig,
        target_amount: parseFloat(goalFormData.target_amount),
        current_amount: parseFloat(goalFormData.current_amount) || 0,
      };
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      if (res.ok) {
        fetchGoals(selectedPig || undefined);
        fetchPigs();
        resetGoalForm();
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleGoalDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/finance/savings-goals/${id}`, { method: 'DELETE', headers });
      setGoals(goals.filter(g => g.id !== id));
      fetchPigs();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const addContribution = async (goal: SavingsGoal) => {
    const amount = prompt('¿Cuánto quieres añadir?');
    if (!amount || isNaN(parseFloat(amount))) return;
    
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/finance/savings-goals/${goal.id}/contribute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      fetchGoals(selectedPig || undefined);
      fetchPigs();
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const resetPigForm = () => {
    setShowPigForm(false);
    setEditingPig(null);
    setPigFormData({ name: '', icon: '🐷', color: '#10B981', notes: '' });
  };

  const resetGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setGoalFormData({ name: '', target_amount: '', current_amount: '', deadline: '', icon: '🎯', notes: '' });
  };

  const getProgress = (goal: SavingsGoal) => {
    if (!goal.target_amount) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSavedAll = pigs.reduce((sum, p) => sum + (p.total_saved || 0), 0);

  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount);
  const activeGoals = goals.filter(g => g.current_amount < g.target_amount);

  const selectedPigData = pigs.find(p => p.id === selectedPig);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hucha Digital</h1>
          <p className="text-gray-500 text-sm">Organiza tus ahorros por categorías</p>
        </div>
        <button
          onClick={() => setShowPigForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nueva hucha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <PiggyBank size={18} />
            <span className="text-sm">Total ahorrado</span>
          </div>
          <p className="text-3xl font-bold">{totalSavedAll.toFixed(2)}€</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Wallet size={18} />
            <span className="text-sm">Huchas creadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{pigs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Award size={18} />
            <span className="text-sm">Metas completadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedGoals.length}</p>
        </div>
      </div>

      {pigs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPig(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
              !selectedPig 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas las huchas
          </button>
          {pigs.map((pig) => (
            <button
              key={pig.id}
              onClick={() => setSelectedPig(pig.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                selectedPig === pig.id 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedPig === pig.id ? { backgroundColor: pig.color || '#10B981' } : {}}
            >
              <span>{pig.icon || '🐷'}</span>
              <span>{pig.name}</span>
              {(pig.total_saved || 0) > 0 && (
                <span className="text-xs opacity-80">({(pig.total_saved || 0).toFixed(0)}€)</span>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedPigData && (
        <div className="bg-white rounded-xl shadow-sm border p-4" style={{ borderLeftWidth: 4, borderLeftColor: selectedPigData.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedPigData.icon || '🐷'}</span>
              <div>
                <h3 className="font-bold text-gray-800">{selectedPigData.name}</h3>
                <p className="text-sm text-gray-500">
                  Ahorrado: {(selectedPigData.total_saved || 0).toFixed(2)}€
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPig(selectedPigData);
                  setPigFormData({
                    name: selectedPigData.name,
                    icon: selectedPigData.icon || '🐷',
                    color: selectedPigData.color || '#10B981',
                    notes: selectedPigData.notes || '',
                  });
                  setShowPigForm(true);
                }}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handlePigDelete(selectedPigData.id)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          {selectedPigData.notes && (
            <p className="mt-2 text-sm text-gray-500">{selectedPigData.notes}</p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedPigData ? `Metas de "${selectedPigData.name}"` : 'Todas las metas'}
        </h2>
        <button
          onClick={() => setShowGoalForm(true)}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-600/80 text-sm font-medium"
        >
          <Plus size={16} />
          Nueva meta
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay metas de ahorro</p>
          <p className="text-sm text-gray-400">Crea tu primera meta dentro de una hucha</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pig = pigs.find(p => p.id === goal.pig_id);
            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  goal.current_amount >= goal.target_amount
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon || '🎯'}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{goal.name}</h3>
                      {pig && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{pig.icon}</span>
                          {pig.name}
                        </p>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-gray-500">
                          Fecha objetivo: {new Date(goal.deadline).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setGoalFormData({
                          name: goal.name,
                          target_amount: goal.target_amount.toString(),
                          current_amount: goal.current_amount.toString(),
                          deadline: goal.deadline || '',
                          icon: goal.icon || '🎯',
                          notes: goal.notes || '',
                        });
                        setShowGoalForm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleGoalDelete(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {goal.current_amount.toFixed(2)}€
                    </span>
                    <span className="text-gray-500">de {goal.target_amount}€</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.current_amount >= goal.target_amount
                          ? 'bg-green-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${getProgress(goal)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getProgress(goal).toFixed(1)}% completado
                    {goal.target_amount - goal.current_amount > 0 && (
                      <span className="ml-1">
                        • Faltan {(goal.target_amount - goal.current_amount).toFixed(2)}€
                      </span>
                    )}
                  </p>
                </div>

                {goal.current_amount < goal.target_amount && (
                  <button
                    onClick={() => addContribution(goal)}
                    className="w-full py-2 bg-indigo-600/10 text-indigo-600 rounded-lg hover:bg-indigo-600/20 transition-colors text-sm font-medium"
                  >
                    + Añadir ahorro
                  </button>
                )}

                {goal.current_amount >= goal.target_amount && (
                  <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-medium">
                    <Award size={18} />
                    ¡Meta alcanzada!
                  </div>
                )}

                {goal.notes && (
                  <p className="mt-2 text-sm text-gray-500">{goal.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPigForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingPig ? 'Editar hucha' : 'Nueva hucha'}
              </h2>
              <form onSubmit={handlePigSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={pigFormData.name}
                    onChange={(e) => setPigFormData({ ...pigFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Viajes, Bicicleta, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                  <div className="flex flex-wrap gap-2">
                    {PIG_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setPigFormData({ ...pigFormData, icon })}
                        className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                          pigFormData.icon === icon 
                            ? 'bg-indigo-600/20 ring-2 ring-indigo-600' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex gap-2">
                    {PIG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setPigFormData({ ...pigFormData, color: color.value })}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          pigFormData.color === color.value 
                            ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={pigFormData.notes}
                    onChange={(e) => setPigFormData({ ...pigFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetPigForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-600/90"
                  >
                    {editingPig ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingGoal ? 'Editar meta' : 'Nueva meta de ahorro'}
              </h2>
              {selectedPigData && (
                <p className="text-sm text-gray-500 mb-4">
                  Creando meta en: <span className="font-medium">{selectedPigData.icon} {selectedPigData.name}</span>
                </p>
              )}
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={goalFormData.name}
                    onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Viaje a París"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={goalFormData.target_amount}
                      onChange={(e) => setGoalFormData({ ...goalFormData, target_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ahorrado (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={goalFormData.current_amount}
                      onChange={(e) => setGoalFormData({ ...goalFormData, current_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha objetivo</label>
                  <input
                    type="date"
                    value={goalFormData.deadline}
                    onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                  <select
                    value={goalFormData.icon}
                    onChange={(e) => setGoalFormData({ ...goalFormData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="🎯">🎯 Meta</option>
                    <option value="🏖️">🏖️ Playa</option>
                    <option value="✈️">✈️ Viaje</option>
                    <option value="🚗">🚗 Coche</option>
                    <option value="🏠">🏠 Casa</option>
                    <option value="🎓">🎓 Estudios</option>
                    <option value="💻">💻 Tecnología</option>
                    <option value="🎁">🎁 Regalo</option>
                    <option value="🚲">🚲 Bicicleta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={goalFormData.notes}
                    onChange={(e) => setGoalFormData({ ...goalFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetGoalForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-600/90"
                  >
                    {editingGoal ? 'Guardar' : 'Crear'}
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
