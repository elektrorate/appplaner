import React, { useState } from 'react';
import {
  Inbox,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  Plus,
  ChevronDown,
  User,
  Users,
  Briefcase,
  Home,
  Sparkles,
  FolderPlus,
  CheckCircle,
  Settings,
  Bell,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { Project, UserProfile, ViewType } from '../types';
import { EditProjectModal } from './EditProjectModal';

interface SidebarProps {
  currentView: ViewType;
  selectedProjectId: string | null;
  onSelectView: (view: ViewType, projectId?: string) => void;
  users: UserProfile[];
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  projects: Project[];
  onAddProject: (name: string, color: string) => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  trashCount?: number;
  taskCounts: {
    inbox: number;
    today: number;
    upcoming: number;
    assignedMe: number;
    byProject: Record<string, number>;
  };
  onOpenAddTaskModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedProjectId,
  onSelectView,
  users,
  currentUserId,
  onSwitchUser,
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  trashCount = 0,
  taskCounts,
  onOpenAddTaskModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#e44232');
  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const otherUser = users.find((u) => u.id !== currentUserId) || users[1];

  const handleNavClick = (view: ViewType, projectId?: string) => {
    onSelectView(view, projectId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim(), newProjectColor);
    setNewProjectName('');
    setShowAddProjectModal(false);
  };

  const activeProjects = projects.filter((p) => p.id !== 'inbox' && !p.deletedAt);

  const projectColors = ['#e44232', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${
          isOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-72 md:w-64 max-w-[85vw] bg-[#faf8f7] border-r border-gray-200/80 flex flex-col h-screen select-none shrink-0 text-gray-800 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top User Bar */}
        <div className="p-3.5 border-b border-gray-200/60 flex items-center justify-between relative">
          <button
            type="button"
            id="user-profile-menu-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors text-left"
          >
            <div
              className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.initials}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </button>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              id="btn-close-mobile-sidebar"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* User Switcher Dropdown */}
        {showUserDropdown && (
          <div
            id="user-switcher-dropdown"
            className="absolute left-3 top-14 z-50 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 text-xs animate-in fade-in"
          >
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Cambiar de usuario activo
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                id={`switch-to-${u.id}`}
                onClick={() => {
                  onSwitchUser(u.id);
                  setShowUserDropdown(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-left ${
                  currentUserId === u.id ? 'bg-red-50/70 font-semibold text-red-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.initials}
                  </span>
                  <div>
                    <div className="text-xs">{u.name}</div>
                    <div className="text-[10px] text-gray-400">{u.email}</div>
                  </div>
                </div>
                {currentUserId === u.id && <span className="text-red-600">✓</span>}
              </button>
            ))}

            <div className="border-t border-gray-100 my-1 pt-1 px-3 py-1 text-[11px] text-gray-500 bg-gray-50/50">
              💡 Modo 2 usuarios: Las tareas creadas o asignadas se reflejan al instante.
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Task Button (Big coral button from screenshot) */}
      <div className="p-3">
        <button
          type="button"
          id="sidebar-add-task-btn"
          onClick={onOpenAddTaskModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#e44232] hover:bg-red-100/50 active:bg-red-100 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#e44232] text-white flex items-center justify-center shadow-xs">
            <Plus className="w-4 h-4" />
          </div>
          <span>Añadir tarea</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-2 space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* Bandeja de entrada */}
        <button
          type="button"
          id="nav-inbox"
          onClick={() => handleNavClick('inbox')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'inbox'
              ? 'bg-[#faebe8] text-[#e44232] font-semibold'
              : 'text-gray-700 hover:bg-gray-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className={`w-4 h-4 ${currentView === 'inbox' ? 'text-[#e44232]' : 'text-blue-500'}`} />
            <span>Bandeja de entrada</span>
          </div>
          {taskCounts.inbox > 0 && (
            <span className="text-xs text-gray-500 font-medium px-1.5 py-0.2 rounded bg-gray-200/50">
              {taskCounts.inbox}
            </span>
          )}
        </button>

        {/* Hoy (Selected by default like in screenshot) */}
        <button
          type="button"
          id="nav-today"
          onClick={() => handleNavClick('today')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'today'
              ? 'bg-[#faebe8] text-[#e44232] font-semibold'
              : 'text-gray-700 hover:bg-gray-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className={`w-4 h-4 ${currentView === 'today' ? 'text-[#e44232]' : 'text-emerald-600'}`} />
            <span>Hoy</span>
          </div>
          {taskCounts.today > 0 && (
            <span className="text-xs text-[#e44232] font-semibold px-1.5 py-0.2 rounded bg-red-100/60">
              {taskCounts.today}
            </span>
          )}
        </button>

        {/* Próximo */}
        <button
          type="button"
          id="nav-upcoming"
          onClick={() => handleNavClick('upcoming')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'upcoming'
              ? 'bg-[#faebe8] text-[#e44232] font-semibold'
              : 'text-gray-700 hover:bg-gray-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarDays className={`w-4 h-4 ${currentView === 'upcoming' ? 'text-[#e44232]' : 'text-purple-500'}`} />
            <span>Próximo</span>
          </div>
          {taskCounts.upcoming > 0 && (
            <span className="text-xs text-gray-500 font-medium px-1.5 py-0.2 rounded bg-gray-200/50">
              {taskCounts.upcoming}
            </span>
          )}
        </button>

        {/* Calendario Interactivo */}
        <button
          type="button"
          id="nav-calendar"
          onClick={() => handleNavClick('calendar')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'calendar'
              ? 'bg-[#faebe8] text-[#e44232] font-semibold'
              : 'text-gray-700 hover:bg-gray-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarRange className={`w-4 h-4 ${currentView === 'calendar' ? 'text-[#e44232]' : 'text-amber-500'}`} />
            <span>Calendario completo</span>
          </div>
        </button>

        {/* Mis Tareas (Asignadas a mí) */}
        <button
          type="button"
          id="nav-assigned-me"
          onClick={() => handleNavClick('assigned-me')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'assigned-me'
              ? 'bg-[#faebe8] text-[#e44232] font-semibold'
              : 'text-gray-700 hover:bg-gray-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className={`w-4 h-4 ${currentView === 'assigned-me' ? 'text-[#e44232]' : 'text-indigo-500'}`} />
            <span>Mis asignaciones</span>
          </div>
          {taskCounts.assignedMe > 0 && (
            <span className="text-xs text-indigo-600 font-medium px-1.5 py-0.2 rounded bg-indigo-50">
              {taskCounts.assignedMe}
            </span>
          )}
        </button>

        {/* Mis Proyectos Section Header */}
        <div className="pt-5 pb-1 px-3 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Mis Proyectos
          </span>
          <button
            type="button"
            id="btn-open-add-project"
            onClick={() => setShowAddProjectModal(true)}
            className="p-1 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
            title="Añadir proyecto"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project List */}
        <div className="space-y-0.5">
          {activeProjects.map((proj) => {
            const isSelected = currentView === 'project' && selectedProjectId === proj.id;
            const count = taskCounts.byProject[proj.id] || 0;

            return (
              <div
                key={proj.id}
                className="group/proj relative flex items-center"
              >
                <button
                  type="button"
                  id={`project-link-${proj.id}`}
                  onClick={() => handleNavClick('project', proj.id)}
                  className={`w-full flex items-center justify-between pl-3 pr-8 py-1.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#faebe8] text-[#e44232] font-semibold'
                      : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-xs text-gray-500 font-medium px-1.5 py-0.2 rounded bg-gray-200/50 ml-1">
                      {count}
                    </span>
                  )}
                </button>

                {/* Hover Action Buttons: Edit and Delete */}
                <div className="absolute right-1 opacity-0 group-hover/proj:opacity-100 flex items-center gap-0.5 transition-all">
                  {onUpdateProject && (
                    <button
                      type="button"
                      id={`btn-edit-proj-${proj.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(proj);
                      }}
                      className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
                      title="Editar nombre y color del proyecto"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}

                  {onDeleteProject && (
                    <button
                      type="button"
                      id={`btn-delete-proj-${proj.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDeleteId(proj.id);
                      }}
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Enviar a papelera (15 días)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Papelera de reciclaje (15 días de retención) */}
        <div className="pt-4 mt-3 border-t border-gray-200/60">
          <button
            type="button"
            id="nav-trash"
            onClick={() => handleNavClick('trash')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              currentView === 'trash'
                ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                : 'text-gray-600 hover:bg-red-50/50 hover:text-red-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className={`w-4 h-4 ${currentView === 'trash' ? 'text-red-600' : 'text-gray-400'}`} />
              <span>Papelera</span>
            </div>
            {trashCount > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200/60">
                {trashCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      {projectToDeleteId && (
        <div
          id="modal-confirm-delete-project"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setProjectToDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">¿Mover a la papelera?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              El proyecto <strong>"{projects.find((p) => p.id === projectToDeleteId)?.name}"</strong> se moverá a la papelera y se conservará durante <span className="font-semibold text-gray-900">15 días</span> antes de eliminarse de forma permanente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProjectToDeleteId(null)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-move-to-trash"
                onClick={() => {
                  if (projectToDeleteId && onDeleteProject) {
                    onDeleteProject(projectToDeleteId);
                    setProjectToDeleteId(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
              >
                Mover a papelera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-User Switch & Collab Footer */}
      <div className="p-3 border-t border-gray-200/70 bg-white/50">
        <div className="bg-gray-100/80 rounded-xl p-2.5 border border-gray-200/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              2 Usuarios Activos
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
              Sincronizado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="quick-switch-other-user"
              onClick={() => onSwitchUser(otherUser.id)}
              className="w-full py-1 px-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Cambiar a {otherUser.name}</span>
              <span
                className="w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                style={{ backgroundColor: otherUser.color }}
              >
                {otherUser.initials}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div
          id="modal-add-project"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddProjectModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-3">Crear nuevo proyecto</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre del proyecto
                </label>
                <input
                  type="text"
                  id="input-project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ej. Finanzas, Clientes, Viaje..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Color del proyecto
                </label>
                <div className="flex items-center gap-2">
                  {projectColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProjectColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newProjectColor === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#e44232] hover:bg-[#c93628] rounded-lg disabled:opacity-50"
                >
                  Crear proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && onUpdateProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          onSave={(updatedProj) => {
            onUpdateProject(updatedProj);
            setEditingProject(null);
          }}
        />
      )}
    </aside>
    </>
  );
};
