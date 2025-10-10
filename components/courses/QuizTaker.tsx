"use client"

import { useState, useEffect } from "react"
import { quizApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { QuizDTO, QuizQuestionDTO, QuizAnswerDTO } from "@/types"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Award,
  BarChart2
} from "lucide-react"

interface QuizTakerProps {
  moduleId: number
  quizId: number
  onComplete: () => void
}

export function QuizTaker({ moduleId, quizId, onComplete }: QuizTakerProps) {
  const [quiz, setQuiz] = useState<QuizDTO | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionId -> answerId
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true)
        
        // Log the quiz ID to debug
        console.log(`QuizTaker: Fetching quiz with ID ${quizId}`)
        
        // First get the quiz
        let quizData;
        try {
          quizData = await quizApi.getQuizById(quizId)
          console.log('QuizTaker: Quiz data fetched successfully:', quizData)
        } catch (error: any) {
          console.error('QuizTaker: Failed to fetch quiz metadata:', error)
          toast({
            title: "Error Loading Quiz",
            description: error.message || "Could not load quiz information. Please try again later.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        
        // Then get all questions for the quiz
        console.log(`QuizTaker: Fetching questions for quiz ${quizId}`)
        let questionsData;
        try {
          questionsData = await quizApi.getQuizQuestionsByQuizId(quizId)
          console.log('QuizTaker: Questions data fetched successfully:', questionsData)
        } catch (error: any) {
          console.error('QuizTaker: Failed to fetch quiz questions:', error)
          // Even if we failed to get questions, we can still show the quiz metadata
          setQuiz({
            ...quizData,
            questions: []
          })
          toast({
            title: "Quiz Questions Unavailable",
            description: "Could not load quiz questions. The server might be experiencing issues.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        
        if (!questionsData || questionsData.length === 0) {
          console.warn('QuizTaker: No questions found for this quiz')
          // Set the quiz with empty questions array
          setQuiz({
            ...quizData,
            questions: []
          })
          return
        }
        
        // For each question, fetch its answers
        console.log('QuizTaker: Fetching answers for each question')
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            try {
              const answers = await quizApi.getQuizAnswersByQuestionId(question.id)
              return { ...question, answers }
            } catch (error) {
              console.error(`QuizTaker: Error fetching answers for question ${question.id}:`, error)
              // Return the question with empty answers if there was an error
              toast({
                title: "Warning",
                description: `Could not load answers for question ${question.id}. Some quiz content may be incomplete.`,
                variant: "default",
              })
              return { ...question, answers: [] }
            }
          })
        )
        
        // Set the complete quiz data
        setQuiz({
          ...quizData,
          questions: questionsWithAnswers
        })
      } catch (error: any) {
        console.error('QuizTaker: Error loading quiz data:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to load quiz data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizData()
  }, [quizId, toast])

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  // Navigate to the next question
  const nextQuestion = () => {
    if (!quiz) return
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Navigate to the previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Submit the quiz
  const submitQuiz = async () => {
    if (!quiz) return
    
    setIsSubmitting(true)
    
    try {
      // Calculate the score
      let correctAnswers = 0
      
      quiz.questions.forEach(question => {
        const selectedAnswerId = answers[question.id]
        if (!selectedAnswerId) return // No answer selected
        
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
        if (selectedAnswer?.correct) {
          correctAnswers++
        }
      })
      
      const totalQuestions = quiz.questions.length
      const scorePercent = Math.round((correctAnswers / totalQuestions) * 100)
      setScore(scorePercent)
      
      // Submit the quiz result
      await quizApi.submitQuizResult({
        quizId,
        score: scorePercent,
      })
      
      setSubmitted(true)
      
      // If the score is at least 75%, mark the module as completed
      if (scorePercent >= 75) {
        onComplete()
      } else {
        toast({
          title: "Quiz Failed",
          description: "You need to score at least 75% to pass this quiz.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Restart the quiz
  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-blue-600">Loading quiz...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-gray-800">Quiz not available</h2>
        <p className="text-gray-600 mt-2">
          We couldn't load this quiz. It might be temporarily unavailable or have been removed.
        </p>
        <p className="text-amber-600 text-sm mt-1">Error: Unable to load quiz data from server</p>
        
        {/* Add a retry button */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry Loading Quiz
        </button>
        
        <div className="mt-6 p-4 border rounded bg-amber-50 border-amber-200 text-left max-w-md mx-auto">
          <h3 className="text-md font-medium mb-2 text-amber-800">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 text-sm text-amber-700">
            <li>Check your internet connection</li>
            <li>There may be a temporary server issue</li>
            <li>Wait a few minutes and try again</li>
            <li>Contact your instructor if the problem persists</li>
          </ul>
        </div>
      </div>
    )
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-gray-800">Quiz content missing</h2>
        <p className="text-gray-600 mt-2">
          This quiz exists but has no questions yet or we encountered an error loading them.
        </p>
        <p className="text-blue-600 text-sm mt-1">Quiz Title: {quiz.title || 'Unnamed Quiz'}</p>
        
        {/* Add a retry button */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry Loading Questions
        </button>
        
        <div className="mt-6 p-4 border rounded bg-blue-50 border-blue-200 text-left max-w-md mx-auto">
          <h3 className="text-md font-medium mb-2 text-blue-800">Possible reasons:</h3>
          <ul className="list-disc pl-5 text-sm text-blue-700">
            <li>The instructor has not added any questions yet</li>
            <li>There was a server error retrieving quiz questions</li>
            <li>There may be an issue with the quiz configuration</li>
            <li>The server may be experiencing a temporary outage</li>
          </ul>
        </div>
      </div>
    )
  }

  // Display the results if submitted
  if (submitted) {
    const isPassed = score >= 75
    
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              {isPassed ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="w-12 h-12 text-red-600" />
                </div>
              )}
              
              <h3 className="text-2xl font-bold">
                {isPassed ? "Congratulations!" : "Not Passed"}
              </h3>
              
              <p className="text-gray-600 mt-2 mb-4">
                {isPassed 
                  ? "You've passed the quiz and completed this module." 
                  : "You'll need to score at least 75% to pass this quiz."}
              </p>
              
              <div className="w-full max-w-sm bg-gray-200 rounded-full h-4 mb-1">
                <div
                  className={`h-4 rounded-full ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <span className="font-bold text-2xl">{score}%</span>
                <p className="text-sm text-gray-600">
                  {Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length} correct
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Question Summary:</h4>
              
              {quiz.questions.map((question, index) => {
                const selectedAnswerId = answers[question.id]
                const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
                const isCorrect = selectedAnswer?.correct || false
                
                return (
                  <div 
                    key={question.id} 
                    className={`p-3 rounded-md ${
                      isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">
                          Question {index + 1}: {question.questionText}
                        </p>
                        
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Your answer:</p>
                          <p>{selectedAnswer?.answerText || "Not answered"}</p>
                          
                          {!isCorrect && (
                            <>
                              <p className="font-medium mt-2">Correct answer:</p>
                              <p>
                                {question.answers.find(a => a.correct)?.answerText || "No correct answer provided"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-3">
            <Button onClick={restartQuiz} variant="outline">
              Retake Quiz
            </Button>
            
            {isPassed && (
              <Button onClick={() => onComplete()}>
                Continue to Next Module
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Active quiz display
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const hasAnsweredCurrentQuestion = answers[currentQuestion.id] !== undefined
  const totalQuestions = quiz.questions.length
  const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quiz progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question card */}
      <Card className="border border-blue-100">
        <CardHeader>
          <CardTitle>
            <span className="text-blue-600">Question {currentQuestionIndex + 1}: </span>
            {currentQuestion.questionText}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value: string) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.answers.map((answer) => (
              <div
                key={answer.id}
                className="flex items-center space-x-2 border border-gray-200 rounded-md p-3 hover:bg-gray-50"
              >
                <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                  {answer.answerText}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting || !Object.keys(answers).length || Object.keys(answers).length < totalQuestions}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={!hasAnsweredCurrentQuestion}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Quiz navigation dots */}
      <div className="flex justify-center mt-6 gap-1">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-2.5 h-2.5 rounded-full ${
              index === currentQuestionIndex
                ? "bg-blue-600"
                : answers[quiz.questions[index].id] !== undefined
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Question counter and submit button */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          {Object.keys(answers).length} of {totalQuestions} questions answered
        </div>
        
        {Object.keys(answers).length === totalQuestions && currentQuestionIndex !== totalQuestions - 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(totalQuestions - 1)}
          >
            Go to Submit
          </Button>
        )}
      </div>
    </div>
  )
}