import apiClient from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MedicalChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface MedicalChatResponse {
  reply: string;
  disclaimer: string;
  timestamp: string;
}

export const chatService = {
  async sendMessage(message: string, history: ChatMessage[] = []): Promise<MedicalChatResponse> {
    try {
      const response = await apiClient.post<MedicalChatResponse>('/chat', {
        message,
        history,
      });
      return response.data;
    } catch (error) {
      // If error occurs, fallback response to keep user experience smooth
      console.error('Medical chat request failed:', error);
      throw error;
    }
  },
};

export default chatService;
