import React, { useState, useRef } from 'react';
import {
  X,
  Maximize2,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  UploadCloud,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubTask, TaskAttachment } from '../types';
import { compressImage } from '../utils/imageUtils';

interface SubtaskDetailModalProps {
  subtask: SubTask;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubtask: (updated: SubTask) => void;
  onToggleComplete: (subtaskId: string) => void;
  onPreviewImage: (attachment: TaskAttachment) => void;
}

export const SubtaskDetailModal: React.FC<SubtaskDetailModalProps> = ({
  subtask,
  isOpen,
  onClose,
  onUpdateSubtask,
  onToggleComplete,
  onPreviewImage,
}) => {
  const [title, setTitle] = useState(subtask.title);
  const [description, setDescription] = useState(subtask.description || '');
  const [copied, setCopied] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSubtask({
      ...subtask,
      title: title.trim() || subtask.title,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const handleCopyDescription = () => {
    if (!description) return;
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subtask.completed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x, y },
        colors: ['#22c55e', '#3b82f6', '#e44232'],
      });
    }
    onToggleComplete(subtask.id);
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

  const handleRemoveAttachment = (attachmentId: string) => {
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
      id="subtask-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="subtask-detail-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Checkbox */}
            <button
              type="button"
              id={`modal-btn-check-${subtask.id}`}
              onClick={handleCheck}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                subtask.completed
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'border-gray-400 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
              }`}
              title={subtask.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la subtarea..."
                className={`w-full text-base font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-red-500 outline-none pb-0.5 transition-all ${
                  subtask.completed ? 'line-through text-gray-400' : ''
                }`}
              />
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-gray-500 font-medium">
                  Detalle ampliado de la subtarea
                </span>
                {subtask.completed ? (
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Completada
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ⚡ En proceso
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-subtask-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors ml-2 cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Descripción / Notas Ampliadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Descripción y Notas Ampliadas</span>
              </label>

              <div className="flex items-center gap-2">
                {description && (
                  <button
                    type="button"
                    onClick={handleCopyDescription}
                    className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-gray-200"
                    title="Copiar texto al portapapeles"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar notas</span>
                      </>
                    )}
                  </button>
                )}
                <span className="text-[11px] text-gray-400">
                  {description.length} caracteres
                </span>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="subtask-modal-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe aquí todas las notas completas, registros, enlaces, especificaciones o pasos detallados de esta subtarea..."
                rows={9}
                className="w-full text-sm font-sans text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white focus:bg-white p-3.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none leading-relaxed transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Galería de Fotos y Archivos Adjuntos */}
          <div className="space-y-2.5 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Imágenes y Capturas Adjuntas ({subtask.attachments?.length || 0})
                </span>
              </div>

              <button
                type="button"
                id="btn-modal-add-image"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adjuntar imagen</span>
              </button>
            </div>

            {/* Drag & drop image area / image list */}
            {subtask.attachments && subtask.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subtask.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group/item relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div
                      className="h-28 w-full bg-gray-100 cursor-pointer overflow-hidden relative"
                      onClick={() => onPreviewImage(att)}
                      title="Clic para ampliar en pantalla completa"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    <div className="p-2 flex items-center justify-between bg-white border-t border-gray-100">
                      <span className="text-[11px] font-medium text-gray-700 truncate max-w-[120px]">
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Quick add card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-36 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all text-gray-500 hover:text-blue-700"
                >
                  <UploadCloud className="w-6 h-6 mb-1 text-gray-400" />
                  <span className="text-xs font-semibold">Subir más fotos</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">o arrastrar aquí</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`py-8 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDraggingOver
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700">
                  No hay imágenes adjuntas en esta subtarea
                </span>
                <span className="text-[11px] text-gray-500 mt-1">
                  Haz clic o arrastra fotos (PNG, JPG, capturas de pantalla) para guardarlas aquí
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-gray-50/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            id="btn-modal-save-subtask"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#e44232] hover:bg-[#c93628] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
