import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  CheckCircle,
  Filter,
  Users,
  Download,
  ListTodo
} from 'lucide-react';
import { Task, Project, UserProfile, Priority } from '../types';
import {
  getMonthDays,
  MONTHS_SPANISH_FULL,
  DAYS_SPANISH_FULL,
  DAYS_SPANISH_SHORT,
  getTodayString,
  formatToYYYYMMDD,
  parseYYYYMMDD
} from '../utils/dateUtils';
import { TaskInput } from './TaskInput';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  users: UserProfile[];
  currentUserId: string;
  onToggleComplete: (taskId: string) => void;
  onAddTask: (task: {
    title: string;
    description: string;
    dueDate: string;
    dueTime?: string;
    priority: Priority;
    projectId: string;
    assignedTo: string;
  }) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  users,
  currentUserId,
  onToggleComplete,
  onAddTask,
  onDeleteTask,
  onEditTask,
}) => {
  const today = getTodayString();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterUser, setFilterUser] = useState<string>('all'); // 'all', 'user-1', 'user-2'
  const [addingTaskForDate, setAddingTaskForDate] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = getMonthDays(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    if (filterUser === 'all') return true;
    return task.assignedTo === filterUser || task.assignedTo === 'all';
  });

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  filteredTasks.forEach((task) => {
    if (!tasksByDate[task.dueDate]) {
      tasksByDate[task.dueDate] = [];
    }
    tasksByDate[task.dueDate].push(task);
  });

  const priorityClasses: Record<Priority, { dot: string; border: string }> = {
    p1: { dot: 'bg-red-500', border: 'border-l-2 border-red-500 bg-red-50/50' },
    p2: { dot: 'bg-orange-500', border: 'border-l-2 border-orange-500 bg-orange-50/50' },
    p3: { dot: 'bg-blue-500', border: 'border-l-2 border-blue-500 bg-blue-50/50' },
    p4: { dot: 'bg-gray-400', border: 'border-l-2 border-gray-300 bg-gray-50' },
  };

  // Export iCalendar .ics file
  const exportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tareas y Calendario//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const cleanDate = t.dueDate.replace(/-/g, '');
      const timeStr = t.dueTime ? t.dueTime.replace(':', '') + '00' : '090000';
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${t.id}@tareas-calendario`,
        `DTSTAMP:${cleanDate}T${timeStr}Z`,
        `DTSTART:${cleanDate}T${timeStr}Z`,
        `SUMMARY:${t.title}`,
        `DESCRIPTION:${t.description || ''}`,
        `STATUS:${t.completed ? 'COMPLETED' : 'CONFIRMED'}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendario-tareas-${today}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="calendar-view" className="flex flex-col h-full space-y-4">
      {/* Calendar Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {MONTHS_SPANISH_FULL[month]} {year}
          </h2>

          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              id="cal-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="cal-today-btn"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Hoy
            </button>
            <button
              type="button"
              id="cal-next-month"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* User filter pills */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              id="cal-filter-all"
              onClick={() => setFilterUser('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterUser === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ambos usuarios
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                id={`cal-filter-${u.id}`}
                onClick={() => setFilterUser(u.id)}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                  filterUser === u.id
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: u.color }}
                />
                {u.name}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            type="button"
            id="cal-export-ics"
            onClick={exportICS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs transition-colors"
            title="Descargar eventos en formato iCalendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Exportar .ics</span>
          </button>
        </div>
      </div>

      {/* Inline task creator modal for a specific clicked date */}
      {addingTaskForDate && (
        <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 mb-3 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Añadiendo tarea para la fecha: {addingTaskForDate}
            </span>
          </div>
          <TaskInput
            projects={projects}
            users={users}
            currentUserId={currentUserId}
            defaultDueDate={addingTaskForDate}
            onAddTask={(newTask) => {
              onAddTask(newTask);
              setAddingTaskForDate(null);
            }}
            onCancel={() => setAddingTaskForDate(null)}
          />
        </div>
      )}

      {/* Month Days Header & Grid wrapped in a mobile horizontal scroll container */}
      <div className="overflow-x-auto custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="min-w-[580px] sm:min-w-full">
          {/* Month Days Header (D, L, M, Mi, J, V, S) */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-xl overflow-hidden text-center text-xs font-semibold text-gray-600">
            {DAYS_SPANISH_SHORT.map((d, i) => (
              <div key={i} className="bg-gray-50 py-2 sm:py-2.5 uppercase tracking-wider text-[10px] sm:text-[11px]">
                <span className="sm:hidden">{d}</span>
                <span className="hidden sm:inline">{d} · {DAYS_SPANISH_FULL[i].slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-xl overflow-hidden flex-1 min-h-[420px] sm:min-h-[500px]">
            {monthDays.map((day, idx) => {
              const isToday = day.dateStr === today;
              const dayTasks = tasksByDate[day.dateStr] || [];
              const isSelected = selectedDayDetail === day.dateStr;

              return (
                <div
                  key={idx}
                  id={`cal-cell-${day.dateStr}`}
                  className={`bg-white min-h-[95px] sm:min-h-[105px] p-1 sm:p-1.5 flex flex-col justify-between group transition-colors relative ${
                    !day.isCurrentMonth ? 'bg-gray-50/60 text-gray-400' : 'text-gray-800'
                  } ${isToday ? 'bg-red-50/20' : ''} ${isSelected ? 'ring-2 ring-red-400 z-10' : ''}`}
                >
              {/* Day Number and Quick Add Button */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-[#e44232] text-white font-bold shadow-xs'
                      : !day.isCurrentMonth
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Quick Add button on hover */}
                <button
                  type="button"
                  id={`cal-add-btn-${day.dateStr}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingTaskForDate(day.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-600 transition-opacity"
                  title={`Añadir tarea para el ${day.dateStr}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List for this day */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[90px] pr-0.5 custom-scrollbar">
                {dayTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assignedTo);
                  const completedSubtasks = t.subtasks ? t.subtasks.filter((s) => s.completed).length : 0;
                  const totalSubtasks = t.subtasks ? t.subtasks.length : 0;
                  const isCompleted = Boolean(t.completed || (totalSubtasks > 0 && completedSubtasks === totalSubtasks));
                  const isInProgress = !isCompleted && totalSubtasks > 0 && completedSubtasks > 0;
                  const isPending = !isCompleted && !isInProgress;

                  const calBorderClass = isCompleted
                    ? 'border-[2.5px] border-emerald-500 bg-emerald-50/90 text-emerald-950 font-medium'
                    : isInProgress
                    ? 'border border-blue-500 bg-blue-50/90 text-blue-950 font-medium'
                    : 'border border-red-400 bg-red-50/50 text-red-950';

                  return (
                    <div
                      key={t.id}
                      id={`cal-task-${t.id}`}
                      onClick={() => onEditTask(t)}
                      className={`px-1.5 py-1 rounded-md text-[11px] flex items-center justify-between gap-1 shadow-2xs cursor-pointer hover:shadow-xs transition-all ${calBorderClass} ${
                        isCompleted ? 'line-through opacity-80' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(t.id);
                          }}
                          className={`w-3 h-3 rounded-full border flex-shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600'
                              : isInProgress
                              ? 'border-blue-500 hover:bg-blue-100'
                              : 'border-red-400 hover:bg-red-100'
                          }`}
                        />
                        <span className="truncate">{t.title}</span>
                        {totalSubtasks > 0 && (
                          <span
                            className={`text-[9px] px-1 rounded flex items-center gap-0.5 shrink-0 ${
                              isCompleted
                                ? 'text-emerald-700 bg-emerald-100'
                                : isInProgress
                                ? 'text-blue-700 bg-blue-100 font-bold'
                                : 'text-red-700 bg-red-100'
                            }`}
                            title={`${completedSubtasks}/${totalSubtasks} subtareas`}
                          >
                            <ListTodo className="w-2.5 h-2.5" />
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {t.dueTime && (
                          <span className="text-[9px] text-gray-500 font-mono">
                            {t.dueTime}
                          </span>
                        )}
                        {t.assignedTo === 'all' ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[8px] flex items-center justify-center font-bold">
                            2
                          </span>
                        ) : assignee ? (
                          <span
                            className="w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                            style={{ backgroundColor: assignee.color }}
                            title={assignee.name}
                          >
                            {assignee.initials}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Task Count Footer if full */}
              {dayTasks.length > 3 && (
                <div className="text-[10px] text-gray-500 font-medium pt-0.5 text-right">
                  +{dayTasks.length - 3} más
                </div>
              )}
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
};
