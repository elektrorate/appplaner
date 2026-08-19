import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Inbox,
  Flag,
  UserCheck,
  X,
  Plus,
  Clock,
  Sparkles,
  ChevronDown,
  ListTodo,
  Image as ImageIcon,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Priority, Project, UserProfile, SubTask, TaskAttachment } from '../types';
import { DatePickerPopup } from './DatePickerPopup';
import { getTodayString, formatFriendlyDate } from '../utils/dateUtils';

interface TaskInputProps {
  projects: Project[];
  users: UserProfile[];
  currentUserId: string;
  defaultProjectId?: string;
  defaultDueDate?: string;
  onAddTask: (task: {
    title: string;
    description: string;
    dueDate: string;
    dueTime?: string;
    priority: Priority;
    projectId: string;
    assignedTo: string;
    subtasks?: SubTask[];
    attachments?: TaskAttachment[];
  }) => void;
  onCancel?: () => void;
  isInline?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  projects,
  users,
  currentUserId,
  defaultProjectId = 'inbox',
  defaultDueDate,
  onAddTask,
  onCancel,
  isInline = false,
}) => {
  const today = getTodayString();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Default to today if not explicitly passed as something else
  const [dueDate, setDueDate] = useState(defaultDueDate !== undefined ? defaultDueDate : today);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('p4');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [assignedTo, setAssignedTo] = useState(currentUserId);
  const [titleError, setTitleError] = useState(false);

  // Subtasks and attachments created together with new task
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [showSubtasksSection, setShowSubtasksSection] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleAddInlineSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;

    const newSub: SubTask = {
      id: `sub-init-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskInput.trim(),
      completed: false,
      attachments: [],
    };
    setSubtasks((prev) => [...prev, newSub]);
    setNewSubtaskInput('');
  };

  const handleRemoveInlineSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;

        const newAtt: TaskAttachment = {
          id: `att-init-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          url: result,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      titleInputRef.current?.focus();
      return;
    }

    setTitleError(false);

    // Trigger subtle celebratory confetti
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#e44232', '#22c55e', '#3b82f6'],
      disableForReducedMotion: true,
    });

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      projectId: projectId || 'inbox',
      assignedTo: assignedTo || currentUserId,
      subtasks,
      attachments,
    });

    // Reset inputs
    setTitle('');
    setDescription('');
    setSubtasks([]);
    setAttachments([]);
    setShowSubtasksSection(false);

    if (!isInline && onCancel) {
      onCancel();
    }
  };

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];
  const selectedUser = users.find((u) => u.id === assignedTo);
  const friendlyDate = formatFriendlyDate(dueDate);

  const priorityColors: Record<Priority, { label: string; text: string; bg: string; icon: string }> = {
    p1: { label: 'Prioridad 1 (Urgente)', text: 'text-red-600', bg: 'bg-red-50 text-red-700 border-red-200', icon: 'text-red-600' },
    p2: { label: 'Prioridad 2 (Alta)', text: 'text-orange-500', bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'text-orange-500' },
    p3: { label: 'Prioridad 3 (Normal)', text: 'text-blue-500', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500' },
    p4: { label: 'Prioridad 4 (Baja)', text: 'text-gray-400', bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: 'text-gray-400' },
  };

  return (
    <div
      id="task-input-container"
      className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 relative"
    >
      {/* Hidden file input for uploading images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Title Input */}
        <div className="space-y-1">
          <input
            ref={titleInputRef}
            type="text"
            id="task-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError && e.target.value.trim()) {
                setTitleError(false);
              }
            }}
            placeholder="Escribe el nombre de la tarea (ej. 'Revisar reporte mensual')..."
            className={`w-full text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none bg-transparent px-1 py-1 rounded-md transition-all ${
              titleError ? 'ring-2 ring-red-400 bg-red-50/50 placeholder-red-300' : ''
            }`}
          />
          {titleError && (
            <p className="text-[11px] font-semibold text-red-600 px-1 animate-in fade-in flex items-center gap-1">
              <span>⚠️</span>
              <span>Por favor escribe el nombre de la tarea para poder guardarla.</span>
            </p>
          )}
        </div>

        {/* Description textarea */}
        <textarea
          id="task-desc-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Descripción o notas adicionales... (Ctrl+Enter para guardar)"
          rows={2}
          className="w-full text-xs text-gray-700 placeholder-gray-400 outline-none resize-none bg-transparent px-1"
        />

        {/* Subtasks being added inside creator */}
        {showSubtasksSection && (
          <div className="pt-2 pb-1 border-t border-gray-100 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-red-500" />
                Subtareas ({subtasks.length})
              </span>
              <button
                type="button"
                onClick={() => setShowSubtasksSection(false)}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >
                Ocultar
              </button>
            </div>

            {/* List of subtasks to be created */}
            {subtasks.length > 0 && (
              <div className="space-y-1">
                {subtasks.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                  >
                    <span className="text-gray-800 font-medium truncate">
                      {idx + 1}. {sub.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInlineSubtask(sub.id)}
                      className="text-gray-400 hover:text-red-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Subtask input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineSubtask(e);
                  }
                }}
                placeholder="+ Añadir subtarea y presiona Enter..."
                className="flex-1 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={handleAddInlineSubtask}
                disabled={!newSubtaskInput.trim()}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Image Attachments Preview */}
        {attachments.length > 0 && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 items-center">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 group/att"
              >
                <img
                  src={att.url}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action / Tag Pills Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          {/* Due Date & Time Picker */}
          <div className="relative">
            <button
              type="button"
              id="btn-pick-date"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowProjectPicker(false);
                setShowPriorityPicker(false);
                setShowUserPicker(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                friendlyDate.isToday
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : friendlyDate.isTomorrow
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : dueDate
                  ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{friendlyDate.label || 'Hoy'}</span>
              {dueTime && <span className="opacity-80">· {dueTime}</span>}
              <ChevronDown className="w-3 h-3 opacity-60" />
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

          {/* Project Picker */}
          <div className="relative">
            <button
              type="button"
              id="btn-pick-project"
              onClick={() => {
                setShowProjectPicker(!showProjectPicker);
                setShowDatePicker(false);
                setShowPriorityPicker(false);
                setShowUserPicker(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200/60"
            >
              <Inbox className="w-3.5 h-3.5 text-gray-500" />
              <span>{selectedProject?.name || 'Bandeja de entrada'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showProjectPicker && (
              <div
                id="dropdown-projects"
                className="absolute z-40 left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-xs"
              >
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProjectId(p.id);
                      setShowProjectPicker(false);
                    }}
                    className={`w-full px-3 py-1.5 flex items-center gap-2 text-left hover:bg-gray-50 ${
                      projectId === p.id ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignee Picker */}
          <div className="relative">
            <button
              type="button"
              id="btn-pick-user"
              onClick={() => {
                setShowUserPicker(!showUserPicker);
                setShowDatePicker(false);
                setShowProjectPicker(false);
                setShowPriorityPicker(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200/60 transition-colors"
            >
              {assignedTo === 'all' ? (
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[8px] flex items-center justify-center font-bold">
                  2
                </span>
              ) : selectedUser ? (
                <span
                  className="w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: selectedUser.color }}
                >
                  {selectedUser.initials}
                </span>
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>
                {assignedTo === 'all'
                  ? 'Ambos'
                  : selectedUser
                  ? selectedUser.name
                  : 'Sin asignar'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showUserPicker && (
              <div
                id="dropdown-users"
                className="absolute z-40 left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-xs"
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Asignar responsable
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setAssignedTo(u.id);
                      setShowUserPicker(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-gray-50 ${
                      assignedTo === u.id ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.initials}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs">{u.name}</span>
                      <span className="text-[10px] text-gray-400">{u.email}</span>
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setAssignedTo('all');
                    setShowUserPicker(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2.5 text-left hover:bg-gray-50 ${
                    assignedTo === 'all' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                    👥
                  </span>
                  <span>Ambos (compartida)</span>
                </button>
              </div>
            )}
          </div>

          {/* Priority Picker */}
          <div className="relative">
            <button
              type="button"
              id="btn-pick-priority"
              onClick={() => {
                setShowPriorityPicker(!showPriorityPicker);
                setShowDatePicker(false);
                setShowProjectPicker(false);
                setShowUserPicker(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${priorityColors[priority].bg}`}
            >
              <Flag className={`w-3.5 h-3.5 ${priorityColors[priority].icon}`} />
              <span>{priority.toUpperCase()}</span>
            </button>

            {showPriorityPicker && (
              <div
                id="dropdown-priorities"
                className="absolute z-40 left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-xs"
              >
                {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setShowPriorityPicker(false);
                    }}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-gray-50 ${
                      priority === p ? 'bg-gray-100 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Flag className={`w-3.5 h-3.5 ${priorityColors[p].icon}`} />
                      {priorityColors[p].label}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Subtask Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSubtasksSection(!showSubtasksSection)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              showSubtasksSection || subtasks.length > 0
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
            title="Añadir subtareas a esta tarea"
          >
            <ListTodo className="w-3.5 h-3.5 text-red-500" />
            <span>+ Subtareas {subtasks.length > 0 && `(${subtasks.length})`}</span>
          </button>

          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              attachments.length > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
            title="Adjuntar imágenes"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>+ Foto {attachments.length > 0 && `(${attachments.length})`}</span>
          </button>
        </div>

        {/* Bottom Submission Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 hidden sm:block">
            💡 Presiona <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-600">Enter</kbd> para guardar
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onCancel && (
              <button
                type="button"
                id="btn-cancel-task"
                onClick={onCancel}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              id="btn-submit-task"
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#e44232] hover:bg-[#c93628] active:scale-95 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir tarea</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
