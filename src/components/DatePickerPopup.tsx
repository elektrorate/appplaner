import React, { useState } from 'react';
import {
  Sun,
  Calendar as CalendarIcon,
  Armchair,
  ArrowRight,
  Slash,
  Clock,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  getTodayString,
  addDays,
  getNextWeekend,
  getNextMonday,
  getMonthDays,
  MONTHS_SPANISH_SHORT,
  MONTHS_SPANISH_FULL,
  DAYS_SPANISH_SHORT,
  DAYS_SPANISH_FULL,
  parseYYYYMMDD,
  formatToYYYYMMDD
} from '../utils/dateUtils';

interface DatePickerPopupProps {
  selectedDate: string;
  selectedTime?: string;
  onSelectDate: (date: string, time?: string) => void;
  onClose: () => void;
}

export const DatePickerPopup: React.FC<DatePickerPopupProps> = ({
  selectedDate,
  selectedTime = '',
  onSelectDate,
  onClose,
}) => {
  const today = getTodayString();
  const initialDateObj = selectedDate ? parseYYYYMMDD(selectedDate) : new Date();
  
  const [currentYear, setCurrentYear] = useState<number>(initialDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDateObj.getMonth());
  const [timeValue, setTimeValue] = useState<string>(selectedTime);
  const [showTimeInput, setShowTimeInput] = useState<boolean>(!!selectedTime);

  const tomorrow = addDays(today, 1);
  const laterThisWeek = addDays(today, 2);
  const weekend = getNextWeekend();
  const nextMonday = getNextMonday();

  const monthDays = getMonthDays(currentYear, currentMonth);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    onSelectDate(today, timeValue);
  };

  const handleQuickSelect = (dateStr: string) => {
    onSelectDate(dateStr, timeValue);
    onClose();
  };

  const handleDayClick = (dateStr: string) => {
    onSelectDate(dateStr, timeValue);
    onClose();
  };

  const getDayNameShort = (dateStr: string) => {
    const d = parseYYYYMMDD(dateStr);
    const day = DAYS_SPANISH_FULL[d.getDay()];
    return day.slice(0, 3);
  };

  return (
    <div
      id="datepicker-popup"
      className="absolute left-0 sm:left-auto z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden text-sm text-gray-800 animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Selected date preview header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {selectedDate ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium">
              {selectedDate === today ? 'Hoy' : selectedDate}
              {selectedTime && ` · ${selectedTime}`}
            </span>
          ) : (
            'Seleccionar fecha'
          )}
        </span>
        <button
          type="button"
          onClick={() => {
            onSelectDate('', '');
            onClose();
          }}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
        >
          Limpiar
        </button>
      </div>

      {/* Quick shortcuts list */}
      <div className="py-1 border-b border-gray-100">
        <button
          type="button"
          onClick={() => handleQuickSelect(tomorrow)}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Mañana</span>
          </div>
          <span className="text-xs text-gray-400 font-mono lowercase">{getDayNameShort(tomorrow)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(laterThisWeek)}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <span>Más adelante esta semana</span>
          </div>
          <span className="text-xs text-gray-400 font-mono lowercase">{getDayNameShort(laterThisWeek)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(weekend)}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Armchair className="w-4 h-4 text-purple-500" />
            <span>Este fin de semana</span>
          </div>
          <span className="text-xs text-gray-400 font-mono lowercase">{getDayNameShort(weekend)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(nextMonday)}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            <span>Próxima semana</span>
          </div>
          <span className="text-xs text-gray-400 font-mono lowercase">lun</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('')}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Slash className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Sin fecha</span>
          </div>
        </button>
      </div>

      {/* Mini Calendar Header */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800 lowercase">
            {MONTHS_SPANISH_SHORT[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-100 hover:text-gray-800"
              title="Mes anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleGoToday}
              className="p-1 rounded hover:bg-gray-100 hover:text-gray-800"
              title="Ir a hoy"
            >
              <CircleDot className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 hover:text-gray-800"
              title="Mes siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-1">
          {DAYS_SPANISH_SHORT.map((d, i) => (
            <div key={i} className="py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {monthDays.map((day, idx) => {
            const isSelected = selectedDate === day.dateStr;
            const isToday = day.dateStr === today;
            const isPast = day.dateStr < today;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(day.dateStr)}
                className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-sm'
                    : isToday
                    ? 'border-2 border-red-500 font-bold text-red-600 hover:bg-red-50'
                    : !day.isCurrentMonth
                    ? 'text-gray-300 hover:bg-gray-100 hover:text-gray-600'
                    : isPast
                    ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time and Repeat Options */}
      <div className="p-2 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
        {showTimeInput ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={timeValue}
              onChange={(e) => {
                setTimeValue(e.target.value);
                if (selectedDate) {
                  onSelectDate(selectedDate, e.target.value);
                }
              }}
              className="w-full text-xs outline-none bg-transparent"
            />
            {timeValue && (
              <button
                type="button"
                onClick={() => {
                  setTimeValue('');
                  if (selectedDate) onSelectDate(selectedDate, '');
                  setShowTimeInput(false);
                }}
                className="text-[10px] text-gray-400 hover:text-red-500"
              >
                Quitar
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowTimeInput(true)}
            className="w-full py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{timeValue ? `Hora: ${timeValue}` : 'Hora'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
