import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);
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
    try {
      // Try the new direct Supabase approach first
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          participant_id: participantId,
          session_id: sessionId,
          duration_minutes: duration,
          status: 'active',
          camera_enabled: false
        })
        .select()
        .single();

      if (error) {
        console.warn('Direct Supabase insert failed, falling back to API:', error);
        // Fallback to the original API approach
        const apiData = await this.makeRequest('/sessions', {
          method: 'POST',
          body: JSON.stringify({ participantId, duration }),
        });
        return { sessionId: apiData.sessionId };
      }

      return { sessionId: data.session_id };
    } catch (error) {
      console.error('Failed to start session with both methods:', error);
      throw error;
    }
  }

  async recordSwitch(
    sessionId: string, 
    clipId: number, 
    reason: string, 
    customReason?: string,
    timestamp?: number
  ): Promise<void> {
    try {
      // Get the session UUID for foreign key relationship
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (session) {
        const { error } = await supabase
          .from('session_switches')
          .insert({
            session_id: session.id,
            clip_id: clipId,
            reason: reason,
            custom_reason: customReason,
            timestamp_ms: timestamp || Date.now()
          });

        if (error) {
          console.warn('Direct Supabase switch record failed, falling back to API:', error);
          throw error;
        }
        return;
      }
    } catch (error) {
      console.warn('Direct Supabase approach failed, using API fallback:', error);
    }

    // Fallback to original API
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
    try {
      // Get the session UUID for foreign key relationship
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (session) {
        // Update session status to completed
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({ 
            status: 'completed',
            end_time: new Date().toISOString()
          })
          .eq('id', session.id);

        if (sessionError) {
          console.warn('Failed to update session status:', sessionError);
        }

        // Insert survey responses
        const { error: surveyError } = await supabase
          .from('survey_responses')
          .insert({
            session_id: session.id,
            most_preferred: surveyResponses.mostPreferred,
            least_preferred: surveyResponses.leastPreferred,
            fatigue_level: surveyResponses.fatigueLevel,
            willingness_to_listen_again: surveyResponses.willingnessToListenAgain,
            discomfort_moments: surveyResponses.discomfortMoments,
            overall_experience: surveyResponses.overallExperience,
            additional_comments: surveyResponses.additionalComments
          });

        if (surveyError) {
          console.warn('Direct Supabase survey insert failed, falling back to API:', surveyError);
          throw surveyError;
        }
        return;
      }
    } catch (error) {
      console.warn('Direct Supabase approach failed, using API fallback:', error);
    }

    // Fallback to original API
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