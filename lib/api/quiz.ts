import { QuizDTO, QuizQuestionDTO, QuizAnswerDTO } from "@/types"
import { apiClient } from './config'

export const quizApi = {
  /**
   * Get all quizzes
   */
  getAllQuizzes: async (): Promise<QuizDTO[]> => {
    try {
      const response = await apiClient.get<QuizDTO[]>('/quizzes')
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quizzes')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quizzes'
      throw new Error(message)
    }
  },

  /**
   * Get quiz by ID
   */
  getQuizById: async (id: number): Promise<QuizDTO> => {
    try {
      const response = await apiClient.get<QuizDTO>(`/quizzes/${id}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch quiz with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quiz'
      throw new Error(message)
    }
  },

  /**
   * Get quizzes by module ID
   */
  getQuizzesByModuleId: async (moduleId: number): Promise<QuizDTO[]> => {
    try {
      const response = await apiClient.get<QuizDTO[]>(`/quizzes/module/${moduleId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch module quizzes')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch quizzes for module with ID ${moduleId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch module quizzes'
      throw new Error(message)
    }
  },

  /**
   * Create a new quiz
   */
  createQuiz: async (quizData: Partial<QuizDTO>): Promise<QuizDTO> => {
    try {
      const response = await apiClient.post<QuizDTO>('/quizzes', quizData)
      
      if (response.status !== 201) {
        throw new Error('Failed to create quiz')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to create quiz:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create quiz'
      throw new Error(message)
    }
  },

  /**
   * Update a quiz
   */
  updateQuiz: async (id: number, quizData: Partial<QuizDTO>): Promise<QuizDTO> => {
    try {
      const response = await apiClient.put<QuizDTO>(`/quizzes/${id}`, quizData)
      
      if (response.status !== 200) {
        throw new Error('Failed to update quiz')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to update quiz with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to update quiz'
      throw new Error(message)
    }
  },

  /**
   * Delete a quiz
   */
  deleteQuiz: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/quizzes/${id}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete quiz')
      }
    } catch (error: any) {
      console.error(`Failed to delete quiz with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete quiz'
      throw new Error(message)
    }
  },

  /**
   * Get all quiz questions
   */
  getAllQuizQuestions: async (): Promise<QuizQuestionDTO[]> => {
    try {
      const response = await apiClient.get<QuizQuestionDTO[]>('/quiz-questions')
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz questions')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch quiz questions:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quiz questions'
      throw new Error(message)
    }
  },

  /**
   * Get quiz question by ID
   */
  getQuizQuestionById: async (id: number): Promise<QuizQuestionDTO> => {
    try {
      const response = await apiClient.get<QuizQuestionDTO>(`/quiz-questions/${id}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz question')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch quiz question with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quiz question'
      throw new Error(message)
    }
  },

  /**
   * Get quiz questions by quiz ID
   */
  getQuizQuestionsByQuizId: async (quizId: number): Promise<QuizQuestionDTO[]> => {
    try {
      const response = await apiClient.get<QuizQuestionDTO[]>(`/quiz-questions/quiz/${quizId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz questions')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch questions for quiz with ID ${quizId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quiz questions'
      throw new Error(message)
    }
  },

  /**
   * Create a new quiz question
   */
  createQuizQuestion: async (questionData: Partial<QuizQuestionDTO>): Promise<QuizQuestionDTO> => {
    try {
      const response = await apiClient.post<QuizQuestionDTO>('/quiz-questions', questionData)
      
      if (response.status !== 201) {
        throw new Error('Failed to create quiz question')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to create quiz question:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create quiz question'
      throw new Error(message)
    }
  },

  /**
   * Update a quiz question
   */
  updateQuizQuestion: async (id: number, questionData: Partial<QuizQuestionDTO>): Promise<QuizQuestionDTO> => {
    try {
      const response = await apiClient.put<QuizQuestionDTO>(`/quiz-questions/${id}`, questionData)
      
      if (response.status !== 200) {
        throw new Error('Failed to update quiz question')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to update quiz question with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to update quiz question'
      throw new Error(message)
    }
  },

  /**
   * Delete a quiz question
   */
  deleteQuizQuestion: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/quiz-questions/${id}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete quiz question')
      }
    } catch (error: any) {
      console.error(`Failed to delete quiz question with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete quiz question'
      throw new Error(message)
    }
  },

  /**
   * Get quiz answers by question ID
   */
  getQuizAnswersByQuestionId: async (questionId: number): Promise<QuizAnswerDTO[]> => {
    try {
      const response = await apiClient.get<QuizAnswerDTO[]>(`/quiz-answers/question/${questionId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz answers')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch answers for question with ID ${questionId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch quiz answers'
      throw new Error(message)
    }
  },

  /**
   * Create a new quiz answer
   */
  createQuizAnswer: async (answerData: Partial<QuizAnswerDTO>): Promise<QuizAnswerDTO> => {
    try {
      const response = await apiClient.post<QuizAnswerDTO>('/quiz-answers', answerData)
      
      if (response.status !== 201) {
        throw new Error('Failed to create quiz answer')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to create quiz answer:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create quiz answer'
      throw new Error(message)
    }
  },

  /**
   * Update a quiz answer
   */
  updateQuizAnswer: async (id: number, answerData: Partial<QuizAnswerDTO>): Promise<QuizAnswerDTO> => {
    try {
      const response = await apiClient.put<QuizAnswerDTO>(`/quiz-answers/${id}`, answerData)
      
      if (response.status !== 200) {
        throw new Error('Failed to update quiz answer')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to update quiz answer with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to update quiz answer'
      throw new Error(message)
    }
  },

  /**
   * Delete a quiz answer
   */
  deleteQuizAnswer: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/quiz-answers/${id}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete quiz answer')
      }
    } catch (error: any) {
      console.error(`Failed to delete quiz answer with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete quiz answer'
      throw new Error(message)
    }
  }
}
