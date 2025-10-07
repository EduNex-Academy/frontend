import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModuleDTO } from '@/types';

interface ContentViewerProps {
  module: ModuleDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContentViewer = ({ module, isOpen, onClose }: ContentViewerProps) => {
  if (!module) return null;

  // Get the content URL, preferring CloudFront URL if available
  const contentUrl = module.contentCloudFrontUrl || module.contentUrl;

  // If there is no content URL, return nothing
  if (!contentUrl) return null;

  const renderContent = () => {
    switch (module.type) {
      case 'VIDEO':
        return (
          <div className="aspect-video w-full max-h-[70vh]">
            <video 
              src={contentUrl} 
              controls 
              className="w-full h-full"
              autoPlay 
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'PDF':
        // For PDFs, we use an iframe or object to display the PDF
        return (
          <div className="w-full h-[70vh]">
            <object
              data={`${contentUrl}#toolbar=0`}
              type="application/pdf"
              className="w-full h-full"
            >
              <p>
                It appears you don't have a PDF plugin for this browser.
                You can <a href={contentUrl} target="_blank" rel="noopener noreferrer">click here to download the PDF file</a>.
              </p>
            </object>
          </div>
        );
      default:
        return (
          <div className="p-4 text-center">
            <p>This content type is not supported for preview.</p>
            <a 
              href={contentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Open content in a new tab
            </a>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{module.title}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};