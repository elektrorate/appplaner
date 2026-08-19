import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Flag,
  User,
  Inbox,
  Trash2,
  CheckCircle2,
  Save,
  Plus,
  Image as ImageIcon,
  UploadCloud,
  CheckSquare,
  ListTodo
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Project, UserProfile, Priority, SubTask, TaskAttachment } from '../types';
import { DatePickerPopup } from './DatePickerPopup';
import { formatFriendlyDate } from '../utils/dateUtils';
import { compressImage } from '../utils/imageUtils';
import { SubtaskItem } from './SubtaskItem';
import { ImageLightboxModal } from './ImageLightboxModal';

interface TaskDetailModalProps {
  task: Task;
  projects: Project[];
  users: UserProfile[];
  currentUserId: string;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projects,
  users,
  currentUserId,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [projectId, setProjectId] = useState(task.projectId);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [attachments, setAttachments] = useState<TaskAttachment[]>(task.attachments || []);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [showSubtaskDescInput, setShowSubtaskDescInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [isDraggingTaskFile, setIsDraggingTaskFile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const taskFileInputRef = useRef<HTMLInputElement>(null);
  const newSubtaskInputRef = useRef<HTMLInputElement>(null);

  // Sync state if task prop changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
    setDueTime(task.dueTime || '');
    setPriority(task.priority);
    setProjectId(task.projectId);
    setAssignedTo(task.assignedTo);
    setSubtasks(task.subtasks || []);
    setAttachments(task.attachments || []);
  }, [task]);

  // Support paste image from clipboard with automatic compression
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const { dataUrl, size } = await compressImage(blob, 1200, 1200, 0.75);
            if (dataUrl) {
              const newAtt: TaskAttachment = {
                id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: `Captura-${new Date().toLocaleTimeString('es-ES').replace(/:/g, '-')}.jpg`,
                url: dataUrl,
                size,
                uploadedAt: new Date().toISOString(),
              };
              setAttachments((prev) => [...prev, newAtt]);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSave = () => {
    const updated: Task = {
      ...task,
      title: title.trim() || task.title,
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      projectId,
      assignedTo,
      subtasks,
      attachments,
    };
    onUpdateTask(updated);
    onClose();
  };

  // Subtask handlers
  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      description: newSubtaskDesc.trim() || undefined,
      completed: false,
      attachments: [],
    };

    const nextSubtasks = [...subtasks, newSub];
    setSubtasks(nextSubtasks);
    setNewSubtaskTitle('');
    setNewSubtaskDesc('');
    setShowSubtaskDescInput(false);

    // Auto update task directly so changes persist seamlessly
    onUpdateTask({
      ...task,
      title: title.trim() || task.title,
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      projectId,
      assignedTo,
      subtasks: nextSubtasks,
      attachments,
    });

