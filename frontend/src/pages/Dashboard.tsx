import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Loader2, ChevronLeft, ChevronRight, Target, Heart, Home, ListChecks, Calendar, AlertCircle, Eye, EyeOff, Briefcase, Building2, Award, Cake } from 'lucide-react';
import { useStore } from '../store';
import { useCompany } from '../i18n/CompanyContext';
import { formatMoneyEs, formatDateEsLower } from '../utils/format';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Profile {
  family_name: string;
  name: string;
}

function DonutChart({ 
  income, 
  expense, 
  balance,
  size = 200, 
  strokeWidth = 30 
}: { 
  income: number; 
  expense: number;
  balance: number;
  size?: number;
  strokeWidth?: number;
}) {
  const total = income + expense;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const incomePercent = total > 0 ? (income / total) * 100 : 50;
  const expensePercent = total > 0 ? (expense / total) * 100 : 50;
  
  const incomeOffset = circumference - (incomePercent / 100) * circumference;
  const expenseOffset = circumference - (expensePercent / 100) * circumference;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-sm text-gray-500 font-medium">Sin datos</span>
          </div>
        </div>
      </div>
    );
  }

  const isNegative = balance < 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={incomeOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={expenseOffset}
            strokeLinecap="round"
            transform={`rotate(${-90 + (incomePercent / 100) * 360} ${size / 2} ${size / 2})`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${isNegative ? 'text-expense' : 'text-income'}`}>
            {isNegative ? '-' : ''}{formatMoneyEs(Math.abs(balance))}
          </span>
          <span className="text-sm text-gray-500">Balance</span>
        </div>
      </div>
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-income"></div>
          <span className="text-sm text-gray-600">Ingresos {Math.round(incomePercent)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-expense"></div>
          <span className="text-sm text-gray-600">Gastos {Math.round(expensePercent)}%</span>
        </div>
      </div>
    </div>
  );
}

function BalanceBar({ balance, income, expense }: { balance: number; income: number; expense: number }) {
  const total = income + expense;
  const incomeWidth = total > 0 ? (income / total) * 100 : 50;
  const expenseWidth = total > 0 ? (expense / total) * 100 : 50;

  return (
    <div className="space-y-3">
      <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
        <div 
          className="bg-income flex items-center justify-center text-white text-sm font-medium transition-all duration-700"
          style={{ width: `${incomeWidth}%` }}
        >
          {incomeWidth > 20 && `+${formatMoneyEs(income)}`}
        </div>
        <div 
          className="bg-expense flex items-center justify-center text-white text-sm font-medium transition-all duration-700"
          style={{ width: `${expenseWidth}%` }}
        >
          {expenseWidth > 20 && `-${formatMoneyEs(expense)}`}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-income font-bold text-lg">{formatMoneyEs(income)}</span>
          <span className="text-gray-500 text-sm ml-2">ingresos</span>
        </div>
        <div className={`px-4 py-1 rounded-full ${balance >= 0 ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
          <span className="font-bold">{formatMoneyEs(balance)}</span>
          <span className="text-sm ml-1">balance</span>
        </div>
        <div>
          <span className="text-expense font-bold text-lg">{formatMoneyEs(expense)}</span>
          <span className="text-gray-500 text-sm ml-2">gastos</span>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({ budget }: { budget: { concept: string; amount: number; spent: number; remaining: number; percentage: number } }) {
  const conceptLabels: Record<string, string> = {
    gasolina: '⛽ Gasolina',
    comida: '🛒 Comida',
    alquiler: '🏠 Alquiler',
    servicios: '💡 Servicios',
    ocio: '🎮 Ocio',
    otros: '📦 Otros'
  };

  const conceptColors: Record<string, string> = {
    gasolina: '#F59E0B',
    comida: '#10B981',
    alquiler: '#6366F1',
    servicios: '#8B5CF6',
    ocio: '#EC4899',
    otros: '#6B7280'
  };

  const isOverBudget = budget.percentage > 100;
  const isCompleted = budget.percentage === 100;
  const isWarning = budget.percentage >= 80 && budget.percentage < 100;
  
  const progressColor = isOverBudget ? '#EF4444' : '#10B981';
  const barColor = conceptColors[budget.concept] || '#6B7280';

  const circleSize = 80;
  const circleStroke = 8;
  const radius = (circleSize - circleStroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(budget.percentage, 100) / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: circleSize, height: circleSize }}>
          <svg width={circleSize} height={circleSize} className="transform -rotate-90">
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={circleStroke}
            />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={circleStroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color: progressColor }}>
              {budget.percentage}%
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-800">{conceptLabels[budget.concept] || budget.concept}</span>
            {isOverBudget && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Excedido</span>}
            {isCompleted && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Completado</span>}
            {isWarning && !isCompleted && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Casi</span>}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">
              <span className="font-medium text-expense">{formatMoneyEs(budget.spent)}</span>
              <span className="mx-1">/</span>
              <span className="font-medium">{formatMoneyEs(budget.amount)}</span>
            </span>
          </div>
          
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${Math.min(budget.percentage, 100)}%`,
                backgroundColor: barColor
              }}
            />
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-lg font-bold ${budget.remaining >= 0 ? 'text-income' : 'text-expense'}`}>
            {budget.remaining >= 0 ? formatMoneyEs(budget.remaining) : `-${formatMoneyEs(Math.abs(budget.remaining))}`}
          </p>
          <p className="text-xs text-gray-500">
            {budget.remaining >= 0 ? 'disponible' : 'excedido'}
          </p>
        </div>
      </div>
    </div>
  );
}

