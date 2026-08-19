import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  User,
  Users,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  Menu,
  Folder
} from 'lucide-react';
import { Task, Project, UserProfile, ViewType, Priority, SubTask, TaskAttachment } from './types';
import { INITIAL_USERS, INITIAL_PROJECTS, getInitialTasks } from './mockData';
import { formatHeaderDate, getTodayString, formatFriendlyDate } from './utils/dateUtils';
import { safeLocalStorageSet, safeLocalStorageGet } from './utils/storageUtils';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskItem } from './components/TaskItem';
import { TaskInput } from './components/TaskInput';
import { CalendarView } from './components/CalendarView';
import { UpcomingView } from './components/UpcomingView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TrashView } from './components/TrashView';
import { EditProjectModal } from './components/EditProjectModal';

const STORAGE_KEY_TASKS = 'app_tareas_tasks_v1';
const STORAGE_KEY_PROJECTS = 'app_tareas_projects_v1';
const STORAGE_KEY_USERS = 'app_tareas_users_v1';
const STORAGE_KEY_ACTIVE_USER = 'app_tareas_active_user_v1';

export default function App() {
  const today = getTodayString();

  // 1. State initialization with safe LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    return safeLocalStorageGet<Task[]>(STORAGE_KEY_TASKS, getInitialTasks());
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    return safeLocalStorageGet<Project[]>(STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    return safeLocalStorageGet<UserProfile[]>(STORAGE_KEY_USERS, INITIAL_USERS);
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS[0].id; // Erick by default
  });

  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showGlobalAddModal, setShowGlobalAddModal] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [isOverdueOpen, setIsOverdueOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'delete' | 'info' } | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'delete' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 3200);
  };

  // Sync with LocalStorage & cross-tab events
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_ACTIVE_USER, currentUserId);
  }, [currentUserId]);

  // Auto-cleanup items in trash older than 15 days (15 * 24 * 60 * 60 * 1000 ms)
  useEffect(() => {
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Clean expired projects
    setProjects((prev) => {
      const filtered = prev.filter((p) => {
        if (!p.deletedAt) return true;
        const deletedTime = new Date(p.deletedAt).getTime();
        return now - deletedTime < FIFTEEN_DAYS_MS;
      });
      return filtered.length !== prev.length ? filtered : prev;
    });

    // Clean expired tasks
    setTasks((prev) => {
      const filtered = prev.filter((t) => {
        if (!t.deletedAt) return true;
        const deletedTime = new Date(t.deletedAt).getTime();
        return now - deletedTime < FIFTEEN_DAYS_MS;
      });
      return filtered.length !== prev.length ? filtered : prev;
    });
  }, []);

  // Listen to storage events from other tabs for real-time collaboration simulation
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TASKS && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEY_PROJECTS && e.newValue) {
        setProjects(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Keyboard shortcut: Press 'q' to open quick add task modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'q' || e.key === 'Q') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setShowGlobalAddModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Handlers
  const handleAddTask = (newTaskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime?: string;
    priority: Priority;
    projectId: string;
    assignedTo: string;
    subtasks?: SubTask[];
    attachments?: TaskAttachment[];
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newTaskData.title,
      description: newTaskData.description || undefined,
      dueDate: newTaskData.dueDate || today,
      dueTime: newTaskData.dueTime,
      priority: newTaskData.priority,
      projectId: newTaskData.projectId || 'inbox',
      assignedTo: newTaskData.assignedTo || currentUserId,
      completed: false,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      subtasks: newTaskData.subtasks || [],
      attachments: newTaskData.attachments || [],
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`✓ Tarea "${newTask.title}" creada con éxito`, 'success');
  };

  const handleToggleComplete = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const nextCompleted = targetTask ? !targetTask.completed : true;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            completedBy: nextCompleted ? currentUserId : undefined,
          };
        }
        return t;
      })
    );

    setEditingTask((curr) => {
      if (curr && curr.id === taskId) {
        return {
          ...curr,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          completedBy: nextCompleted ? currentUserId : undefined,
        };
      }
      return curr;
    });

    if (nextCompleted) {
      showToast(`✓ Tarea completada`, 'success');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setEditingTask((curr) => (curr?.id === taskId ? null : curr));
    showToast(`🗑️ Tarea ${taskToDelete ? `"${taskToDelete.title}"` : ''} eliminada`, 'delete');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask((curr) => (curr?.id === updatedTask.id ? updatedTask : curr));
    showToast(`✓ Cambios guardados`, 'info');
  };

  const handleAddProject = (name: string, color: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      color,
    };
    setProjects((prev) => [...prev, newProj]);
    showToast(`✓ Proyecto "${name}" creado`, 'success');
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
    showToast(`✓ Proyecto "${updatedProj.name}" actualizado`, 'success');
  };

  // Project Trash and Retention Management
  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, deletedAt: now } : p))
    );

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setCurrentView('today');
    }

    showToast(`🗑️ Proyecto "${proj.name}" enviado a la papelera (15 días de retención)`, 'delete');
  };

  const handleRestoreProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, deletedAt: undefined } : p))
    );
    showToast(`✓ Proyecto "${proj?.name || ''}" restaurado`, 'success');
  };

  const handlePermanentlyDeleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    showToast(`Proyecto "${proj?.name || ''}" eliminado definitivamente`, 'delete');
  };

  const handleRestoreTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, deletedAt: undefined } : t))
    );
    showToast(`✓ Tarea restaurada`, 'success');
  };

  const handlePermanentlyDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast(`Tarea eliminada definitivamente`, 'delete');
  };

  const handleEmptyTrash = () => {
    const deletedProjectIds = new Set(
      projects.filter((p) => Boolean(p.deletedAt)).map((p) => p.id)
    );
    setProjects((prev) => prev.filter((p) => !p.deletedAt));
    setTasks((prev) =>
      prev.filter((t) => !t.deletedAt && !deletedProjectIds.has(t.projectId))
    );
    showToast(`Papelera vaciada por completo`, 'delete');
  };

  const handleRescheduleAllOverdue = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && !t.deletedAt && t.dueDate && t.dueDate < today) {
          return { ...t, dueDate: today };
        }
        return t;
      })
    );
  };

  // Active items (excluding trash)
  const activeProjectsList = projects.filter((p) => !p.deletedAt);
  const activeTasksList = tasks.filter((t) => {
    if (t.deletedAt) return false;
    const proj = projects.find((p) => p.id === t.projectId);
    return !proj || !proj.deletedAt;
  });

  // Task Counts for Sidebar Badges
  const overdueTasks = activeTasksList.filter((t) => !t.completed && t.dueDate && t.dueDate < today);
  const todayTasksList = activeTasksList.filter((t) => t.dueDate === today);
  const todayIncompleteCount = activeTasksList.filter((t) => !t.completed && t.dueDate === today).length;
  const overdueCount = overdueTasks.length;

  const byProjectCounts: Record<string, number> = {};
  activeProjectsList.forEach((p) => {
    byProjectCounts[p.id] = activeTasksList.filter((t) => !t.completed && t.projectId === p.id).length;
  });

  const taskCounts = {
    inbox: activeTasksList.filter((t) => !t.completed && t.projectId === 'inbox').length,
    today: todayIncompleteCount + overdueCount,
    upcoming: activeTasksList.filter((t) => !t.completed && t.dueDate && t.dueDate >= today).length,
    assignedMe: activeTasksList.filter(
      (t) => !t.completed && (t.assignedTo === currentUserId || t.assignedTo === 'all')
    ).length,
    byProject: byProjectCounts,
  };

  const trashCount =
    projects.filter((p) => Boolean(p.deletedAt)).length +
    tasks.filter((t) => Boolean(t.deletedAt)).length;

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const activeProject = activeProjectsList.find((p) => p.id === selectedProjectId);

  // Render view-specific content
  const renderMainContent = () => {
    switch (currentView) {
      case 'trash':
        return (
          <TrashView
            projects={projects}
            tasks={tasks}
            users={users}
            onRestoreProject={handleRestoreProject}
            onPermanentlyDeleteProject={handlePermanentlyDeleteProject}
            onRestoreTask={handleRestoreTask}
            onPermanentlyDeleteTask={handlePermanentlyDeleteTask}
            onEmptyTrash={handleEmptyTrash}
          />
        );

      case 'calendar':
        return (
          <CalendarView
            tasks={activeTasksList}
            projects={activeProjectsList}
            users={users}
            currentUserId={currentUserId}
            onToggleComplete={handleToggleComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={(task) => setEditingTask(task)}
          />
        );

      case 'upcoming':
        return (
          <UpcomingView
            tasks={activeTasksList}
            projects={activeProjectsList}
            users={users}
            currentUserId={currentUserId}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onEditTask={(task) => setEditingTask(task)}
            onOpenQuickAdd={(date) => {
              setShowGlobalAddModal(true);
            }}
          />
        );

      case 'inbox': {
        const inboxTasks = activeTasksList.filter((t) => t.projectId === 'inbox');
        const pending = inboxTasks.filter((t) => !t.completed);
        const done = inboxTasks.filter((t) => t.completed);

        return (
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-blue-500" />
                  Bandeja de entrada
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pending.length} tareas pendientes sin clasificar
                </p>
              </div>
            </div>

            {/* Inline task creator */}
            <TaskInput
              projects={activeProjectsList}
              users={users}
              currentUserId={currentUserId}
              defaultProjectId="inbox"
              defaultDueDate=""
              onAddTask={handleAddTask}
              isInline
            />

            {/* Task list */}
            <div className="space-y-2 pt-2">
              {pending.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={activeProjectsList}
                  users={users}
                  currentUserId={currentUserId}
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onEditClick={(t) => setEditingTask(t)}
                />
              ))}

              {pending.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  ✓ ¡Bandeja de entrada limpia! No hay tareas pendientes aquí.
                </div>
              )}

              {/* Bottom Add Task Button */}
              <button
                type="button"
                id="btn-inbox-bottom-add-task"
                onClick={() => {
                  const input = document.getElementById('task-title-input') as HTMLInputElement | null;
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    setShowGlobalAddModal(true);
                  }
                }}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 text-sm font-medium text-gray-500 hover:text-[#e44232] hover:bg-red-50/50 rounded-xl transition-all group cursor-pointer border border-dashed border-gray-200 hover:border-red-200 mt-2"
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#e44232] text-gray-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Añadir tarea a Bandeja</span>
              </button>
            </div>

            {/* Completed */}
            {done.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-gray-800"
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
                  Tareas completadas ({done.length})
                </button>
                {showCompleted && (
                  <div className="space-y-2 mt-2">
                    {done.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projects={activeProjectsList}
                        users={users}
                        currentUserId={currentUserId}
                        onToggleComplete={handleToggleComplete}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                        onEditClick={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'assigned-me': {
        const myTasks = activeTasksList.filter(
          (t) => t.assignedTo === currentUserId || t.assignedTo === 'all'
        );
        const pending = myTasks.filter((t) => !t.completed);
        const done = myTasks.filter((t) => t.completed);

        return (
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-indigo-500" />
                  Asignadas a mí ({currentUser.name})
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pending.length} tareas asignadas o compartidas contigo
                </p>
              </div>
            </div>

            <TaskInput
              projects={activeProjectsList}
              users={users}
              currentUserId={currentUserId}
              onAddTask={handleAddTask}
              isInline
            />

            <div className="space-y-2 pt-2">
              {pending.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={activeProjectsList}
                  users={users}
                  currentUserId={currentUserId}
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onEditClick={(t) => setEditingTask(t)}
                />
              ))}

              {pending.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  ✓ Todo al día para ti, {currentUser.name}.
                </div>
              )}

              {/* Bottom Add Task Button */}
              <button
                type="button"
                id="btn-assigned-bottom-add-task"
                onClick={() => {
                  const input = document.getElementById('task-title-input') as HTMLInputElement | null;
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    setShowGlobalAddModal(true);
                  }
                }}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 text-sm font-medium text-gray-500 hover:text-[#e44232] hover:bg-red-50/50 rounded-xl transition-all group cursor-pointer border border-dashed border-gray-200 hover:border-red-200 mt-2"
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#e44232] text-gray-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Añadir tarea para {currentUser.name}</span>
              </button>
            </div>
          </div>
        );
      }

      case 'project': {
        if (!activeProject) return null;
        const projTasks = activeTasksList.filter((t) => t.projectId === activeProject.id);
        const pending = projTasks.filter((t) => !t.completed);
        const done = projTasks.filter((t) => t.completed);

        return (
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="group/title flex items-center gap-2 cursor-pointer"
                  onClick={() => setEditingProject(activeProject)}
                  title="Clic para editar nombre y color del proyecto"
                >
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: activeProject.color }}
                    />
                    <span>{activeProject.name}</span>
                  </h1>
                  <span className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-60 group-hover/title:opacity-100 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  • {pending.length} pendientes
                </p>
              </div>

              {/* Action buttons: Edit and Delete */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-edit-active-project"
                  onClick={() => setEditingProject(activeProject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                  title="Editar nombre y color del proyecto"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Editar proyecto</span>
                </button>

                <button
                  type="button"
                  id="btn-delete-active-project"
                  onClick={() => setShowDeleteProjectModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
                  title="Mover proyecto a la papelera (15 días de retención)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Borrar proyecto</span>
                </button>
              </div>
            </div>

            <TaskInput
              projects={activeProjectsList}
              users={users}
              currentUserId={currentUserId}
              defaultProjectId={activeProject.id}
              onAddTask={handleAddTask}
              isInline
            />

            <div className="space-y-2 pt-2">
              {pending.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={activeProjectsList}
                  users={users}
                  currentUserId={currentUserId}
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onEditClick={(t) => setEditingTask(t)}
                />
              ))}

              {pending.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Sin tareas pendientes en este proyecto.
                </div>
              )}

              {/* Bottom Add Task Button */}
              <button
                type="button"
                id="btn-project-bottom-add-task"
                onClick={() => {
                  const input = document.getElementById('task-title-input') as HTMLInputElement | null;
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    setShowGlobalAddModal(true);
                  }
                }}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 text-sm font-medium text-gray-500 hover:text-[#e44232] hover:bg-red-50/50 rounded-xl transition-all group cursor-pointer border border-dashed border-gray-200 hover:border-red-200 mt-2"
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#e44232] text-gray-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Añadir tarea a #{activeProject.name}</span>
              </button>
            </div>

            {/* Delete Project Modal Triggered from Header */}
            {showDeleteProjectModal && (
              <div
                id="modal-delete-active-project"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
                onClick={() => setShowDeleteProjectModal(false)}
              >
                <div
                  className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 text-red-600">
                    <div className="p-2.5 rounded-xl bg-red-100">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">¿Mover proyecto a papelera?</h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    El proyecto <strong>"{activeProject.name}"</strong> se enviará a la papelera. Se conservará durante <span className="font-semibold text-gray-900">15 días</span> por si deseas restaurarlo, y después se eliminará permanentemente.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowDeleteProjectModal(false)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id="btn-confirm-delete-active-project"
                      onClick={() => {
                        handleDeleteProject(activeProject.id);
                        setShowDeleteProjectModal(false);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
                    >
                      Mover a papelera
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'today':
      default: {
        // Today View (matches user's screenshot layout exactly!)
        const pendingToday = todayTasksList.filter((t) => !t.completed);
        const doneToday = todayTasksList.filter((t) => t.completed);
        const totalCountToday = pendingToday.length + overdueTasks.length;

        return (
          <div id="today-view" className="space-y-6 max-w-3xl">
            {/* Top Header: "Hoy" & "6 tareas" (matching screenshot) */}
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Hoy</h1>
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                {totalCountToday} tareas
              </span>
            </div>

            {/* Vencidas (Overdue) accordion/section with "Reprogramar" (matching screenshot) */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    id="btn-toggle-overdue"
                    onClick={() => setIsOverdueOpen(!isOverdueOpen)}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isOverdueOpen ? 'rotate-90' : ''
                      }`}
                    />
                    <span>Vencidas</span>
                    <span className="text-xs px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-semibold">
                      {overdueTasks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-reprogram-today"
                    onClick={handleRescheduleAllOverdue}
                    className="text-xs font-semibold text-[#e44232] hover:text-[#c93628] hover:underline"
                  >
                    Reprogramar
                  </button>
                </div>

                {isOverdueOpen && (
                  <div className="space-y-2 pl-4 border-l-2 border-red-200">
                    {overdueTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projects={projects}
                        users={users}
                        currentUserId={currentUserId}
                        onToggleComplete={handleToggleComplete}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                        onEditClick={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date Section Header: "Ago 17 · Hoy · lunes" (matching screenshot) */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-1">
                {formatHeaderDate(today)}
              </h2>

              {/* Quick inline task creator (matching screenshot exactly!) */}
              <TaskInput
                projects={projects}
                users={users}
                currentUserId={currentUserId}
                defaultDueDate={today}
                onAddTask={handleAddTask}
                isInline
              />

              {/* Tasks for today */}
              <div className="space-y-2 pt-2">
                {pendingToday.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    projects={projects}
                    users={users}
                    currentUserId={currentUserId}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                    onEditClick={(t) => setEditingTask(t)}
                  />
                ))}

                {pendingToday.length === 0 && overdueTasks.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    ✨ ¡Todo completado para hoy! Disfruta tu tiempo libre o planifica en el calendario.
                  </div>
                )}

                {/* Bottom Add Task Button */}
                <button
                  type="button"
                  id="btn-today-bottom-add-task"
                  onClick={() => {
                    const input = document.getElementById('task-title-input') as HTMLInputElement | null;
                    if (input) {
                      input.focus();
                      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                      setShowGlobalAddModal(true);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 text-sm font-medium text-gray-500 hover:text-[#e44232] hover:bg-red-50/50 rounded-xl transition-all group cursor-pointer border border-dashed border-gray-200 hover:border-red-200 mt-2"
                >
                  <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#e44232] text-gray-500 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>Añadir tarea</span>
                </button>
              </div>
            </div>

            {/* Completed Tasks section */}
            {doneToday.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  id="btn-toggle-completed-today"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-gray-800"
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
                  />
                  <span>Tareas completadas hoy ({doneToday.length})</span>
                </button>

                {showCompleted && (
                  <div className="space-y-2 mt-2">
                    {doneToday.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projects={projects}
                        users={users}
                        currentUserId={currentUserId}
                        onToggleComplete={handleToggleComplete}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                        onEditClick={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans antialiased text-gray-800">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        selectedProjectId={selectedProjectId}
        onSelectView={(view, projId) => {
          setCurrentView(view);
          setSelectedProjectId(projId || null);
        }}
        users={users}
        currentUserId={currentUserId}
        onSwitchUser={(uId) => setCurrentUserId(uId)}
        projects={projects}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        trashCount={trashCount}
        taskCounts={taskCounts}
        onOpenAddTaskModal={() => setShowGlobalAddModal(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          users={users}
          currentUserId={currentUserId}
          onSwitchUser={(uId) => setCurrentUserId(uId)}
          totalPendingCount={taskCounts.today}
          onOpenAddTaskModal={() => setShowGlobalAddModal(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 md:px-10 lg:px-12 bg-white custom-scrollbar pb-24 md:pb-20">
          {renderMainContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (thumb-friendly for phones) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 z-30 flex items-center justify-around px-2 py-1.5 shadow-lg select-none"
      >
        {/* Hoy */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('today');
            setSelectedProjectId(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'today' ? 'text-[#e44232] font-semibold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <CalendarIcon className="w-5 h-5" />
            {taskCounts.today > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-[#e44232] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {taskCounts.today}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Hoy</span>
        </button>

        {/* Próximos */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('upcoming');
            setSelectedProjectId(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'upcoming' ? 'text-purple-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Próximos</span>
        </button>

        {/* Bandeja */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('inbox');
            setSelectedProjectId(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'inbox' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {taskCounts.inbox > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {taskCounts.inbox}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Bandeja</span>
        </button>

        {/* Calendario */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('calendar');
            setSelectedProjectId(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'calendar' ? 'text-amber-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CalendarRange className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Calendario</span>
        </button>

        {/* Proyectos / Menú drawer */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isMobileSidebarOpen || currentView === 'project' || currentView === 'trash' || currentView === 'assigned-me'
              ? 'text-[#e44232] font-semibold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menú</span>
        </button>
      </nav>

      {/* Floating Action Button for Quick Add (adjusted position above bottom nav on mobile) */}
      <button
        type="button"
        id="fab-add-task-btn"
        onClick={() => setShowGlobalAddModal(true)}
        className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 md:bottom-8 md:right-8 z-30 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#e44232] hover:bg-[#c93628] active:scale-90 text-white shadow-xl flex items-center justify-center transition-all hover:shadow-2xl cursor-pointer"
        title="Añadir tarea (Atajo: Tecla Q)"
        aria-label="Añadir nueva tarea"
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </button>

      {/* Global Add Task Modal */}
      {showGlobalAddModal && (
        <div
          id="global-add-task-modal"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowGlobalAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-bold text-gray-900">Añadir nueva tarea</span>
              <span className="text-xs text-gray-400">Presiona Enter para guardar</span>
            </div>
            <TaskInput
              projects={activeProjectsList}
              users={users}
              currentUserId={currentUserId}
              defaultDueDate={today}
              onAddTask={(newTask) => {
                handleAddTask(newTask);
                setShowGlobalAddModal(false);
              }}
              onCancel={() => setShowGlobalAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Task Edit Detail Modal */}
      {editingTask && (
        <TaskDetailModal
          task={editingTask}
          projects={activeProjectsList}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          onSave={(updated) => {
            handleUpdateProject(updated);
            setEditingProject(null);
          }}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'delete'
              ? 'bg-red-50 text-red-700 border-red-200'
              : toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-gray-900 text-white border-gray-800'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="opacity-70 hover:opacity-100 ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
