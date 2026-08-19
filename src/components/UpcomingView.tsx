import React from 'react';
import { Calendar, AlertCircle, Plus, Sparkles, Clock } from 'lucide-react';
import { Task, Project, UserProfile } from '../types';
import { TaskItem } from './TaskItem';
import { getTodayString, addDays, formatHeaderDate } from '../utils/dateUtils';

interface UpcomingViewProps {
  tasks: Task[];
  projects: Project[];
  users: UserProfile[];
  currentUserId: string;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onOpenQuickAdd: (date?: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  projects,
  users,
  currentUserId,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onEditTask,
  onOpenQuickAdd,
}) => {
  const today = getTodayString();
  const tomorrow = addDays(today, 1);

  // Group tasks
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today);
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrow);

  // Future next 14 days grouped
  const futureDays: { dateStr: string; label: string; tasks: Task[] }[] = [];
  for (let i = 2; i <= 10; i++) {
    const dStr = addDays(today, i);
    const dTasks = tasks.filter((t) => t.dueDate === dStr);
    if (dTasks.length > 0) {
      futureDays.push({
        dateStr: dStr,
        label: formatHeaderDate(dStr),
        tasks: dTasks,
      });
    }
  }

  const noDateTasks = tasks.filter((t) => !t.dueDate);

  const handleRescheduleAllOverdue = () => {
    overdueTasks.forEach((t) => {
      onUpdateTask({ ...t, dueDate: today });
    });
  };

  return (
    <div id="upcoming-view" className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Próximo</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Planificación y tareas en el calendario para los próximos días
          </p>
        </div>

        <button
          type="button"
          id="btn-add-upcoming-top"
          onClick={() => onOpenQuickAdd()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e44232] hover:bg-[#c93628] shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir tarea</span>
        </button>
      </div>

      {/* Overdue section */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50/50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Vencidas ({overdueTasks.length})
            </span>
            <button
              type="button"
              id="btn-reprogram-all"
              onClick={handleRescheduleAllOverdue}
              className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
            >
              Reprogramar todas a Hoy
            </button>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onEditClick={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
          <h2 className="text-sm font-bold text-gray-900">{formatHeaderDate(today)}</h2>
          <button
            type="button"
            onClick={() => onOpenQuickAdd(today)}
            className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-1">No hay tareas programadas para hoy.</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onEditClick={onEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tomorrow Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
          <h2 className="text-sm font-bold text-gray-900">{formatHeaderDate(tomorrow)}</h2>
          <button
            type="button"
            onClick={() => onOpenQuickAdd(tomorrow)}
            className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        {tomorrowTasks.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-1">Sin tareas para mañana.</p>
        ) : (
          <div className="space-y-2">
            {tomorrowTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onEditClick={onEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Later Days Sections */}
      {futureDays.map((fDay) => (
        <div key={fDay.dateStr} className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h2 className="text-sm font-bold text-gray-900">{fDay.label}</h2>
            <button
              type="button"
              onClick={() => onOpenQuickAdd(fDay.dateStr)}
              className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir
            </button>
          </div>
          <div className="space-y-2">
            {fDay.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onEditClick={onEditTask}
              />
            ))}
          </div>
        </div>
      ))}

      {/* No Date Section */}
      {noDateTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-500">Sin fecha asignada</h2>
          <div className="space-y-2">
            {noDateTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onEditClick={onEditTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