    setTimeout(() => {
      newSubtaskInputRef.current?.focus();
    }, 50);
  };

  const handleToggleSubtaskComplete = (subtaskId: string) => {
    const nextSubtasks = subtasks.map((s) => {
      if (s.id === subtaskId) {
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });
    setSubtasks(nextSubtasks);
    onUpdateTask({
      ...task,
      subtasks: nextSubtasks,
      attachments,
    });
  };

  const handleUpdateSubtask = (updatedSub: SubTask) => {
    const nextSubtasks = subtasks.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubtasks(nextSubtasks);
    onUpdateTask({
      ...task,
      subtasks: nextSubtasks,
      attachments,
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const nextSubtasks = subtasks.filter((s) => s.id !== subtaskId);
    setSubtasks(nextSubtasks);
    onUpdateTask({
      ...task,
      subtasks: nextSubtasks,
      attachments,
    });
  };

  // Task-level file upload handlers with compression
  const handleTaskFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(async (file) => {
      if (!file.type.startsWith('image/')) return;

      const { dataUrl, size } = await compressImage(file, 1200, 1200, 0.75);
      if (!dataUrl) return;

      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        url: dataUrl,
        size,
        uploadedAt: new Date().toISOString(),
      };

      setAttachments((prev) => {
        const next = [...prev, newAttachment];
        onUpdateTask({
          ...task,
          subtasks,
          attachments: next,
        });
        return next;
      });
    });
  };

  const handleRemoveTaskAttachment = (attachmentId: string) => {
    const next = attachments.filter((a) => a.id !== attachmentId);
    setAttachments(next);
    onUpdateTask({
      ...task,
      subtasks,
      attachments: next,
    });
  };

  const friendlyDate = formatFriendlyDate(dueDate);

  // Subtask completion calculation
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtasksProgress =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <>
      <div
        id="task-detail-modal"
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="detail-complete-btn"
                onClick={() => {
                  if (task.completed) {
                    onToggleComplete(task.id);
                  } else {
                    setShowCompleteConfirm(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  task.completed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{task.completed ? 'Tarea completada' : 'Marcar tarea hecha'}</span>
              </button>

              {subtasks.length > 0 && (
                <span className="text-[11px] font-medium text-gray-500 bg-gray-200/60 px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-gray-600" />
                  <span>
                    {completedSubtasksCount}/{subtasks.length} subtareas ({subtasksProgress}%)
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="detail-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Título de la tarea
              </label>
              <input
                type="text"
                id="detail-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la tarea..."
                className="w-full text-lg font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-red-500 pb-1 outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Descripción / Notas generales
              </label>
              <textarea
                id="detail-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añade notas, contexto o especificaciones para el equipo..."
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all resize-none"
              />
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUBTASKS & CHECKLIST SECTION */}
            {/* ------------------------------------------------------------- */}
            <div
              id="subtasks-section"
              className="pt-3 border-t border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Subtareas y Checklist ({subtasks.length})
                  </h3>
                </div>
                {subtasks.length > 0 && (
                  <span className="text-[11px] font-medium text-gray-500">
                    {completedSubtasksCount} de {subtasks.length} listas
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${subtasksProgress}%` }}
                  />
                </div>
              )}

              {/* List of Subtasks */}
              <div className="space-y-2">
                {subtasks.map((sub) => (
                  <SubtaskItem
                    key={sub.id}
                    subtask={sub}
                    onToggleComplete={handleToggleSubtaskComplete}
                    onUpdateSubtask={handleUpdateSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onPreviewImage={(att) => setPreviewAttachment(att)}
                    isDetailedView={true}
                  />
                ))}
              </div>

              {/* Add Subtask Form */}
              <form
                onSubmit={handleAddSubtask}
                className="bg-gray-50/80 rounded-xl p-2.5 border border-dashed border-gray-300 space-y-2 hover:border-gray-400 transition-all"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={newSubtaskInputRef}
                    type="text"
                    id="input-new-subtask-title"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Añadir nueva subtarea (ej. 'Diseñar boceto preliminar')..."
                    className="flex-1 text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubtaskDescInput(!showSubtaskDescInput)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      showSubtaskDescInput || newSubtaskDesc
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Añadir descripción desplegable a la subtarea"
                  >
                    + Descripción
                  </button>
                  <button
                    type="submit"
                    id="btn-add-subtask-submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                {showSubtaskDescInput && (
                  <textarea
                    id="input-new-subtask-desc"
                    value={newSubtaskDesc}
                    onChange={(e) => setNewSubtaskDesc(e.target.value)}
                    placeholder="Descripción detallada o notas para esta subtarea (desplegable)..."
                    rows={2}
                    className="w-full text-xs bg-white p-2 rounded-lg border border-gray-200 text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-red-400 resize-none animate-in fade-in"
                  />
                )}
              </form>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TASK ATTACHMENTS & IMAGES SECTION */}
            {/* ------------------------------------------------------------- */}
            <div
              id="task-attachments-section"
              className="pt-3 border-t border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Imágenes y Adjuntos de la tarea ({attachments.length})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400">
                  Arrastra imágenes o pega con Ctrl+V
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={taskFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleTaskFileUpload(e.target.files)}
              />

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingTaskFile(true);
                }}
                onDragLeave={() => setIsDraggingTaskFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingTaskFile(false);
                  if (e.dataTransfer.files) {
                    handleTaskFileUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => taskFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDraggingTaskFile
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 bg-gray-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
                  <UploadCloud className="w-6 h-6 text-blue-500 mb-0.5" />
                  <p className="text-xs font-medium text-gray-700">
                    Haz clic para subir o arrastra tus imágenes aquí
                  </p>
                  <p className="text-[10px] text-gray-400">
                    PNG, JPG, GIF o WebP compatibles
                  </p>
                </div>
              </div>

              {/* Attachments Gallery */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      id={`task-att-${att.id}`}
                      onClick={() => setPreviewAttachment(att)}
                      className="group/gallery relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:scale-102"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTaskAttachment(att.id);
                          }}
                          className="self-end p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-white truncate font-medium">
                          {att.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* METADATA GRID */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
              {/* Due Date */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60 relative">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
                  Fecha de entrega
                </span>
                <button
                  type="button"
                  id="detail-date-picker-btn"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-800 hover:text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{friendlyDate.label || 'Sin fecha'}</span>
                    {dueTime && <span className="text-gray-500">· {dueTime}</span>}
                  </div>
                  <span className="text-[10px] text-gray-400">Editar</span>
                </button>

                {showDatePicker && (
                  <DatePickerPopup
                    selectedDate={dueDate}
                    selectedTime={dueTime}
                    onSelectDate={(newDate, newTime) => {
                      setDueDate(newDate);
                      if (newTime !== undefined) setDueTime(newTime);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>

              {/* Assignee */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
                  Asignado a
                </span>
                <select
                  id="detail-assignee-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium text-gray-800 outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                  <option value="all">👥 Ambos usuarios (Compartida)</option>
                </select>
              </div>

              {/* Priority */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
                  Prioridad
                </span>
                <select
                  id="detail-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium text-gray-800 outline-none"
                >
                  <option value="p1">🔴 Prioridad 1 (Urgente)</option>
                  <option value="p2">🟠 Prioridad 2 (Alta)</option>
                  <option value="p3">🔵 Prioridad 3 (Normal)</option>
                  <option value="p4">⚪ Prioridad 4 (Baja)</option>
                </select>
              </div>

              {/* Project */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
                  Proyecto
                </span>
                <select
                  id="detail-project-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium text-gray-800 outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  ¿Eliminar esta tarea?
                </span>
                <button
                  type="button"
                  id="detail-confirm-delete-btn"
                  onClick={() => {
                    onDeleteTask(task.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  id="detail-cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="detail-footer-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar tarea</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                id="detail-footer-close-btn"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                id="detail-save-btn"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold text-white bg-[#e44232] hover:bg-[#c93628] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar cambios</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Viewer */}
      <ImageLightboxModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Modal de Alerta de Confirmación: ¿Dar por concluida la tarea? */}
      {showCompleteConfirm && (
        <div
          id="detail-complete-confirm-modal"
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCompleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado con Icono */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  ¿Dar por concluida esta tarea?
                </h3>
                <p className="text-xs font-semibold text-gray-800 mt-1 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {title || task.title}
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
                id="btn-cancel-modal-complete"
                onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-modal-complete"
                onClick={() => {
                  confetti({
                    particleCount: 45,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#22c55e', '#16a34a', '#3b82f6', '#e44232'],
                    disableForReducedMotion: true,
                  });
                  onToggleComplete(task.id);
                  setShowCompleteConfirm(false);
                }}
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
