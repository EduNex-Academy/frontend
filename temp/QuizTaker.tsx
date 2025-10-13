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
  const [reviewMode, setReviewMode] = useState(false) // New state for review page
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
        } catch (e) {
          console.error('QuizTaker: Failed to fetch quiz data directly:', e)
          
          // If getting a single quiz fails, try getting all quizzes for the module
          console.log('QuizTaker: Trying to fetch quizzes by module ID:', moduleId)
          const quizzes = await quizApi.getQuizzesByModuleId(moduleId)
          console.log('QuizTaker: Quizzes by module ID:', quizzes)
          
          if (!quizzes || quizzes.length === 0) {
            throw new Error('No quiz found for this module')
          }
          
          quizData = quizzes[0]
          console.log('QuizTaker: Using first quiz from module:', quizData)
        }
        
        if (!quizData) {
          throw new Error('Quiz not found')
        }
        
        // If the quiz has no questions, we need to fetch them
        if (!quizData.questions || quizData.questions.length === 0) {
          console.log('QuizTaker: Quiz has no questions, fetching them...')
          try {
            const questions = await quizApi.getQuizQuestionsByQuizId(quizData.id)
            console.log('QuizTaker: Quiz questions fetched:', questions)
            
            if (!questions || questions.length === 0) {
              throw new Error('No questions found for this quiz')
            }
            
            // Add questions to the quiz data
            quizData.questions = questions
          } catch (error) {
            console.error('QuizTaker: Failed to fetch quiz questions:', error)
            throw new Error('Failed to load quiz questions')
          }
        }
        
        console.log('QuizTaker: Setting quiz data:', quizData)
        setQuiz(quizData)
      } catch (error: any) {
        console.error('QuizTaker: Error in fetchQuizData:', error)
        toast({
          title: "Error loading quiz",
          description: error.message || "Failed to load quiz data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizData()
  }, [quizId, moduleId, toast])

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  // Navigate to the next question or enter review mode if it's the last question
  const nextQuestion = () => {
    if (!quiz) return
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // If it's the last question, calculate the score and enter review mode
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
      setReviewMode(true)
    }
  }

  // Navigate to the previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Submit the quiz (only called after review)
  const submitQuiz = async () => {
    if (!quiz) return
    
    setIsSubmitting(true)
    
    try {
      // We already calculated the score in the review mode
      // Just submit the quiz result to the server
      await quizApi.submitQuizResult({
        quizId,
        score,
      })
      
      setSubmitted(true)
      setReviewMode(false)
      
      // Show appropriate message based on score
      if (score >= 75) {
        toast({
          title: "Quiz Passed!",
          description: "You've passed the quiz. You can now mark the module as completed.",
        })
      } else {
        toast({
          title: "Quiz Not Passed",
          description: "Your score has been recorded. You can review your answers and try again to improve your score.",
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
    setReviewMode(false)
    setScore(0)
  }
  
  // Exit review mode and go back to questions
  const exitReviewMode = () => {
    setReviewMode(false)
    setCurrentQuestionIndex(0) // Go back to the first question
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-lg font-semibold text-red-800">Quiz Not Found</h3>
          <p className="text-red-600">
            We couldn't find the quiz you're looking for. Please try again later.
          </p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h3 className="text-lg font-semibold text-amber-800">No Questions</h3>
          <p className="text-amber-600">
            This quiz doesn't have any questions yet. Please check back later.
          </p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
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
                      
                      <div className="w-full">
                        <p className="font-medium">
                          Question {index + 1}: {question.questionText}
                        </p>
                        
                        <div className="mt-2 text-sm space-y-2">
                          {question.answers.map(answer => {
                            const isSelected = answer.id === selectedAnswerId;
                            const isCorrectAnswer = answer.correct;
                            
                            return (
                              <div 
                                key={answer.id}
                                className={`p-2 rounded ${
                                  isSelected && isCorrectAnswer
                                    ? 'bg-green-100 border border-green-300'
                                    : isSelected && !isCorrectAnswer
                                    ? 'bg-red-100 border border-red-300'
                                    : !isSelected && isCorrectAnswer
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected ? (
                                    <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0"></div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"></div>
                                  )}
                                  
                                  <div className="flex-grow">
                                    {answer.answerText}
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    {isCorrectAnswer && (
                                      <Check className="w-4 h-4 text-green-600" />
                                    )}
                                    {isSelected && !isCorrectAnswer && (
                                      <X className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
              <Button onClick={() => onComplete()} className="bg-green-600 hover:bg-green-700">
                Mark as Completed
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  // If in review mode, show the review page
  if (reviewMode) {
    const isPassed = score >= 75
    
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Review</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              {isPassed ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart2 className="w-12 h-12 text-amber-600" />
                </div>
              )}
              
              <h3 className="text-2xl font-bold">
                {isPassed ? "Great Job!" : "Almost There"}
              </h3>
              
              <p className="text-gray-600 mt-2 mb-4">
                {isPassed 
                  ? "You've answered enough questions correctly to pass this quiz." 
                  : "You'll need to answer more questions correctly to pass this quiz (minimum 75%)."}
              </p>
              
              <div className="w-full max-w-sm bg-gray-200 rounded-full h-4 mb-1">
                <div
                  className={`h-4 rounded-full ${isPassed ? 'bg-green-600' : 'bg-amber-600'}`}
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
              <h4 className="font-semibold text-lg">Your Answers:</h4>
              
              {quiz.questions.map((question, index) => {
                const selectedAnswerId = answers[question.id]
                const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
                const isCorrect = selectedAnswer?.correct || false
                
                return (
                  <div 
                    key={question.id} 
                    className={`p-3 rounded-md ${
                      isCorrect ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      
                      <div className="w-full">
                        <p className="font-medium">
                          Question {index + 1}: {question.questionText}
                        </p>
                        
                        <div className="mt-2 text-sm space-y-2">
                          {question.answers.map(answer => {
                            const isSelected = answer.id === selectedAnswerId;
                            const isCorrectAnswer = answer.correct;
                            
                            return (
                              <div 
                                key={answer.id}
                                className={`p-2 rounded ${
                                  isSelected && isCorrectAnswer
                                    ? 'bg-green-100 border border-green-300'
                                    : isSelected && !isCorrectAnswer
                                    ? 'bg-red-100 border border-red-300'
                                    : !isSelected && isCorrectAnswer
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected ? (
                                    <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0"></div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"></div>
                                  )}
                                  
                                  <div className="flex-grow">
                                    {answer.answerText}
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    {isCorrectAnswer && (
                                      <Check className="w-4 h-4 text-green-600" />
                                    )}
                                    {isSelected && !isCorrectAnswer && (
                                      <X className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-3">
            <Button onClick={exitReviewMode} variant="outline">
              Try Again
            </Button>
            
            {isPassed && (
              <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
                Submit Results
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
      <Card className="border border-blue-100">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </CardHeader>
        
        <CardContent>
          <h3 className="font-medium text-lg mb-4">{currentQuestion.questionText}</h3>
          
          <RadioGroup 
            value={answers[currentQuestion.id]?.toString() || ''} 
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.answers.map((answer) => (
              <div 
                key={answer.id} 
                className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
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
              onClick={nextQuestion}
              disabled={!hasAnsweredCurrentQuestion}
            >
              Review Answers
              <ChevronRight className="w-4 h-4 ml-2" />
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
      
      {/* Quiz navigation and progress */}
      <div className="mt-6">
        {/* Quiz navigation dots */}
        <div className="flex justify-center gap-1">
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
        
        {/* Question progress counter */}
        <div className="text-center text-sm text-gray-500 mt-2">
          {Object.keys(answers).length} of {totalQuestions} questions answered
          {Object.keys(answers).length === totalQuestions - 1 && 
           currentQuestionIndex === totalQuestions - 1 && 
           !hasAnsweredCurrentQuestion && 
            " - Answer this question to review your results"}
        </div>
      </div>
    </div>
  )
}