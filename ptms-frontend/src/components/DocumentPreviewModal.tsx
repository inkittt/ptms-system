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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!document || !isOpen) {
      setPdfUrl(null);
      setError(null);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        
        // BLI-02 is an uploaded document, others are generated PDFs
        const isUploadedDocument = document.type === 'BLI_02';
        
        let response;
        if (isUploadedDocument) {
          // Use the document download endpoint for uploaded files
          response = await fetch(
            `http://localhost:3000/api/applications/documents/${document.id}/download`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
        } else {
          // Use the PDF generation endpoint for generated documents
          const documentType = document.type.replace(/_/g, '-').toLowerCase();
          response = await fetch(
            `http://localhost:3000/api/applications/${document.application.id}/${documentType}/pdf`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
        }

        if (!response.ok) {
          throw new Error('Failed to load document');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load document preview');
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document, isOpen]);

  if (!document) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // BLI-02 is an uploaded document, others are generated PDFs
      const isUploadedDocument = document.type === 'BLI_02';
      
      let response;
      if (isUploadedDocument) {
        // Use the document download endpoint for uploaded files
        response = await fetch(
          `http://localhost:3000/api/applications/documents/${document.id}/download`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } else {
        // Use the PDF generation endpoint for generated documents
        const documentType = document.type.replace(/_/g, '-').toLowerCase();
        response = await fetch(
          `http://localhost:3000/api/applications/${document.application.id}/${documentType}/pdf`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.type}-${document.application.user.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
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
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold mb-2">Error Loading Document</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#view=FitH&zoom=${zoom}`}
              className="w-full h-full"
              style={{
                minHeight: '500px',
                border: 'none',
              }}
              title="Document Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No document to display</p>
            </div>
          )}
        </div>

        {/* Document Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Student:</span> {document.application?.user?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Matric No:</span> {document.application?.user?.matricNo || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Submitted:</span> {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
