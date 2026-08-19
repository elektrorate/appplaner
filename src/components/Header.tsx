import React, { useState } from 'react';
import {
  CalendarPlus,
  Users,
  Check,
  Download,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  HelpCircle,
  Plus,
  Menu
} from 'lucide-react';
import { UserProfile } from '../types';
import { getTodayString } from '../utils/dateUtils';

interface HeaderProps {
  users: UserProfile[];
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  totalPendingCount: number;
  onOpenAddTaskModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  users,
  currentUserId,
  onSwitchUser,
  totalPendingCount,
  onOpenAddTaskModal,
  onToggleMobileSidebar,
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const otherUser = users.find((u) => u.id !== currentUserId) || users[1];

  const handleCopyLink = () => {
    const calendarLink = `${window.location.origin}/calendar-feed.ics`;
    navigator.clipboard.writeText(calendarLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header
      id="app-header"
      className="h-14 border-b border-gray-200/80 bg-white px-3 sm:px-6 flex items-center justify-between select-none z-20 shrink-0"
    >
      {/* Left side: Hamburger button (mobile) + Collaboration indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            id="btn-open-mobile-sidebar"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl text-gray-700 hover:text-gray-950 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            title="Abrir menú"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/70 px-2 sm:px-2.5 py-1 rounded-full text-xs truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-gray-500 font-medium hidden xs:inline">Con:</span>
          <span className="font-semibold text-gray-900 truncate max-w-[90px] sm:max-w-none">{currentUser.name}</span>
        </div>

        {/* Quick 1-click toggle to other user */}
        <button
          type="button"
          id="btn-header-switch-user"
          onClick={() => onSwitchUser(otherUser.id)}
          className="text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          title={`Cambiar a ${otherUser.name}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver como</span> <span className="font-medium">{otherUser.name}</span>
        </button>

        {/* Status border legend */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-gray-200 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-2 border-red-500 bg-white font-medium text-red-700">
            🔴 Pendiente
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-2 border-blue-500 bg-blue-50/50 font-medium text-blue-700">
            🔵 En proceso
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-3 border-emerald-500 bg-emerald-50/60 font-bold text-emerald-800">
            🟢 Completado
          </span>
        </div>
      </div>

      {/* Right side: Quick Add Task button + Connect Calendar button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {onOpenAddTaskModal && (
          <button
            type="button"
            id="btn-header-add-task"
            onClick={onOpenAddTaskModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e44232] hover:bg-[#c93628] active:scale-95 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Añadir tarea</span>
          </button>
        )}

        <button
          type="button"
          id="btn-connect-calendar"
          onClick={() => setShowConnectModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-2xs transition-colors"
          title="Conectar calendario"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden md:inline">Conectar calendario</span>
        </button>
      </div>

      {/* Calendar Connection Modal */}
      {showConnectModal && (
        <div
          id="modal-connect-calendar"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowConnectModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="close-connect-modal"
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e44232] flex items-center justify-center font-bold">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Sincronización con Calendario
                </h3>
                <p className="text-xs text-gray-500">
                  Vincula tus tareas directamente con tu calendario
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4 text-xs text-gray-600">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <p className="font-semibold mb-1">
                  ✓ El calendario interno de la app ya está 100% vinculado a tus tareas.
                </p>
                <p className="text-[11px] text-emerald-700">
                  Cada vez que asignas una fecha en una tarea o la mueves en la vista de Calendario, se actualiza en tiempo real para ambos usuarios.
                </p>
              </div>

              <div>
                <span className="block font-semibold text-gray-800 mb-1">
                  Sincronizar con Google Calendar / Apple / Outlook:
                </span>
                <p className="text-gray-500 mb-2">
                  Puedes exportar todas las tareas con fecha programada en formato estándar .ics para importarlas o suscribirte.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0D%0AVERSION:2.0%0D%0APRODID:-//Tareas y Calendario//ES%0D%0AEND:VCALENDAR`;
                      link.download = 'tareas-calendario.ics';
                      link.click();
                    }}
                    className="w-full py-2 px-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar archivo .ics</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
