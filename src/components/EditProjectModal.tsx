import React, { useState, useEffect } from 'react';
import { X, FolderEdit, Check } from 'lucide-react';
import { Project } from '../types';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

const COLOR_OPTIONS = [
  { name: 'Rojo Coral', value: '#e44232' },
  { name: 'Azul Real', value: '#3b82f6' },
  { name: 'Verde Esmeralda', value: '#10b981' },
  { name: 'Ámbar Cálido', value: '#f59e0b' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Índigo', value: '#6366f1' },
  { name: 'Rosa Fucsia', value: '#ec4899' },
  { name: 'Teal Cian', value: '#06b6d4' },
  { name: 'Gris Carbón', value: '#4b5563' },
  { name: 'Verde Lima', value: '#84cc16' },
];

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#e44232');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...project,
      name: name.trim(),
      color,
    });
    onClose();
  };

  return (
    <div
      id="edit-project-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <FolderEdit className="w-4 h-4" />
            </div>
            <span>Editar proyecto</span>
          </div>
          <button
            type="button"
            id="btn-close-edit-project-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Project Name Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nombre del proyecto
            </label>
            <input
              type="text"
              id="edit-project-name-input"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Diseño UI, Contabilidad, Clientes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-sm font-semibold text-gray-900 outline-none transition-all"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Color del proyecto
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    id={`edit-color-opt-${c.value.replace('#', '')}`}
                    onClick={() => setColor(c.value)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview */}
          <div className="pt-2">
            <span className="text-[11px] text-gray-400 block mb-1 font-medium">Vista previa:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span>{name.trim() || 'Nombre del proyecto'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-edit-project"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#e44232] hover:bg-[#c93628] active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
