import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Edit2,
  CheckCircle2,
  Check,
  User,
  ListTodo,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Project, UserProfile, Priority, SubTask, TaskAttachment } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';
import { DatePickerPopup } from './DatePickerPopup';
import { SubtaskItem } from './SubtaskItem';
import { ImageLightboxModal } from './ImageLightboxModal';

interface TaskItemProps {
  task: Task;
  projects: Project[];
  users: UserProfile[];
  currentUserId: string;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onEditClick?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  projects,
  users,
  currentUserId,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onEditClick,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [newQuickSubtaskTitle, setNewQuickSubtaskTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);

  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.title]);

  const handleSaveTitle = () => {
    if (titleDraft.trim() && titleDraft.trim() !== task.title) {
      onUpdateTask({
        ...task,
        title: titleDraft.trim(),
      });
    } else {
      setTitleDraft(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleDraft(task.title);
    setIsEditingTitle(false);
  };

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const totalAttachmentsCount =
    (task.attachments?.length || 0) +
    subtasks.reduce((acc, s) => acc + (s.attachments?.length || 0), 0);

  const project = projects.find((p) => p.id === task.projectId) || projects[0];
  const assignedUser = users.find((u) => u.id === task.assignedTo);
  const friendlyDate = formatFriendlyDate(task.dueDate);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) {
      // Reabrir tarea pendiente sin necesidad de confirmación
      onToggleComplete(task.id);
    } else {
      // Mostrar modal de confirmación antes de dar por concluida la tarea
      setShowCompleteConfirmModal(true);
    }
  };

  const handleConfirmComplete = () => {
    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#3b82f6', '#e44232'],
      disableForReducedMotion: true,
    });
    onToggleComplete(task.id);
    setShowCompleteConfirmModal(false);
  };

  const priorityColors: Record<Priority, { border: string; bgHover: string; text: string; badge: string }> = {
    p1: { border: 'border-red-500', bgHover: 'hover:bg-red-50', text: 'text-red-600', badge: 'bg-red-50 text-red-700 border-red-200' },
    p2: { border: 'border-orange-500', bgHover: 'hover:bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    p3: { border: 'border-blue-500', bgHover: 'hover:bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    p4: { border: 'border-gray-400', bgHover: 'hover:bg-gray-50', text: 'text-gray-500', badge: 'bg-gray-50 text-gray-600 border-gray-200' },
  };

  // Subtask actions
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((s) => {
      if (s.id === subtaskId) {
        const next = !s.completed;
        return {
          ...s,
          completed: next,
          completedAt: next ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const handleUpdateSubtask = (updatedSub: SubTask) => {
    const updatedSubtasks = subtasks.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter((s) => s.id !== subtaskId);
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const handleAddQuickSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickSubtaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newQuickSubtaskTitle.trim(),
      completed: false,
      attachments: [],
    };

    onUpdateTask({
      ...task,
      subtasks: [...subtasks, newSub],
    });

    setNewQuickSubtaskTitle('');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };

  // Estados de la ficha según solicitud del usuario:
  // 1. VERDE: Proyecto/tarea completado (borde verde un poco más grueso que las demás: border-4)
  // 2. AZUL: En proceso con una o más tareas/subtareas cumplidas (borde azul: border-2)
  // 3. ROJO: Pendientes (borde rojo: border-2)
  const isTaskCompleted = Boolean(
    task.completed || (subtasks.length > 0 && completedSubtasksCount === subtasks.length)
  );
  const isTaskInProgress = !isTaskCompleted && subtasks.length > 0 && completedSubtasksCount > 0;
  const isTaskPending = !isTaskCompleted && !isTaskInProgress;

  const cardBorderAndBgClasses = isTaskCompleted
    ? 'border-4 border-emerald-500 bg-emerald-50/20 shadow-xs'
    : isTaskInProgress
    ? 'border-2 border-blue-500 bg-blue-50/15 hover:border-blue-600 hover:shadow-xs'
    : 'border-2 border-red-500 bg-white hover:border-red-600 hover:shadow-xs';

  return (
    <>
      <div
        id={`task-item-${task.id}`}
        className={`group relative rounded-xl transition-all duration-150 p-3.5 ${cardBorderAndBgClasses}`}
      >
        {/* Top Header Row of the Task: NOMBRE DE LA TAREA PRIMERO + BOTÓN DESPLEGAR */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Left side: Checkbox + Nombre de la Tarea en primer lugar */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Main Task Checkbox */}
            <button
              type="button"
              id={`btn-complete-${task.id}`}
              onClick={handleCheckboxClick}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                isTaskCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : isTaskInProgress
                  ? 'border-blue-500 hover:border-blue-600 hover:bg-blue-50 text-blue-600'
                  : 'border-red-500 hover:border-red-600 hover:bg-red-50 text-transparent'
              }`}
              title={isTaskCompleted ? 'Marcar como pendiente' : 'Tachar y completar tarea'}
            >
              {isTaskCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>

            {/* Nombre de la tarea (visible primero, destacado y editable) */}
            {isEditingTitle ? (
              <div
                className="flex items-center gap-1.5 flex-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  id={`input-edit-task-title-${task.id}`}
                  value={titleDraft}
                  autoFocus
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitle();
                  }}
                  className="flex-1 min-w-0 px-2.5 py-1 text-sm font-bold text-gray-950 bg-white border-2 border-red-500 rounded-lg outline-none shadow-xs"
                  placeholder="Escribe el nombre de la tarea..."
                />
                <button
                  type="button"
                  id={`btn-save-title-${task.id}`}
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                  title="Guardar nombre (Enter)"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  id={`btn-cancel-title-${task.id}`}
                  onClick={handleCancelTitle}
                  className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors cursor-pointer"
                  title="Cancelar (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
                title="Clic para desplegar u ocultar detalles"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 group/title">
                    <span
                      className={`text-base font-bold leading-snug break-words ${
                        isTaskCompleted ? 'line-through text-gray-500' : 'text-gray-950'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Edit title pencil button */}
                    <button
                      type="button"
                      id={`btn-edit-title-${task.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200/70 transition-colors cursor-pointer opacity-70 group-hover/title:opacity-100"
                      title="Editar nombre de la tarea"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Status Badge indicator */}
                  {isTaskCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completado
                    </span>
                  ) : isTaskInProgress ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      En proceso ({completedSubtasksCount}/{subtasks.length})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Pendiente
                    </span>
                  )}

                  {/* Subtask count quick indicator if not expanded */}
                  {subtasks.length > 0 && !showDetails && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <ListTodo className="w-3 h-3 text-red-500" />
                      <span>{completedSubtasksCount}/{subtasks.length} subtareas</span>
                    </span>
                  )}

                  {/* Quick Date pill if set */}
                  {task.dueDate && !showDetails && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      friendlyDate.isOverdue
                        ? 'bg-red-100 text-red-700'
                        : friendlyDate.isToday
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{friendlyDate.label}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side: BOTÓN DE DESPLEGAR PARA VER DETALLE + Acciones */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botón principal de desplegar / ocultar detalle */}
            <button
              type="button"
              id={`btn-toggle-details-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
                showDetails
                  ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-400 ring-1 ring-gray-200'
              }`}
              title={showDetails ? 'Plegar detalles de la tarea' : 'Desplegar todos los detalles de la tarea'}
            >
              <span>{showDetails ? 'Ocultar detalle' : 'Desplegar detalle'}</span>
              {showDetails ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>

            {/* Quick Edit modal button */}
            <button
              type="button"
              id={`btn-edit-task-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onEditClick) onEditClick(task);
              }}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Editar en ventana completa"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            {/* Delete button */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-lg border border-red-200">
                <button
                  type="button"
                  id={`btn-confirm-delete-${task.id}`}
                  onClick={handleDeleteClick}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  ¿Borrar?
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="p-1 rounded text-gray-500 hover:text-gray-800 cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id={`btn-delete-task-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
          </div>
        </div>

        {/* SECCIÓN DESPLEGABLE DE DETALLE (Solo visible cuando se pulsa 'Desplegar detalle') */}
        {showDetails && (
          <div
            id={`task-details-pane-${task.id}`}
            className="mt-3.5 pt-3.5 border-t border-gray-200/80 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Descripción de la tarea */}
            {task.description ? (
              <div className="bg-gray-50/90 rounded-lg p-2.5 border border-gray-200/70 text-xs text-gray-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Descripción
                </span>
                <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50/50 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-200">
                <span>Sin descripción adicional</span>
                <button
                  type="button"
                  onClick={() => onEditClick && onEditClick(task)}
                  className="text-[#e44232] hover:underline font-medium text-[11px] cursor-pointer"
                >
                  + Añadir descripción
                </button>
              </div>
            )}

            {/* 2. Barra de metadatos: Fecha, Responsable, Proyecto, Fotos */}
            <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2 rounded-lg border border-gray-100 shadow-2xs">
              {/* Selector de Fecha */}
              <div className="relative">
                <button
                  type="button"
                  id={`btn-reschedule-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                    friendlyDate.isOverdue
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : friendlyDate.isToday
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : task.dueDate
                      ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      : 'bg-gray-50 text-gray-400 border-dashed border-gray-300 hover:bg-gray-100'
                  }`}
                  title="Cambiar fecha de vencimiento"
                >
                  <Calendar className="w-3 h-3 text-red-500" />
                  <span>{friendlyDate.label || 'Asignar fecha'}</span>
                  {task.dueTime && (
                    <span className="flex items-center gap-0.5 opacity-80 font-mono">
                      <Clock className="w-2.5 h-2.5 ml-1" />
                      {task.dueTime}
                    </span>
                  )}
                </button>

                {showDatePicker && (
                  <DatePickerPopup
                    selectedDate={task.dueDate}
                    selectedTime={task.dueTime}
                    onSelectDate={(newDate, newTime) => {
                      onUpdateTask({
                        ...task,
                        dueDate: newDate,
                        dueTime: newTime || undefined,
                      });
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>

              {/* Selector de Responsable */}
              <div className="relative">
                <button
                  type="button"
                  id={`btn-assignee-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                  title="Reasignar responsable"
                >
                  {task.assignedTo === 'all' ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">
                      2
                    </span>
                  ) : assignedUser ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                      style={{ backgroundColor: assignedUser.color }}
                    >
                      {assignedUser.initials}
                    </span>
                  ) : (
                    <User className="w-3 h-3 text-gray-400" />
                  )}
                  <span>
                    {task.assignedTo === 'all'
                      ? 'Compartida'
                      : assignedUser
                      ? assignedUser.name
                      : 'Sin asignar'}
                  </span>
                </button>

                {showUserMenu && (
                  <div
                    id={`user-menu-${task.id}`}
                    className="absolute z-30 left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                      Reasignar a:
                    </div>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onUpdateTask({ ...task, assignedTo: u.id });
                          setShowUserMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 flex items-center gap-2 text-left hover:bg-gray-50 ${
                          task.assignedTo === u.id
                            ? 'bg-red-50 text-red-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                          style={{ backgroundColor: u.color }}
                        >
                          {u.initials}
                        </span>
                        <span>{u.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTask({ ...task, assignedTo: 'all' });
                        setShowUserMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 flex items-center gap-2 text-left hover:bg-gray-50 border-t border-gray-100 ${
                        task.assignedTo === 'all'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">
                        👥
                      </span>
                      <span>Ambos usuarios</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Proyecto */}
              {project && project.id !== 'inbox' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span>{project.name}</span>
                </span>
              )}

              {/* Total fotos */}
              {totalAttachmentsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <ImageIcon className="w-3 h-3" />
                  <span>{totalAttachmentsCount} fotos</span>
                </span>
              )}
            </div>

            {/* 3. Galería de fotos / adjuntos de la tarea principal */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="bg-gray-50/70 p-2.5 rounded-lg border border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Imágenes adjuntas a la tarea:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {task.attachments.map((att) => (
                    <div
                      key={att.id}
                      onClick={() => setPreviewAttachment(att)}
                      className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-transform shadow-2xs relative group/thumb"
                      title={`${att.name} (Clic para ampliar)`}
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Sección de Subtareas y Checklist */}
            <div
              id={`subtasks-section-${task.id}`}
              className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs space-y-2.5"
            >
              {/* Encabezado de la lista de subtareas */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-gray-900">
                    Subtareas ({completedSubtasksCount}/{subtasks.length})
                  </span>
                  {subtasks.length > 0 && (
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                      {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onEditClick && onEditClick(task)}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Gestionar en editor</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Lista de Subtareas */}
              {subtasks.length > 0 ? (
                <div className="space-y-1.5">
                  {subtasks.map((sub) => (
                    <SubtaskItem
                      key={sub.id}
                      subtask={sub}
                      onToggleComplete={handleToggleSubtask}
                      onUpdateSubtask={handleUpdateSubtask}
                      onDeleteSubtask={handleDeleteSubtask}
                      onPreviewImage={(att) => setPreviewAttachment(att)}
                      isDetailedView={false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-1">
                  No hay subtareas aún. Añade una para dividir el trabajo en pasos.
                </p>
              )}

              {/* Formulario rápido para añadir subtarea */}
              <form onSubmit={handleAddQuickSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  id={`input-quick-subtask-${task.id}`}
                  value={newQuickSubtaskTitle}
                  onChange={(e) => setNewQuickSubtaskTitle(e.target.value)}
                  placeholder="+ Añadir subtarea..."
                  className="flex-1 text-xs bg-gray-50 hover:bg-white focus:bg-white px-3 py-1.5 rounded-lg border border-gray-200 focus:border-red-400 outline-none transition-all"
                />
                <button
                  type="submit"
                  id={`btn-submit-quick-subtask-${task.id}`}
                  disabled={!newQuickSubtaskTitle.trim()}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </form>
            </div>

            {/* Botón inferior para plegar el detalle */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer border border-gray-200"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Ocultar detalle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for previewing images */}
      <ImageLightboxModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Modal de Alerta de Confirmación: ¿Dar por concluida la tarea? */}
      {showCompleteConfirmModal && (
        <div
          id={`complete-confirm-modal-${task.id}`}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompleteConfirmModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado con Icono de Verificación */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  ¿Dar por concluida esta tarea?
                </h3>
                <p className="text-xs font-semibold text-gray-800 mt-1 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {task.title}
                </p>
              </div>
            </div>

            {/* Resumen de subtareas si existen */}
            {subtasks.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 text-xs text-blue-950 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-blue-900">
                  <ListTodo className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Subtareas: {completedSubtasksCount} de {subtasks.length} completadas</span>
                </p>
                {completedSubtasksCount < subtasks.length && (
                  <p className="text-blue-700 text-[11px] leading-relaxed">
                    ⚠️ Quedan {subtasks.length - completedSubtasksCount} subtarea(s) pendientes. Al confirmar, la tarea principal cambiará a concluida.
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 leading-relaxed">
              Al confirmar, la tarea quedará marcada como finalizada y su borde cambiará a color <span className="font-semibold text-emerald-600">verde</span>.
            </p>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                id={`btn-cancel-complete-${task.id}`}
                onClick={() => setShowCompleteConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                id={`btn-confirm-complete-${task.id}`}
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sí, dar por concluida</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