function MonthlyChart({ data }: { data: { month: number; year: number; label: string; income: number; expense: number; balance: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📈</span>
        </div>
        <p className="font-medium">Sin datos históricos</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const filteredData = data.filter(d => d.income > 0 || d.expense > 0);
  const maxValue = Math.max(...filteredData.map(d => Math.max(d.income, d.expense)));
  const chartHeight = 150;

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-3 h-3 rounded bg-income"></div>
        <span className="text-xs text-gray-500">Ingresos</span>
        <div className="w-3 h-3 rounded bg-expense ml-2"></div>
        <span className="text-xs text-gray-500">Gastos</span>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-4">
        <div className="flex items-start justify-start md:justify-center gap-4 min-w-max pt-2">
          {filteredData.map((item, index) => {
            const isCurrentMonth = item.month === currentMonth && item.year === currentYear;
            const isHovered = hoveredIndex === index;
            const incomeHeight = maxValue > 0 ? Math.max(4, (item.income / maxValue) * chartHeight) : 0;
            const expenseHeight = maxValue > 0 ? Math.max(4, (item.expense / maxValue) * chartHeight) : 0;
            
            return (
              <div 
                key={index} 
                className="relative flex flex-col items-center flex-shrink-0 group"
                style={{ width: '80px' }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{item.label}</div>
                    <div className="flex items-center gap-1 text-green-400">
                      <span>Ingresos:</span>
                      <span className="font-bold">{formatMoneyEs(item.income)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                      <span>Gastos:</span>
                      <span className="font-bold">{formatMoneyEs(item.expense)}</span>
                    </div>
                  </div>
                )}
                
                {isCurrentMonth && !isHovered && (
                  <span className="absolute -top-6 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                    ⭐
                  </span>
                )}
                
                <div className="relative flex items-end gap-1" style={{ height: `${chartHeight}px` }}>
                  <div 
                    className={`absolute bottom-0 w-8 rounded-t cursor-pointer transition-all duration-200 ${isHovered ? 'bg-income scale-110' : 'bg-income/70'}`}
                    style={{ height: `${incomeHeight}px` }}
                  />
                  <div 
                    className={`absolute bottom-0 w-8 rounded-t cursor-pointer transition-all duration-200 ${isHovered ? 'bg-expense scale-110' : 'bg-expense/70'}`}
                    style={{ height: `${expenseHeight}px`, left: '36px' }}
                  />
                </div>
                
                <div className={`mt-2 mx-1 text-center p-3 rounded-lg w-full ${isCurrentMonth ? 'ring-2 ring-primary bg-primary/10 ring-offset-1' : 'bg-gray-50'}`}>
                  <p className={`text-[10px] truncate ${isCurrentMonth ? 'text-primary font-bold' : 'text-gray-500'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs font-bold mt-1 ${item.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.balance >= 0 ? '+' : ''}{formatMoneyEs(item.balance)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}

interface DashboardProps {
  onNavigate?: (page: 'profile') => void;
}

function MonthlyTrendCards({ data }: { data: { month: number; year: number; label: string; income: number; expense: number; balance: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-slate-500">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="font-medium">Sin datos históricos</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const filteredData = data.filter(d => d.income > 0 || d.expense > 0);

  if (filteredData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center text-sm text-slate-500">
        Sin datos para mostrar
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map(d => Math.max(d.income, d.expense)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-income" />
          Ingresos
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
          <span className="h-2.5 w-2.5 rounded-full bg-expense" />
          Gastos
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          Balance neto mensual
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filteredData.map((item, index) => {
          const isCurrentMonth = item.month === currentMonth && item.year === currentYear;
          const incomeWidth = maxValue > 0 ? Math.max(6, (item.income / maxValue) * 100) : 0;
          const expenseWidth = maxValue > 0 ? Math.max(6, (item.expense / maxValue) * 100) : 0;
          const balancePositive = item.balance >= 0;

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
                isCurrentMonth
                  ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-white to-pink-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-slate-100/70 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    {isCurrentMonth && (
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        Mes actual
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Comparativa mensual de ingresos y gastos</p>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${balancePositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {balancePositive ? '+' : ''}{formatMoneyEs(item.balance)}
                </div>
              </div>

              <div className="relative mt-5 space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Ingresos</span>
                    <span className="font-semibold text-emerald-600">{formatMoneyEs(item.income)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                      style={{ width: `${incomeWidth}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Gastos</span>
                    <span className="font-semibold text-rose-600">{formatMoneyEs(item.expense)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700"
                      style={{ width: `${expenseWidth}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Resultado</p>
                  <p className={`mt-1 text-lg font-bold ${balancePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {balancePositive ? 'Superavit' : 'Deficit'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Neto</p>
                  <p className={`mt-1 text-lg font-bold ${balancePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {balancePositive ? '+' : ''}{formatMoneyEs(item.balance)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { companyName } = useCompany();
  const { 
    getTotals, 
    getMonthlyTransactions, 
    fetchTransactions, 
    fetchBudgets,
    fetchMonthlyData,
    budgets,
    monthlyData,
    loading, 
    selectedMonth, 
    selectedYear, 
    setSelectedMonthYear,
    concepts 
  } = useStore();
  
  const [profile, setProfile] = useState<Profile>({ family_name: companyName || 'Mi Empresa', name: 'Usuario' });
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<any[]>([]);
  const [weather, setWeather] = useState<{ city: string; temperature: number; apparentTemperature: number; description: string; isRainy: boolean; isSnowy: boolean } | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [todayPlans, setTodayPlans] = useState<any[]>([]);
  const [tomorrowPlans, setTomorrowPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [todayClinicAppointments, setTodayClinicAppointments] = useState<any[]>([]);
  const [tomorrowClinicAppointments, setTomorrowClinicAppointments] = useState<any[]>([]);
  const [clinicAppointmentsLoading, setClinicAppointmentsLoading] = useState(false);
  const [showFinancialData, setShowFinancialData] = useState(() => {
    const saved = localStorage.getItem('showFinancialData');
    return saved !== null ? saved === 'true' : true;
  });
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('showFinancialData', String(showFinancialData));
  }, [showFinancialData]);

  useEffect(() => {
    fetch(`${API_URL}/api/motivational-quotes`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const activeQuotes = data.filter((q: any) => q.active === 1 || q.active === true);
          const quoteTexts = activeQuotes.length > 0 ? activeQuotes.map((q: any) => q.quote) : data.map((q: any) => q.quote);
          setQuotes(quoteTexts);
          if (quoteTexts.length > 0) {
            setDailyQuote(quoteTexts[Math.floor(Math.random() * quoteTexts.length)]);
          }
        }
      })
      .catch(() => {});
  }, []);
  
  useEffect(() => {
    fetchTransactions({ month: selectedMonth, year: selectedYear });
    fetch(`${API_URL}/api/budgets/with-spending?month=${selectedMonth}&year=${selectedYear}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        const sortedBudgets = Array.isArray(data)
          ? [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
          : [];
        setCurrentMonthBudgets(sortedBudgets);
      })
      .catch(err => console.error('Error fetching budgets:', err));
    
    fetchMonthlyData();
    fetchProfile();
    fetchWeather();
    
    fetch(`${API_URL}/api/tasks`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        const tareas = Array.isArray(data) ? data : [];
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
        const pendientes = tareas
          .filter((t: any) => t.completed !== 1 && !t.shopping_list_id)
          .sort((a: any, b: any) => {
            const pa = priorityOrder[a.priority] ?? 2;
            const pb = priorityOrder[b.priority] ?? 2;
            if (pa !== pb) return pa - pb;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          });
        setPendingTasks(pendientes);
      })
      .finally(() => setTasksLoading(false));
  }, [fetchTransactions, fetchMonthlyData, selectedMonth, selectedYear]);

  useEffect(() => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = formatDateEsLower(today, { month: 'long' });
    const todayStr = today.toISOString().split('T')[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    fetch(`${API_URL}/api/events?from=${todayStr}&to=${todayStr}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setTodayPlans(Array.isArray(data) ? data : []))
      .catch(() => {});
    
    fetch(`${API_URL}/api/events?from=${tomorrowStr}&to=${tomorrowStr}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setTomorrowPlans(Array.isArray(data) ? data : []);
        setPlansLoading(false);
      })
      .catch(() => setPlansLoading(false));

    fetch(`${API_URL}/api/clinic/appointments`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        const appointments = Array.isArray(data) ? data : [];
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const todayClinic = appointments.filter((a: any) => a.appointment_date === todayStr);
        const tomorrowClinic = appointments.filter((a: any) => a.appointment_date === tomorrowStr);
        
        setTodayClinicAppointments(todayClinic);
        setTomorrowClinicAppointments(tomorrowClinic);
        setClinicAppointmentsLoading(false);
      })
      .catch(() => setClinicAppointmentsLoading(false));

    fetch(`${API_URL}/api/family-members/birthdays`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        const birthdays = Array.isArray(data) ? data : [];
        setUpcomingBirthdays(birthdays.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setBirthdaysLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.family_name) {
        setProfile({ family_name: data.family_name, name: data.name || 'Usuario' });
      }
    } catch (e) {}
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_URL}/api/weather`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.temperature !== null) {
        setWeather({
          city: data.city,
          temperature: data.temperature,
          apparentTemperature: data.apparentTemperature || null,
          description: data.description,
          isRainy: data.isRainy,
          isSnowy: data.isSnowy
        });
        setWeatherError(null);
      } else {
        setWeatherError(data.error || 'Ciudad no configurada');
        setWeather(null);
      }
    } catch (e) {
      setWeatherError('Error cargando clima');
    }
  };

  const totals = getTotals();
  const monthlyTransactions = getMonthlyTransactions();

  const expenseByConcept = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const concept = t.concept || 'otros';
      acc[concept] = (acc[concept] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const today = new Date();
  const isCurrentMonth = () => selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear();
  
  const monthLabel = isCurrentMonth()
    ? formatDateEsLower(today, { day: 'numeric', month: 'long' }) + ' de ' + today.getFullYear()
    : formatDateEsLower(new Date(selectedYear, selectedMonth - 1, 1), { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    d.setMonth(d.getMonth() + delta);
    setSelectedMonthYear(d.getMonth() + 1, d.getFullYear());
  };

  const conceptLabelByKey = concepts.reduce((acc, c) => {
    acc[c.key] = c.label;
    return acc;
  }, {} as Record<string, string>);

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentDayMonth = formatDateEsLower(currentDate, { month: 'long' });
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDayNum = tomorrowDate.getDate();
  const tomorrowMonthStr = formatDateEsLower(tomorrowDate, { month: 'long' });

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h2>
          {weather && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">
                {weather.isRainy ? '🌧️' : weather.isSnowy ? '❄️' : '☀️'}
              </span>
              <span className="font-medium text-gray-700">
                {weather.temperature}°C
              </span>
              {weather.apparentTemperature && (
                <span className="text-gray-400 text-sm">
                  (sensación {weather.apparentTemperature}°C)
                </span>
              )}
              <span className="text-gray-500 text-sm">
                {weather.city} - {weather.description}
              </span>
            </div>
          )}
          {weatherError && (
            <p className="text-xs text-gray-400 mt-1">
              {weatherError} - <button onClick={() => onNavigate?.('profile')} className="text-primary hover:underline">Configurar ciudad</button>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setShowFinancialData(!showFinancialData)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1 text-xs sm:text-sm"
            title={showFinancialData ? "Ocultar datos económicos" : "Mostrar datos económicos"}
          >
            {showFinancialData ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="hidden sm:inline">{showFinancialData ? 'Ocultar' : 'Mostrar'}</span>
          </button>
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <span className="px-2 sm:px-4 py-2 font-semibold text-gray-700 min-w-[110px] sm:min-w-[140px] text-center text-sm sm:text-base">
            {monthLabel}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          {!isCurrentMonth() && (
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonthYear(now.getMonth() + 1, now.getFullYear());
              }}
              className="px-2 sm:px-3 py-2 rounded-lg border border-primary text-primary text-xs sm:text-sm hover:bg-primary/5 transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <div className="text-center py-3 sm:py-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl border border-amber-200 mb-4">
          <p className="text-sm sm:text-base text-gray-700 italic px-4">
            "{dailyQuote}"
          </p>
        </div>
        <div className="text-center py-4 sm:py-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/20 to-indigo-200/20 rounded-full blur-xl"></div>

          <div className="relative inline-flex items-center gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hola {profile.name} {profile.family_name}
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Gestionando los asuntos de <span className="font-semibold text-purple-600">{companyName}</span>
                <span className="text-pink-500">✨</span>
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
                <Briefcase className="w-3 h-3 text-blue-600" />
              </div>
              <div className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-purple-600" />
              </div>
              <div className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {showFinancialData ? (
          <>
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-income/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-income" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-income truncate">{formatMoneyEs(totals.income)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-expense/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="text-expense" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Gastos</p>
                <p className="text-lg sm:text-2xl font-bold text-expense truncate">{formatMoneyEs(totals.expense)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:col-span-1 col-span-1">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                totals.balance >= 0 ? 'bg-income/10' : 'bg-expense/10'
              }`}>
                <Wallet className={totals.balance >= 0 ? 'text-income' : 'text-expense'} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Balance</p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${totals.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatMoneyEs(totals.balance)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-1 sm:col-span-3 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-center gap-3">
            <EyeOff className="text-gray-400" size={24} />
            <p className="text-gray-500 text-sm">Datos económicos ocultos</p>
            <button 
              onClick={() => setShowFinancialData(true)}
              className="text-primary hover:underline text-sm"
            >
              Mostrar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {(() => {
          const allTodayPlans = [
            ...todayPlans.map(p => ({ ...p, source: 'agenda' })),
            ...todayClinicAppointments.map(a => ({
              id: `clinic-${a.id}`,
              title: `${a.client_name} - ${a.service_name}`,
              start_time: a.appointment_time,
              end_time: null,
              location: a.professional_id || null,
              type: 'clinic'
            }))
          ].sort((a, b) => {
            if (!a.start_time) return 1;
            if (!b.start_time) return -1;
            return a.start_time.localeCompare(b.start_time);
          });
          
          const allTomorrowPlans = [
            ...tomorrowPlans.map(p => ({ ...p, source: 'agenda' })),
            ...tomorrowClinicAppointments.map(a => ({
              id: `clinic-${a.id}`,
              title: `${a.client_name} - ${a.service_name}`,
              start_time: a.appointment_time,
              end_time: null,
              location: a.professional_id || null,
              type: 'clinic'
            }))
          ].sort((a, b) => {
            if (!a.start_time) return 1;
            if (!b.start_time) return -1;
            return a.start_time.localeCompare(b.start_time);
          });

          return (
            <>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-green-500" />
                  Citas para hoy ({currentDay} de {currentDayMonth})
                </h3>
                {(plansLoading || clinicAppointmentsLoading) ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : allTodayPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📅</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No hay citas para hoy</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allTodayPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${plan.type === 'clinic' ? 'bg-violet-500' : plan.type === 'work' ? 'bg-blue-500' : plan.type === 'family' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{plan.title}</p>
                          {plan.start_time && (
                            <p className="text-xs text-gray-400">
                              {plan.start_time}{plan.end_time ? ` - ${plan.end_time}` : ''}
                            </p>
                          )}
                        </div>
                        {plan.type === 'clinic' && (
                          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">Clínica</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {allTodayPlans.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">{allTodayPlans.length} cita{ allTodayPlans.length !== 1 ? 's' : ''} para hoy</p>
                )}
              </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  Citas para mañana ({tomorrowDayNum} de {tomorrowMonthStr})
                </h3>
                {(plansLoading || clinicAppointmentsLoading) ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : allTomorrowPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📅</span>
                    <p className="text-gray-500 text-sm">No hay citas para mañana</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allTomorrowPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${plan.type === 'clinic' ? 'bg-violet-500' : plan.type === 'work' ? 'bg-blue-500' : plan.type === 'family' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{plan.title}</p>
                          {plan.start_time && (
                            <p className="text-xs text-gray-400">
                              {plan.start_time}{plan.end_time ? ` - ${plan.end_time}` : ''}
                            </p>
                          )}
                        </div>
                        {plan.type === 'clinic' && (
                          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">Clínica</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {allTomorrowPlans.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">{allTomorrowPlans.length} cita{ allTomorrowPlans.length !== 1 ? 's' : ''} para mañana</p>
                )}
              </div>
            </>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <ListChecks size={20} className="text-orange-500" />
            Tareas Pendientes
          </h3>
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">✅</span>
              <p className="text-gray-500 text-sm">No hay tareas pendientes</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'normal' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.due_date && (
                      <p className={`text-xs flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                        <Calendar size={12} />
                        {formatDateEsLower(new Date(task.due_date), { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  {task.assignee_name && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{task.assignee_name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {pendingTasks.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">{pendingTasks.length} tarea{pendingTasks.length !== 1 ? 's' : ''} pendiente{pendingTasks.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Cake size={20} className="text-pink-500" />
            Próximos Cumpleaños
          </h3>
          {birthdaysLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : upcomingBirthdays.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">🎂</span>
              <p className="text-gray-500 text-sm">No hay cumpleaños próximos</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {upcomingBirthdays.map((b: any) => {
                const isToday = b.daysUntil === 0;
                return (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-pink-500' : b.daysUntil <= 30 ? 'bg-yellow-500' : 'bg-pink-300'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{b.name}</p>
                      <p className="text-xs text-gray-400">
                        {b.day}/{b.month} • Cumple {b.age} años
                      </p>
                    </div>
                    {isToday && (
                      <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">🎉 Hoy</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {upcomingBirthdays.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">{upcomingBirthdays.length} cumpleaños próximo{upcomingBirthdays.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {showFinancialData && (
        <>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Target className="text-primary sm:w-6 sm:h-6" size={20} />
              <h3 className="text-base sm:text-lg font-semibold">Presupuestos del Mes</h3>
            </div>
            
            {currentMonthBudgets.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <p className="text-gray-500 mb-2 text-sm font-medium">No hay presupuestos establecidos</p>
                <p className="text-xs sm:text-sm text-gray-400">Ve a Presupuestos para crear uno</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentMonthBudgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mt-3 sm:mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary sm:w-6 sm:h-6" size={20} />
              <h3 className="text-base sm:text-lg font-semibold">Evolución (6 meses)</h3>
            </div>
            <MonthlyTrendCards data={monthlyData} />
          </div>
        </>
      )}

      <footer className="mt-8 sm:mt-12 pt-4 sm:pt-8 border-t border-gray-200">
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Home size={14} className="text-primary" />
            <span className="font-semibold text-gray-700">{companyName}</span>
          </div>
          <p className="mb-1">© {new Date().getFullYear()} {companyName}</p>
          <p className="text-xs text-gray-400">
            Hecho con <span className="text-red-500">❤</span> para {companyName}
          </p>
        </div>
      </footer>
    </div>
  );
}
