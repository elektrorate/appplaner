import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { TaskAttachment } from '../types';

interface ImageLightboxModalProps {
  attachment: TaskAttachment | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div
      id="image-lightbox-backdrop"
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Bar */}
        <div className="w-full flex items-center justify-between py-2 text-white/90 mb-2">
          <span className="text-sm font-medium truncate max-w-md">
            {attachment.name}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download={attachment.name}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Descargar imagen"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              id="btn-close-lightbox"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Cerrar vista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image */}
        <div className="overflow-auto max-h-[80vh] rounded-xl shadow-2xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
          <img
            src={attachment.url}
            alt={attachment.name}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
