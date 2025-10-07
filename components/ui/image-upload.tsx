import React, { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  id: string
  label: string
  accept: string
  maxSize: number // in MB
  onChange: (file: File | null) => void
  error?: string
  imageState: {
    file: File | null
    preview: string | null
    progress: number
  }
  setImageState: React.Dispatch<React.SetStateAction<{
    file: File | null
    preview: string | null
    progress: number
  }>>
}

export function ImageUpload({
  id,
  label,
  accept,
  maxSize,
  onChange,
  error,
  imageState,
  setImageState
}: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Get file size in MB
  const getFileSizeInMB = (bytes: number): number => {
    return bytes / (1024 * 1024)
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    
    if (!files || files.length === 0) {
      return
    }
    
    const file = files[0]
    
    // Check file size
    if (getFileSizeInMB(file.size) > maxSize) {
      setImageState({
        file: null,
        preview: null,
        progress: 0
      })
      onChange(null)
      alert(`File size exceeds the maximum allowed size (${maxSize} MB)`)
      return
    }
    
    // Check if file type is accepted
    // For image/* acceptance, check if file type starts with 'image/'
    if (accept === 'image/*') {
      if (!file.type.startsWith('image/')) {
        setImageState({
          file: null,
          preview: null,
          progress: 0
        })
        onChange(null)
        alert('File type not accepted. Please upload an image file.')
        return
      }
    } else if (accept.includes('/*')) {
      const generalType = accept.split('/')[0]
      if (!file.type.startsWith(`${generalType}/`)) {
        setImageState({
          file: null,
          preview: null,
          progress: 0
        })
        onChange(null)
        alert(`File type not accepted. Please upload a ${generalType} file.`)
        return
      }
    } else if (!accept.includes(file.type)) {
      setImageState({
        file: null,
        preview: null,
        progress: 0
      })
      onChange(null)
      alert(`File type not accepted. Please upload ${accept} files.`)
      return
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    setImageState({
      file,
      preview: previewUrl,
      progress: 0
    })
    
    onChange(file)
  }
  
  const handleRemoveImage = () => {
    if (imageState.preview) {
      URL.revokeObjectURL(imageState.preview)
    }
    
    setImageState({
      file: null,
      preview: null,
      progress: 0
    })
    
    onChange(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

      // Create preview URL
      const previewUrl = URL.createObjectURL(droppedFile)
      
      setImageState({
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

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      {!imageState.file ? (
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
            JPG, PNG, or GIF up to {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive/80 hover:text-white"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start space-x-3">
            {imageState.preview ? (
              <div className="w-24 h-24 bg-muted rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={imageState.preview} 
                  alt="Thumbnail preview" 
                  className="max-w-full max-h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{imageState.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {imageState.file.type} • {formatFileSize(imageState.file.size)}
              </p>
              
              {imageState.progress > 0 && imageState.progress < 100 && (
                <Progress 
                  value={imageState.progress} 
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