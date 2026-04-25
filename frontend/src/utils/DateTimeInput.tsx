import { useState, useRef, useEffect } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateInput({ value, onChange, className = '' }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setDisplayValue(`${d}/${m}/${y}`);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setDisplayValue(`${dayStr}/${month}/${year}`);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);
    
    let formatted = '';
    if (raw.length > 0) {
      if (raw.length <= 2) {
        formatted = raw;
      } else if (raw.length <= 4) {
        formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
      } else {
        formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
      }
    }
    setDisplayValue(formatted);

    if (raw.length === 8) {
      const day = raw.slice(0, 2);
      const month = raw.slice(2, 4);
      const year = raw.slice(4);
      onChange(`${year}-${month}-${day}`);
    } else if (raw.length === 0) {
      onChange('');
    }
  };

  const handleFocus = () => {
    setViewDate(value ? new Date(value) : new Date());
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = viewDate.toLocaleDateString('es', { month: 'long' });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDay = new Date(year, month, i);
    const isDisabled = currentDay < today;
    const isSelected = value === `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    days.push(
      <button
        key={i}
        type="button"
        onClick={() => !isDisabled && handleDateSelect(i)}
        disabled={isDisabled}
        className={`w-8 h-8 rounded text-sm flex items-center justify-center transition-colors
          ${isSelected ? 'bg-blue-600 text-white' : isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100 text-gray-700'}`}
      >
        {i}
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="dd/mm/aaaa"
        className={`w-full border rounded px-3 py-2 ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
        maxLength={10}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-xl p-3 z-50 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={handlePrevMonth} className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
              ←
            </button>
            <span className="font-semibold text-gray-800 capitalize">{monthName} {year}</span>
            <button type="button" onClick={handleNextMonth} className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600">
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{days}</div>
        </div>
      )}
    </div>
  );
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ value, onChange, className = '' }: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      if (h && m) {
        setDisplayValue(`${h.padStart(2, '0')}:${m}`);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        slots.push(`${hour}:${min}`);
      }
    }
    return slots;
  };

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setDisplayValue(time);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 4) raw = raw.slice(0, 4);
    
    let formatted = '';
    if (raw.length > 0) {
      if (raw.length <= 2) {
        formatted = raw;
      } else {
        formatted = `${raw.slice(0, 2)}:${raw.slice(2)}`;
      }
    }
    setDisplayValue(formatted);

    if (raw.length === 4) {
      const hours = parseInt(raw.slice(0, 2), 10);
      const minutes = raw.slice(2);
      if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) <= 59) {
        onChange(`${hours.toString().padStart(2, '0')}:${minutes}`);
      }
    } else if (raw.length === 0) {
      onChange('');
    }
  };

  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="HH:mm"
        className={`w-full border rounded px-3 py-2 ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
        maxLength={5}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-xl p-2 z-50 max-h-[250px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-1">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeSelect(time)}
                className={`px-2 py-1.5 text-sm rounded transition-colors
                  ${value === time ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}