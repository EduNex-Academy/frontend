import React, { useState, useRef } from 'react'
import { 
  Label 
} from '@/components/ui/label'
import { 
  Button 
} from '@/components/ui/button'
import { 
  Progress 
} from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  FileText, 
  FileVideo, 
  AlertCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  id: string
  label: string
  accept: string
  maxSize?: number // in MB
  onChange: (file: File | null) => void
  error?: string
  fileState: {
    file: File | null
    preview: string | null
    progress: number
  }
  setFileState: React.Dispatch<React.SetStateAction<{
    file: File | null
    preview: string | null
    progress: number
  }>>
}

const getFileSizeInMB = (size: number): number => {
  return size / (1024 * 1024)
}

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  accept,
  maxSize = 100, // Default 100MB
  onChange,
  error,
  fileState,
  setFileState
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    
    if (selectedFile) {
      // Check file size
      if (getFileSizeInMB(selectedFile.size) > maxSize) {
        onChange(null)
        setFileState({
          file: null,
          preview: null,
          progress: 0
        })
        alert(`File size exceeds the maximum allowed size (${maxSize} MB)`)
        return
      }

      // Create preview URL for videos and PDFs
      let previewUrl: string | null = null
      
      if (selectedFile.type.startsWith('video/')) {
        previewUrl = URL.createObjectURL(selectedFile)
      } else if (selectedFile.type === 'application/pdf') {
        // For PDFs we don't create a preview URL
        previewUrl = null
      }

      setFileState({
        file: selectedFile,
        preview: previewUrl,
        progress: 0
      })
      onChange(selectedFile)
    } else {
      setFileState({
        file: null,
        preview: null,
        progress: 0
      })
      onChange(null)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0]
      
      // Check if file type is accepted
      if (!accept.includes(droppedFile.type)) {
        alert(`File type not accepted. Please upload ${accept} files.`)
        return
      }
      
      // Check file size
      if (getFileSizeInMB(droppedFile.size) > maxSize) {
        alert(`File size exceeds the maximum allowed size (${maxSize} MB)`)
        return
      }

      // Create preview URL for videos and PDFs
      let previewUrl: string | null = null
      
      if (droppedFile.type.startsWith('video/')) {
        previewUrl = URL.createObjectURL(droppedFile)
      } else if (droppedFile.type === 'application/pdf') {
        // For PDFs we don't create a preview URL
        previewUrl = null
      }

      setFileState({
        file: droppedFile,
        preview: previewUrl,
        progress: 0
      })
      onChange(droppedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview)
    }
    
    setFileState({
      file: null,
      preview: null,
      progress: 0
    })
    
    onChange(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      {!fileState.file ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50",
            error ? "border-destructive" : ""
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Click or drag and drop to upload
          </p>
          <p className="text-xs text-muted-foreground">
            {accept === 'video/*' ? 'MP4, WebM, MOV up to' : 'PDF up to'} {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive/80 hover:text-white"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start space-x-3">
            {fileState.file.type.startsWith('video/') ? (
              <>
                {fileState.preview ? (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                    <video src={fileState.preview} className="max-w-full max-h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileState.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {fileState.file.type} • {formatFileSize(fileState.file.size)}
              </p>
              
              {fileState.progress > 0 && fileState.progress < 100 && (
                <Progress 
                  value={fileState.progress} 
                  className="h-1 mt-2"
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center mt-1 text-destructive text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{error}</span>
        </div>
      )}
      
      <input
        id={id}
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}