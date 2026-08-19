import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Check,
  Edit2,
  FileText,
  Paperclip,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubTask, TaskAttachment } from '../types';
import { compressImage } from '../utils/imageUtils';
import { SubtaskDetailModal } from './SubtaskDetailModal';

interface SubtaskItemProps {
  subtask: SubTask;
  onToggleComplete: (subtaskId: string) => void;
  onUpdateSubtask: (subtask: SubTask) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onPreviewImage: (attachment: TaskAttachment) => void;
  isDetailedView?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggleComplete,
  onUpdateSubtask,
  onDeleteSubtask,
  onPreviewImage,
  isDetailedView = true,
}) => {
  const [isDescOpen, setIsDescOpen] = useState(Boolean(subtask.description));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(subtask.title);
  const [descText, setDescText] = useState(subtask.description || '');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subtask.completed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x, y },
        colors: ['#22c55e', '#3b82f6', '#e44232'],
        disableForReducedMotion: true,
      });
    }
    onToggleComplete(subtask.id);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleText.trim() && titleText !== subtask.title) {
      onUpdateSubtask({
        ...subtask,
        title: titleText.trim(),
      });
    } else {
      setTitleText(subtask.title);
    }
  };

  const handleDescBlur = () => {
    if (descText !== subtask.description) {
      onUpdateSubtask({
        ...subtask,
        description: descText.trim() || undefined,
      });
    }
  };

  const handleFileUpload = (files: FileList | null) => {
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

      const updatedAttachments = [...(subtask.attachments || []), newAttachment];
      onUpdateSubtask({
        ...subtask,
        attachments: updatedAttachments,
      });
    });
  };

  const handleRemoveAttachment = (attachmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = (subtask.attachments || []).filter((a) => a.id !== attachmentId);
    onUpdateSubtask({
      ...subtask,
      attachments: updated,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      id={`subtask-item-${subtask.id}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`group/subtask rounded-xl border transition-all duration-150 p-2.5 ${
        subtask.completed
          ? 'bg-gray-50/70 border-gray-200/60'
          : isDraggingOver
          ? 'bg-red-50/40 border-red-300 ring-2 ring-red-100'
          : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-2xs'
      }`}
    >
      {/* Hidden file input for attaching images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Main Subtask Row */}
      <div className="flex items-start gap-2.5">
        {/* Checklist toggle button */}
        <button
          type="button"
          id={`btn-check-subtask-${subtask.id}`}
          onClick={handleCheck}
          className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
            subtask.completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
              : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
          }`}
          title={subtask.completed ? 'Desmarcar subtarea' : 'Tachar subtarea lista'}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>

        {/* Title and collapsible toggle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isEditingTitle ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  type="text"
                  id={`input-edit-subtask-title-${subtask.id}`}
                  value={titleText}
                  autoFocus
                  onChange={(e) => setTitleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleBlur();
                    if (e.key === 'Escape') {
                      setTitleText(subtask.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 text-xs font-semibold text-gray-900 border-b-2 border-red-500 bg-white px-1.5 py-0.5 outline-none"
                  placeholder="Nombre de la subtarea..."
                />
                <button
                  type="button"
                  id={`btn-save-subtask-title-${subtask.id}`}
                  onClick={handleTitleBlur}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                  title="Guardar nombre"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  id={`btn-cancel-subtask-title-${subtask.id}`}
                  onClick={() => {
                    setTitleText(subtask.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/subtitle">
                <span
                  onClick={() => isDetailedView && setIsEditingTitle(true)}
                  className={`text-xs font-medium break-words cursor-text transition-all select-none ${
                    subtask.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-800 hover:text-gray-900'
                  }`}
                  title="Haz clic para editar el nombre de la subtarea"
                >
                  {subtask.title}
                </span>

                <button
                  type="button"
                  id={`btn-edit-subtask-title-${subtask.id}`}
                  onClick={() => setIsEditingTitle(true)}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-60 group-hover/subtitle:opacity-100 transition-opacity cursor-pointer"
                  title="Editar nombre de subtarea"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Description toggle button (Desplegable) - HIGH VISIBILITY */}
            <button
              type="button"
              id={`btn-toggle-desc-${subtask.id}`}
              onClick={() => setIsDescOpen(!isDescOpen)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all shadow-2xs border cursor-pointer ${
                subtask.description
                  ? isDescOpen
                    ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 ring-1 ring-amber-200/60'
                  : isDescOpen
                  ? 'bg-gray-200 text-gray-800 border-gray-300'
                  : 'bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-800 border-gray-200 hover:border-amber-300'
              }`}
              title={isDescOpen ? 'Plegar descripción / notas' : 'Desplegar descripción / notas'}
            >
              <FileText className={`w-3 h-3 ${isDescOpen && subtask.description ? 'text-white' : 'text-amber-600'}`} />
              <span>
                {isDescOpen
                  ? 'Ocultar notas'
                  : subtask.description
                  ? 'Desplegar notas'
                  : '+ Añadir notas'}
              </span>
              {isDescOpen ? (
                <ChevronUp className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-3 h-3 stroke-[2.5]" />
              )}
            </button>

            {/* Modal Expand Button - MODAL PARA VER TODO EL CONTENIDO AMPLIADO */}
            <button
              type="button"
              id={`btn-expand-modal-subtask-${subtask.id}`}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
              title="Abrir todo el contenido de la subtarea ampliado en un modal"
            >
              <Maximize2 className="w-3 h-3 text-blue-600" />
              <span>Ampliar</span>
            </button>

            {/* Image Attachments Count badge */}
            {subtask.attachments && subtask.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <ImageIcon className="w-2.5 h-2.5" />
                <span>{subtask.attachments.length} {subtask.attachments.length === 1 ? 'img' : 'imgs'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (Attach image, Delete subtask) */}
        <div className="flex items-center gap-1 opacity-80 group-hover/subtask:opacity-100 transition-opacity">
          <button
            type="button"
            id={`btn-attach-img-subtask-${subtask.id}`}
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Adjuntar imagen a esta subtarea"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id={`btn-delete-subtask-${subtask.id}`}
            onClick={() => onDeleteSubtask(subtask.id)}
            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Eliminar subtarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Dropdown Description ("Descripción desplegable") */}
      {isDescOpen && (
        <div
          id={`subtask-desc-container-${subtask.id}`}
          className="mt-2 pt-2 pl-7 pr-1 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Descripción de la subtarea
            </label>
            <button
              type="button"
              id={`btn-open-modal-from-desc-${subtask.id}`}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              title="Ver todo el texto ampliado en modal"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Ver en modal ampliado</span>
            </button>
          </div>
          <textarea
            id={`subtask-desc-input-${subtask.id}`}
            value={descText}
            onChange={(e) => setDescText(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Escribe notas, enlaces o detalles paso a paso..."
            rows={3}
            className="w-full text-xs text-gray-700 placeholder-gray-400 bg-gray-50/80 p-2 rounded-lg border border-gray-200 focus:bg-white focus:ring-1 focus:ring-red-300 focus:border-red-400 outline-none resize-y transition-all min-h-[55px]"
          />
        </div>
      )}

      {/* Subtask Image Attachments Gallery */}
      {subtask.attachments && subtask.attachments.length > 0 && (
        <div className="mt-2.5 pt-2 pl-7 flex flex-wrap gap-2 items-center">
          {subtask.attachments.map((att) => (
            <div
              key={att.id}
              id={`subtask-img-${att.id}`}
              onClick={() => onPreviewImage(att)}
              className="group/img relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer shadow-2xs hover:shadow-xs transition-all hover:scale-105"
              title={`${att.name} (Clic para ampliar)`}
            >
              <img
                src={att.url}
                alt={att.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Overlay delete */}
              <button
                type="button"
                onClick={(e) => handleRemoveAttachment(att.id, e)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover/img:opacity-100 hover:bg-red-600 transition-all"
                title="Eliminar imagen"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 transition-colors text-[10px] cursor-pointer"
            title="Añadir otra imagen"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Img</span>
          </button>
        </div>
      )}

      {/* Modal para ver todo el contenido ampliado de la subtarea */}
      <SubtaskDetailModal
        subtask={{
          ...subtask,
          title: titleText,
          description: descText,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateSubtask={(updated) => {
          setTitleText(updated.title);
          setDescText(updated.description || '');
          onUpdateSubtask(updated);
        }}
        onToggleComplete={onToggleComplete}
        onPreviewImage={onPreviewImage}
      />
    </div>
  );
};
