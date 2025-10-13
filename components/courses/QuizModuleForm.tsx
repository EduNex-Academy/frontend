import React, { useState } from 'react'
import { 
  Card,
  CardContent 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, Trash2, X } from 'lucide-react'
import { moduleApi, quizApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ModuleDTO, QuizDTO } from '@/types'

interface QuizModuleFormProps {
  courseId: number
  onModuleAdded: (module: ModuleDTO) => void
  moduleOrder: number
}

interface Question {
  questionText: string
  answers: Answer[]
}

interface Answer {
  answerText: string
  isCorrect: boolean // Keep as isCorrect for internal usage, but map to correct when sending to API
}

export const QuizModuleForm: React.FC<QuizModuleFormProps> = ({
  courseId,
  onModuleAdded,
  moduleOrder
}) => {
  const [title, setTitle] = useState('')
  const [coinsRequired, setCoinsRequired] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    { 
      questionText: '', 
      answers: [
        { answerText: '', isCorrect: true },
        { answerText: '', isCorrect: false }
      ] 
    }
  ])

  const { toast } = useToast()

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { 
        questionText: '', 
        answers: [
          { answerText: '', isCorrect: true },
          { answerText: '', isCorrect: false }
        ] 
      }
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    } else {
      toast({
        title: 'Cannot remove question',
        description: 'Quiz must have at least one question.',
        variant: 'destructive',
      })
    }
  }

  const handleQuestionTextChange = (index: number, text: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].questionText = text
    setQuestions(updatedQuestions)
  }

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers.push({ answerText: '', isCorrect: false })
    setQuestions(updatedQuestions)
  }

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions]
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers.filter((_, i) => i !== answerIndex)
      setQuestions(updatedQuestions)
    } else {
      toast({
        title: 'Cannot remove answer',
        description: 'Each question must have at least two answers.',
        variant: 'destructive',
      })
    }
  }

  const handleAnswerTextChange = (questionIndex: number, answerIndex: number, text: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers[answerIndex].answerText = text
    setQuestions(updatedQuestions)
  }

  const handleCorrectAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions]
    // First, set all answers for this question to false
    updatedQuestions[questionIndex].answers.forEach((answer, i) => {
      answer.isCorrect = i === answerIndex
    })
    setQuestions(updatedQuestions)
  }

  const validateQuiz = (): boolean => {
    // Check if title is empty
    if (!title.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a title for the quiz.',
        variant: 'destructive',
      })
      return false
    }
    
    // Validate all questions and answers
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      
      // Check if question text is empty
      if (!question.questionText.trim()) {
        toast({
          title: 'Empty question',
          description: `Question ${i + 1} has no text.`,
          variant: 'destructive',
        })
        return false
      }
      
      // Check answers
      let hasCorrectAnswer = false
      for (let j = 0; j < question.answers.length; j++) {
        const answer = question.answers[j]
        
        // Check if answer text is empty
        if (!answer.answerText.trim()) {
          toast({
            title: 'Empty answer',
            description: `Answer ${j + 1} for question ${i + 1} has no text.`,
            variant: 'destructive',
          })
          return false
        }
        
        if (answer.isCorrect) {
          hasCorrectAnswer = true
        }
      }
      
      // Check if question has a correct answer marked
      if (!hasCorrectAnswer) {
        toast({
          title: 'No correct answer',
          description: `Question ${i + 1} has no correct answer marked.`,
          variant: 'destructive',
        })
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateQuiz()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Step 1: Create the module first
      const moduleData = {
        title,
        contentUrl: '', // Will be updated after quiz is created
        coinsRequired,
        courseId,
        type: 'QUIZ' as const,
        moduleOrder
      }
      
      const createdModule = await moduleApi.createModule(moduleData)
      
      // Step 2: Create the quiz
      const quizData = {
        title,
        moduleId: createdModule.id,
      } as Partial<QuizDTO>
      
      const createdQuiz = await quizApi.createQuiz(quizData)
      
      // Step 3: Create questions and answers
      for (const question of questions) {
        const questionData = {
          questionText: question.questionText,
          quizId: createdQuiz.id,
        }
        
        const createdQuestion = await quizApi.createQuizQuestion(questionData)
        
        // Create answers for this question
        for (const answer of question.answers) {
          await quizApi.createQuizAnswer({
            answerText: answer.answerText,
            correct: answer.isCorrect,
            questionId: createdQuestion.id
          })
        }
      }
      
      // Step 4: Update the module with the quiz ID
      await moduleApi.updateModule(createdModule.id, {
        ...createdModule,
        quizId: createdQuiz.id,
        contentUrl: `/quizzes/${createdQuiz.id}`
      })
      
      toast({
        title: 'Quiz Module Added',
        description: 'Your quiz module has been added successfully.',
      })
      
      // Update the module in the parent component
      createdModule.quizId = createdQuiz.id
      onModuleAdded(createdModule)
      
      // Reset form
      setTitle('')
      setCoinsRequired(0)
      setQuestions([
        { 
          questionText: '', 
          answers: [
            { answerText: '', isCorrect: true },
            { answerText: '', isCorrect: false }
          ] 
        }
      ])
    } catch (error: any) {
      toast({
        title: 'Error adding quiz module',
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              required
            />
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
              Number of coins required to access this quiz (0 for free)
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addQuestion}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Question {qIndex + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Question Text*</Label>
                  <Input
                    value={question.questionText}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    placeholder="Enter question text"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Answers</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addAnswer(qIndex)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Answer
                    </Button>
                  </div>
                  
                  {question.answers.map((answer, aIndex) => (
                    <div key={aIndex} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          value={answer.answerText}
                          onChange={(e) => handleAnswerTextChange(qIndex, aIndex, e.target.value)}
                          placeholder={`Answer option ${aIndex + 1}`}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`correct-${qIndex}-${aIndex}`}
                            name={`correct-${qIndex}`}
                            checked={answer.isCorrect}
                            onChange={() => handleCorrectAnswerChange(qIndex, aIndex)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`correct-${qIndex}-${aIndex}`} className="text-sm">
                            Correct
                          </Label>
                        </div>
                        {question.answers.length > 2 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeAnswer(qIndex, aIndex)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Quiz Module...' : 'Add Quiz Module'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
