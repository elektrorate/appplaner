import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Folder,
  CheckCircle2,
  Layers,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Project, Task, UserProfile } from '../types';

interface TrashViewProps {
  projects: Project[];
  tasks: Task[];
  users: UserProfile[];
  onRestoreProject: (projectId: string) => void;
  onPermanentlyDeleteProject: (projectId: string) => void;
  onRestoreTask: (taskId: string) => void;
  onPermanentlyDeleteTask: (taskId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  projects,
  tasks,
  users,
  onRestoreProject,
  onPermanentlyDeleteProject,
  onRestoreTask,
  onPermanentlyDeleteTask,
  onEmptyTrash,
}) => {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deletedProjects = projects.filter((p) => Boolean(p.deletedAt));
  const deletedTasks = tasks.filter((t) => Boolean(t.deletedAt));

  const totalTrashCount = deletedProjects.length + deletedTasks.length;

  const calculateDaysLeft = (deletedAt?: string) => {
    if (!deletedAt) return 15;
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - daysPassed);
  };

  const formatDeletedDate = (deletedAt?: string) => {
    if (!deletedAt) return '';
    const date = new Date(deletedAt);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="trash-view" className="space-y-6 max-w-4xl animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Papelera de reciclaje
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalTrashCount === 0
                ? 'La papelera está vacía'
                : `${totalTrashCount} elemento(s) en papelera`}
            </p>
          </div>
        </div>

        {totalTrashCount > 0 && (
          <div className="flex items-center gap-2">
            {showConfirmEmpty ? (
              <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200 animate-in fade-in">
                <span className="text-xs text-red-700 font-semibold px-2">
                  ¿Vaciar todo definitivamente?
                </span>
                <button
                  type="button"
                  id="btn-confirm-empty-trash"
                  onClick={() => {
                    onEmptyTrash();
                    setShowConfirmEmpty(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Sí, vaciar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmEmpty(false)}
                  className="px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-empty-trash"
                onClick={() => setShowConfirmEmpty(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Vaciar papelera</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 15 Days Policy Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-amber-950 mb-0.5">
            Política de retención de 15 días
          </p>
          <p className="text-amber-800">
            Los proyectos y tareas enviados a la papelera se conservan durante un período de{' '}
            <strong className="font-semibold text-amber-950">15 días continuos</strong>. Durante este tiempo puedes restaurarlos en cualquier momento con un solo clic. Pasados los 15 días, se eliminarán de forma permanente y automática.
          </p>
        </div>
      </div>

      {/* Deleted Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Folder className="w-4 h-4 text-gray-500" />
            <span>Proyectos en papelera ({deletedProjects.length})</span>
          </h2>
        </div>

        {deletedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {deletedProjects.map((proj) => {
              const daysLeft = calculateDaysLeft(proj.deletedAt);
              const projectTasks = tasks.filter((t) => t.projectId === proj.id);

              return (
                <div
                  key={proj.id}
                  id={`trash-project-${proj.id}`}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-gray-100"
                          style={{ backgroundColor: proj.color }}
                        />
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {proj.name}
                        </h3>
                      </div>

                      {/* Days Left Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          daysLeft <= 3
                            ? 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                            : daysLeft <= 7
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                        title="Días restantes antes de la eliminación permanente"
                      >
                        ⏳ {daysLeft === 0 ? 'Expira hoy' : `${daysLeft} días restantes`}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Eliminado: {formatDeletedDate(proj.deletedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span>{projectTasks.length} tareas asociadas a este proyecto</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      id={`btn-restore-proj-${proj.id}`}
                      onClick={() => onRestoreProject(proj.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar proyecto</span>
                    </button>

                    {confirmDeleteId === proj.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPermanentlyDeleteProject(proj.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          ¿Borrar ya?
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`btn-delete-perm-proj-${proj.id}`}
                        onClick={() => setConfirmDeleteId(proj.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar de forma permanente ahora"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar ahora</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
            No hay proyectos en la papelera.
          </div>
        )}
      </div>

      {/* Deleted Tasks Section (if any tasks were sent to trash) */}
      {deletedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-gray-500" />
            <span>Tareas en papelera ({deletedTasks.length})</span>
          </h2>

          <div className="space-y-2">
            {deletedTasks.map((task) => {
              const daysLeft = calculateDaysLeft(task.deletedAt);
              return (
                <div
                  key={task.id}
                  id={`trash-task-${task.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-900 truncate block">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Eliminada: {formatDeletedDate(task.deletedAt)} · ⏳ {daysLeft} días restantes
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestoreTask(task.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPermanentlyDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Borrar definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
