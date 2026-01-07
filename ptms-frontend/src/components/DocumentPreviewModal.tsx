import React, { useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
};

/**
 * Lightweight local Modal fallback used when './ui/modal' is not present.
 * It renders a simple overlay and centered panel. Click on backdrop or the close button to dismiss.
 */
function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  if (!isOpen) return null;

  const sizeClass =
    size === 'xl' ? 'max-w-5xl w-full' :
    size === 'lg' ? 'max-w-3xl w-full' :
    size === 'sm' ? 'max-w-md w-full' :
    'max-w-xl w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden mx-4 ${sizeClass}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">{title}</div>
          <button aria-label="Close" onClick={onClose} className="text-gray-600 hover:text-gray-900">
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

export function DocumentPreviewModal({ isOpen, onClose, document }: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleDownload = () => {
    // Simulate download
    console.log('Downloading document:', document.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${document.documentType}`} size="xl">
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Document Preview */}
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <div className="h-full flex items-center justify-center p-8">
            <div
              className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Mock document content */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-4">
                  {document.documentType}
                </div>
                <div className="text-gray-600 mb-6">
                  <p><strong>Student:</strong> {document.student?.name}</p>
                  <p><strong>Matric No:</strong> {document.student?.matricNo}</p>
                  <p><strong>Program:</strong> {document.student?.program}</p>
                  <p><strong>Submitted:</strong> {document.submittedAt ? new Date(document.submittedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 italic">
                    This is a preview of the document. In a real implementation,
                    this would display the actual PDF or image content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">File Size:</span> 2.3 MB
            </div>
            <div>
              <span className="font-medium">Pages:</span> 3
            </div>
            <div>
              <span className="font-medium">Uploaded:</span> {document.submittedAt ? new Date(document.submittedAt).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Version:</span> 1.0
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
