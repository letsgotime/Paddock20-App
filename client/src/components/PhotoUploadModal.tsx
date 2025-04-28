import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PhotoUploadModalProps {
  onClose: () => void;
  onSave: (photoUrl: string) => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ onClose, onSave }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      onSave(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 border border-gray-700 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-blue-400 font-orbitron text-xl">Upload Photo</DialogTitle>
          <DialogClose className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-300">Click or drag to change the image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl mb-2">📷</div>
              <h3 className="text-white font-medium text-lg">Drop your image here</h3>
              <p className="text-gray-400 text-sm">or click to browse your files</p>
              <p className="text-gray-500 text-xs">Support JPG, PNG, GIF up to 10MB</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile}
            className={`px-4 py-2 rounded-md ${
              selectedFile
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            Upload Image
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadModal;