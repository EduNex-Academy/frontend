import { QuizDTO, QuizQuestionDTO, QuizAnswerDTO } from "@/types"
import { apiClient, normalizeUrlPath } from './config'

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
      // Validate ID
      if (!id || isNaN(id) || id <= 0) {
        throw new Error(`Invalid quiz ID: ${id}`)
      }
      
      // Log request details
      console.log(`Quiz API: Fetching quiz with ID ${id}`)
      
      const response = await apiClient.get<QuizDTO>(`/quizzes/${id}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz')
      }
      
      console.log(`Quiz API: Successfully fetched quiz with ID ${id}`)
      return response.data
    } catch (error: any) {
      // Log detailed error
      console.error(`Failed to fetch quiz with ID ${id}:`, error)
      console.error(`Error details:`, {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        } : 'No request'
      })
      
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
      // Validate quiz ID
      if (!quizId || isNaN(quizId) || quizId <= 0) {
        throw new Error(`Invalid quiz ID: ${quizId}`)
      }
      
      // Log request details
      console.log(`Quiz API: Fetching questions for quiz with ID ${quizId}`)
      
      // Log the full URL being used
      const fullUrl = apiClient.defaults.baseURL + `/quiz-questions/quiz/${quizId}`
      console.log(`Quiz API: Full URL for questions request: ${fullUrl}`)
      
      const response = await apiClient.get<QuizQuestionDTO[]>(`/quiz-questions/quiz/${quizId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch quiz questions')
      }
      
      // Check if we received valid data
      if (!response.data || !Array.isArray(response.data)) {
        console.warn(`Quiz API: Received invalid data format for quiz ${quizId}:`, response.data);
        // Return empty array instead of throwing
        return [];
      }
      
      // For each question, fetch the answers if they're not included
      const questions = response.data;
      
      // Process each question to ensure it has answers
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // If answers are missing or empty, fetch them
        if (!question.answers || question.answers.length === 0) {
          console.log(`Quiz API: Question ${question.id} has no answers, fetching them...`);
          try {
            const answers = await apiClient.get<QuizAnswerDTO[]>(`/quiz-answers/question/${question.id}`);
            if (answers.status === 200 && Array.isArray(answers.data)) {
              question.answers = answers.data;
              console.log(`Quiz API: Successfully fetched ${answers.data.length} answers for question ${question.id}`);
            } else {
              console.warn(`Quiz API: Failed to fetch answers for question ${question.id}`);
              question.answers = []; // Set empty array to avoid null/undefined issues
            }
          } catch (error) {
            console.error(`Quiz API: Error fetching answers for question ${question.id}:`, error);
            question.answers = []; // Set empty array to avoid null/undefined issues
          }
        }
      }
      
      console.log(`Quiz API: Successfully fetched ${questions.length} questions for quiz ${quizId}`)
      return questions
    } catch (error: any) {
      // Log detailed error
      console.error(`Failed to fetch questions for quiz with ID ${quizId}:`, error)
      console.error(`Error details:`, {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        } : 'No request'
      })
      
      // If it's a server error (500), provide a more specific message
      if (error.response?.status === 500) {
        console.error('Server error occurred when fetching quiz questions. This could be due to database issues or quiz configuration problems.');
        // Return empty array instead of throwing for 500 errors
        return [];
      }
      
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
  },

  /**
   * Submit a quiz result
   */
  submitQuizResult: async (data: { quizId: number; score: number }): Promise<any> => {
    try {
      // Create a QuizResultDTO object matching the backend's expectations
      const quizResultData = {
        quizId: data.quizId,
        score: data.score,
      }
      
      const response = await apiClient.post(`/quiz-results`, quizResultData)
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to submit quiz result')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to submit result for quiz with ID ${data.quizId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to submit quiz result'
      throw new Error(message)
    }
  }
}
