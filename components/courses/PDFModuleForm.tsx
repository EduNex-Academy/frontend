import React, { useState } from 'react'
import { 
  Card,
  CardContent 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { moduleApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ModuleDTO, FileDTO } from '@/types'
import { FileUpload } from '@/components/ui/file-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle } from 'lucide-react'

interface PDFModuleFormProps {
  courseId: number
  onModuleAdded: (module: ModuleDTO) => void
  moduleOrder: number
}

export const PDFModuleForm: React.FC<PDFModuleFormProps> = ({
  courseId,
  onModuleAdded,
  moduleOrder
}) => {
  const [title, setTitle] = useState('')
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload')
  const [contentUrl, setContentUrl] = useState('')
  const [coinsRequired, setCoinsRequired] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileState, setFileState] = useState<{
    file: File | null
    preview: string | null
    progress: number
  }>({
    file: null,
    preview: null,
    progress: 0
  })
  const [fileError, setFileError] = useState<string | null>(null)

  const { toast } = useToast()

  const handleFileChange = (file: File | null) => {
    setFileError(null)
    // Additional validation if needed
    if (file && file.type !== 'application/pdf') {
      setFileError('Please upload a valid PDF file.')
      return
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title) {
      toast({
        title: 'Missing title',
        description: 'Please provide a title for the module.',
        variant: 'destructive',
      })
      return
    }
    
    // Validate based on upload method
    if (uploadMethod === 'upload' && !fileState.file) {
      setFileError('Please upload a PDF file.')
      toast({
        title: 'Missing PDF file',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      })
      return
    }
    
    if (uploadMethod === 'url' && !contentUrl) {
      toast({
        title: 'Missing URL',
        description: 'Please provide a PDF URL.',
        variant: 'destructive',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let createdModule: ModuleDTO

      // Create module first with empty content URL
      const moduleData = {
        title,
        contentUrl: uploadMethod === 'url' ? contentUrl : '',
        coinsRequired,
        courseId,
        type: 'PDF' as const,
        moduleOrder
      }
      
      createdModule = await moduleApi.createModule(moduleData)
      
      // If uploading a file, handle the upload after module creation
      if (uploadMethod === 'upload' && fileState.file) {
        setFileState(prev => ({ ...prev, progress: 10 }))
        
        try {
          // Upload the file
          const fileDTO = await moduleApi.uploadModuleContent(createdModule.id, fileState.file)
          setFileState(prev => ({ ...prev, progress: 100 }))
          
          // Update module with the cloud front URL
          createdModule = {
            ...createdModule,
            contentUrl: fileDTO.objectKey,
            contentCloudFrontUrl: fileDTO.url
          }
        } catch (uploadError: any) {
          // Handle upload error but don't abort - the module is already created
          console.error('File upload failed:', uploadError)
          toast({
            title: 'Upload failed',
            description: 'Module was created but file upload failed. You can upload the file later.',
            variant: 'destructive',
          })
        }
      }
      
      toast({
        title: 'PDF Module Added',
        description: 'Your PDF module has been added successfully.',
      })
      
      onModuleAdded(createdModule)
      
      // Reset form
      setTitle('')
      setContentUrl('')
      setCoinsRequired(0)
      setFileState({
        file: null,
        preview: null,
        progress: 0
      })
      
    } catch (error: any) {
      toast({
        title: 'Error adding module',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Module Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title"
              required
            />
          </div>
          
          <Tabs defaultValue="upload" onValueChange={(val) => setUploadMethod(val as 'upload' | 'url')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="upload">Upload PDF</TabsTrigger>
              <TabsTrigger value="url">PDF URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4 pt-2">
              <FileUpload
                id="pdf-upload"
                label="Upload PDF File*"
                accept="application/pdf"
                maxSize={50} // 50MB max for PDFs
                onChange={handleFileChange}
                error={fileError || undefined}
                fileState={fileState}
                setFileState={setFileState}
              />
              
              {/* PDF format guidance */}
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">File requirements:</p>
                  <p className="text-muted-foreground">PDF format only (max 50MB)</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="contentUrl">PDF URL*</Label>
                <Input
                  id="contentUrl"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="Enter URL to PDF document"
                />
                <p className="text-sm text-muted-foreground">
                  Add a direct link to your PDF document (Google Drive, Dropbox, etc.)
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="coinsRequired">Coins Required</Label>
            <Input
              id="coinsRequired"
              type="number"
              min="0"
              value={coinsRequired}
              onChange={(e) => setCoinsRequired(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Number of coins required to access this module (0 for free)
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Module...' : 'Add PDF Module'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
