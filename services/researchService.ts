import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c94a30c6`;

interface SessionData {
  sessionId: string;
  participantId: string;
  startTime: number;
  duration: number;
  switches: SwitchRecord[];
  currentClip: number | null;
  isComplete: boolean;
  surveyResponses?: any;
}

interface SwitchRecord {
  clipId: number;
  reason: string;
  customReason?: string;
  timestamp: number;
}

interface SurveyResponse {
  mostPreferred: string;
  leastPreferred: string;
  fatigueLevel: number;
  willingnessToListenAgain: { [key: string]: boolean };
  discomfortMoments: string;
  overallExperience: number;
  additionalComments: string;
}

class ResearchService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Research service request failed:', error);
      throw error;
    }
  }

  async startSession(participantId: string, duration: number): Promise<{ sessionId: string }> {
    const data = await this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({ participantId, duration }),
    });
    
    return { sessionId: data.sessionId };
  }

  async recordSwitch(
    sessionId: string, 
    clipId: number, 
    reason: string, 
    customReason?: string,
    timestamp?: number
  ): Promise<void> {
    await this.makeRequest(`/sessions/${sessionId}/switch`, {
      method: 'POST',
      body: JSON.stringify({ 
        clipId, 
        reason, 
        customReason, 
        timestamp: timestamp || Date.now() 
      }),
    });
  }

  async completeSession(sessionId: string, surveyResponses: SurveyResponse): Promise<void> {
    await this.makeRequest(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ surveyResponses }),
    });
  }

  async getSessionData(sessionId: string): Promise<any> {
    const data = await this.makeRequest(`/sessions/${sessionId}`);
    return data.data;
  }

  async getAnalytics(): Promise<any> {
    const data = await this.makeRequest('/analytics');
    return data.data;
  }
}

export const researchService = new ResearchService();
export type { SessionData, SwitchRecord, SurveyResponse };