import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, AlertCircle, Calendar, Download } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface OccupancyData {
  professional_id: string;
  professional_name: string;
  cabin_id: string;
  cabin_name: string;
  total_appointments: number;
  completed_appointments: number;
  occupancy_rate: number;
}

interface RevenueData {
  period: string;
  service_name: string;
  revenue: number;
  quantity: number;
  average_price: number;
}

interface CancellationData {
  total_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  cancellation_rate: number;
  no_show_rate: number;
}

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<'occupancy' | 'revenue' | 'cancellations'>('occupancy');
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [cancellationData, setCancellationData] = useState<CancellationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setDateRange({
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    });
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchAnalyticsData();
    }
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
      });

      // Fetch occupancy data
      const occupancyRes = await fetch(
        `${API_URL}/api/reports/occupancy?${params}`,
        { headers }
      );
      if (occupancyRes.ok) {
        const data = await occupancyRes.json();
        setOccupancyData(Array.isArray(data) ? data : []);
      }

      // Fetch revenue data
      const revenueRes = await fetch(
        `${API_URL}/api/reports/revenue?${params}`,
        { headers }
      );
      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenueData(Array.isArray(data) ? data : []);
      }

      // Fetch cancellation data
      const cancellationRes = await fetch(
        `${API_URL}/api/reports/cancellations?${params}`,
        { headers }
      );
      if (cancellationRes.ok) {
        const data = await cancellationRes.json();
        setCancellationData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (type: 'occupancy' | 'revenue' | 'cancellations') => {
    let data: any[] = [];
    let filename = '';

    if (type === 'occupancy') {
      data = occupancyData;
      filename = 'occupancy_report.csv';
    } else if (type === 'revenue') {
      data = revenueData;
      filename = 'revenue_report.csv';
    } else if (type === 'cancellations' && cancellationData) {
      data = [cancellationData];
      filename = 'cancellations_report.csv';
    }

    if (data.length === 0) return;

    // Generate CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && occupancyData.length === 0 && revenueData.length === 0 && !cancellationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Informes y Analytics</h1>
          <p className="text-slate-400">Ocupación, ingresos y estadísticas de cancelación</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Date Range Selector */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={18} />
              <span>Período:</span>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => fetchAnalyticsData()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('occupancy')}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
              activeTab === 'occupancy'
                ? 'text-blue-400 border-b-blue-500'
                : 'text-slate-400 hover:text-slate-300 border-b-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Ocupación por Profesional
            </div>
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
              activeTab === 'revenue'
                ? 'text-blue-400 border-b-blue-500'
                : 'text-slate-400 hover:text-slate-300 border-b-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              Ingresos por Período
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cancellations')}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
              activeTab === 'cancellations'
                ? 'text-blue-400 border-b-blue-500'
                : 'text-slate-400 hover:text-slate-300 border-b-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              Cancelaciones
            </div>
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Occupancy Tab */}
          {activeTab === 'occupancy' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Ocupación por Profesional / Cabina</h2>
                <button
                  onClick={() => handleDownloadReport('occupancy')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm font-medium transition"
                >
                  <Download size={16} />
                  Descargar CSV
                </button>
              </div>
              
              {occupancyData.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-8 text-center text-slate-400">
                  <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay datos de ocupación disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Profesional</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Cabina</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Citas Totales</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Citas Completadas</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Tasa Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {occupancyData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                          <td className="px-4 py-3 text-sm text-slate-300">{row.professional_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{row.cabin_name}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-300">{row.total_appointments}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-300">{row.completed_appointments}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-32 bg-slate-700/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                                  style={{ width: `${row.occupancy_rate}%` }}
                                />
                              </div>
                              <span className="text-slate-300 font-semibold text-right w-12">{row.occupancy_rate.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Ingresos por Período y Servicio</h2>
                <button
                  onClick={() => handleDownloadReport('revenue')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm font-medium transition"
                >
                  <Download size={16} />
                  Descargar CSV
                </button>
              </div>
              
              {revenueData.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-8 text-center text-slate-400">
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay datos de ingresos disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Período</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Servicio</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Cantidad</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Precio Promedio</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Ingreso Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                          <td className="px-4 py-3 text-sm text-slate-300">{row.period}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{row.service_name}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-300">{row.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-300">
                            ${row.average_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className="font-semibold text-green-400">
                              ${row.revenue.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Cancellations Tab */}
          {activeTab === 'cancellations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Tasa de Cancelaciones y No-Shows</h2>
                {cancellationData && (
                  <button
                    onClick={() => handleDownloadReport('cancellations')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm font-medium transition"
                  >
                    <Download size={16} />
                    Descargar CSV
                  </button>
                )}
              </div>
              
              {!cancellationData ? (
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-8 text-center text-slate-400">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay datos de cancelaciones disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Total Appointments Card */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                    <div className="text-slate-400 text-sm font-medium mb-2">Citas Totales</div>
                    <div className="text-3xl font-bold text-white mb-2">{cancellationData.total_appointments}</div>
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>

                  {/* Cancelled Appointments Card */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6">
                    <div className="text-slate-400 text-sm font-medium mb-2">Citas Canceladas</div>
                    <div className="text-3xl font-bold text-yellow-300 mb-2">{cancellationData.cancelled_appointments}</div>
                    <div className="text-sm text-yellow-200">
                      Tasa: {cancellationData.cancellation_rate.toFixed(1)}%
                    </div>
                    <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mt-2"></div>
                  </div>

                  {/* No-Show Appointments Card */}
                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-6">
                    <div className="text-slate-400 text-sm font-medium mb-2">No-Shows</div>
                    <div className="text-3xl font-bold text-red-300 mb-2">{cancellationData.no_show_appointments}</div>
                    <div className="text-sm text-red-200">
                      Tasa: {cancellationData.no_show_rate.toFixed(1)}%
                    </div>
                    <div className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-2"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
