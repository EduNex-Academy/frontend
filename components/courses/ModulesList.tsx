import React, { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, ArrowUpDown, ExternalLink, FileText, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ModuleDTO } from '@/types'
import { moduleApi } from '@/lib/api'
import { ContentViewer } from './ContentViewer'

interface ModulesListProps {
  modules: ModuleDTO[]
  refreshModules: () => Promise<void>
}

export const ModulesList: React.FC<ModulesListProps> = ({ modules, refreshModules }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [selectedModule, setSelectedModule] = useState<ModuleDTO | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const { toast } = useToast()
  
  const handleDelete = async (moduleId: number) => {
    if (confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        await moduleApi.deleteModule(moduleId)
        
        toast({
          title: 'Module deleted',
          description: 'The module has been deleted successfully.',
        })
        
        refreshModules()
      } catch (error: any) {
        toast({
          title: 'Error deleting module',
          description: error.message || 'Failed to delete module.',
          variant: 'destructive',
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }
  
  const moveModule = async (moduleId: number, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    
    // Ensure new order is within bounds
    if (newOrder < 1 || newOrder > modules.length) {
      return
    }
    
    setIsReordering(true)
    try {
      await moduleApi.reorderModule(moduleId, newOrder)
      
      toast({
        title: 'Module reordered',
        description: 'The module order has been updated.',
      })
      
      refreshModules()
    } catch (error: any) {
      toast({
        title: 'Error reordering module',
        description: error.message || 'Failed to reorder module.',
        variant: 'destructive',
      })
    } finally {
      setIsReordering(false)
    }
  }
  
  const getModuleTypeBadge = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Badge className="bg-blue-500">Video</Badge>
      case 'PDF':
        return <Badge className="bg-red-500">PDF</Badge>
      case 'QUIZ':
        return <Badge className="bg-green-500">Quiz</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }
  
  if (modules.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <p>No modules added yet. Create your first module below.</p>
      </div>
    )
  }
  
  const getContentViewIcon = (module: ModuleDTO) => {
    if (!module.contentCloudFrontUrl && !module.contentUrl) {
      return null;
    }
    
    switch (module.type) {
      case 'VIDEO':
        return <Play className="h-4 w-4" />;
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const handleViewContent = (module: ModuleDTO) => {
    // Check if the module has a content URL
    const contentUrl = module.contentCloudFrontUrl || module.contentUrl;
    
    if (contentUrl) {
      setSelectedModule(module);
      setIsViewerOpen(true);
    } else {
      toast({
        title: 'No content available',
        description: 'This module has no viewable content.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Coins</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="mr-2">{module.moduleOrder}</span>
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={module.moduleOrder === 1 || isReordering}
                      onClick={() => moveModule(module.id, module.moduleOrder, 'up')}
                    >
                      <ArrowUpDown className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={module.moduleOrder === modules.length || isReordering}
                      onClick={() => moveModule(module.id, module.moduleOrder, 'down')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span>{module.title}</span>
                  {(module.contentCloudFrontUrl || module.contentUrl) && (
                    <span className="ml-1 text-xs text-blue-500">
                      {module.contentCloudFrontUrl ? '(CloudFront)' : '(URL)'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getModuleTypeBadge(module.type)}</TableCell>
              <TableCell className="text-right">{module.coinsRequired}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {(module.contentCloudFrontUrl || module.contentUrl) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-500"
                      onClick={() => handleViewContent(module)}
                      title="View content"
                    >
                      {getContentViewIcon(module)}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    disabled={isDeleting}
                    onClick={() => handleDelete(module.id)}
                    title="Delete module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Content Viewer Dialog */}
      <ContentViewer
        module={selectedModule}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};