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
import { ModuleDTO } from '@/types'

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
  const [contentUrl, setContentUrl] = useState('')
  const [coinsRequired, setCoinsRequired] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !contentUrl) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const moduleData = {
        title,
        contentUrl,
        coinsRequired,
        courseId,
        type: 'PDF' as const,
        moduleOrder
      }
      
      const createdModule = await moduleApi.createModule(moduleData)
      
      toast({
        title: 'PDF Module Added',
        description: 'Your PDF module has been added successfully.',
      })
      
      onModuleAdded(createdModule)
      
      // Reset form
      setTitle('')
      setContentUrl('')
      setCoinsRequired(0)
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
          
          <div className="space-y-2">
            <Label htmlFor="contentUrl">PDF URL*</Label>
            <Input
              id="contentUrl"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="Enter URL to PDF document"
              required
            />
            <p className="text-sm text-muted-foreground">
              Add a direct link to your PDF document (Google Drive, Dropbox, etc.)
            </p>
          </div>
          
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
