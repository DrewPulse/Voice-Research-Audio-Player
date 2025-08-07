import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use("*", logger(console.log));
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Start a new research session
app.post('/make-server-c94a30c6/sessions', async (c) => {
  try {
    const { participantId, duration } = await c.req.json();
    
    if (!participantId || !duration) {
      return c.json({ error: 'Missing required fields: participantId, duration' }, 400);
    }
    
    const sessionId = `session_${participantId}_${Date.now()}`;
    const sessionData = {
      sessionId,
      participantId,
      startTime: Date.now(),
      duration, // in minutes
      switches: [],
      currentClip: null,
      isComplete: false,
      surveyResponses: null
    };
    
    await kv.set(sessionId, sessionData);
    
    return c.json({ 
      success: true, 
      sessionId,
      message: 'Session started successfully' 
    });
  } catch (error) {
    console.log('Error starting session:', error);
    return c.json({ error: 'Failed to start session' }, 500);
  }
});

// Update session with clip switch
app.post('/make-server-c94a30c6/sessions/:sessionId/switch', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { clipId, reason, customReason, timestamp } = await c.req.json();
    
    if (!sessionId || clipId === undefined || !reason) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    const switchRecord = {
      clipId,
      reason,
      customReason: customReason || null,
      timestamp: timestamp || Date.now(),
      switchTime: Date.now()
    };
    
    sessionData.switches.push(switchRecord);
    sessionData.currentClip = clipId;
    
    await kv.set(sessionId, sessionData);
    
    return c.json({ 
      success: true, 
      message: 'Switch recorded successfully',
      totalSwitches: sessionData.switches.length
    });
  } catch (error) {
    console.log('Error recording switch:', error);
    return c.json({ error: 'Failed to record switch' }, 500);
  }
});

// Complete session with survey responses
app.post('/make-server-c94a30c6/sessions/:sessionId/complete', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { surveyResponses } = await c.req.json();
    
    if (!sessionId || !surveyResponses) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    sessionData.surveyResponses = surveyResponses;
    sessionData.isComplete = true;
    sessionData.completionTime = Date.now();
    sessionData.actualDuration = Math.floor((Date.now() - sessionData.startTime) / 1000 / 60);
    
    await kv.set(sessionId, sessionData);
    
    return c.json({ 
      success: true, 
      message: 'Session completed successfully',
      sessionData: {
        duration: sessionData.actualDuration,
        switches: sessionData.switches.length,
        completed: true
      }
    });
  } catch (error) {
    console.log('Error completing session:', error);
    return c.json({ error: 'Failed to complete session' }, 500);
  }
});

// Get session data
app.get('/make-server-c94a30c6/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Don't return sensitive data in get requests
    const sanitizedData = {
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      duration: sessionData.duration,
      switchCount: sessionData.switches.length,
      currentClip: sessionData.currentClip,
      isComplete: sessionData.isComplete
    };
    
    return c.json({ success: true, data: sanitizedData });
  } catch (error) {
    console.log('Error getting session:', error);
    return c.json({ error: 'Failed to get session' }, 500);
  }
});

// Get research analytics (aggregated data)
app.get('/make-server-c94a30c6/analytics', async (c) => {
  try {
    const sessions = await kv.getByPrefix('session_');
    
    if (!sessions || sessions.length === 0) {
      return c.json({ 
        success: true, 
        data: {
          totalSessions: 0,
          completedSessions: 0,
          averageSwitches: 0,
          commonSwitchReasons: {},
          voicePreferences: {}
        }
      });
    }
    
    const completedSessions = sessions.filter((s: any) => s.isComplete);
    const totalSwitches = sessions.reduce((acc: number, s: any) => acc + (s.switches?.length || 0), 0);
    
    // Analyze switch reasons
    const switchReasons: { [key: string]: number } = {};
    const voicePreferences: { [key: string]: { most: number, least: number } } = {};
    
    sessions.forEach((session: any) => {
      // Count switch reasons
      session.switches?.forEach((sw: any) => {
        switchReasons[sw.reason] = (switchReasons[sw.reason] || 0) + 1;
      });
      
      // Count voice preferences from surveys
      if (session.surveyResponses) {
        const { mostPreferred, leastPreferred } = session.surveyResponses;
        if (mostPreferred) {
          if (!voicePreferences[mostPreferred]) voicePreferences[mostPreferred] = { most: 0, least: 0 };
          voicePreferences[mostPreferred].most++;
        }
        if (leastPreferred) {
          if (!voicePreferences[leastPreferred]) voicePreferences[leastPreferred] = { most: 0, least: 0 };
          voicePreferences[leastPreferred].least++;
        }
      }
    });
    
    return c.json({ 
      success: true, 
      data: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        averageSwitches: sessions.length > 0 ? Math.round(totalSwitches / sessions.length * 10) / 10 : 0,
        commonSwitchReasons: switchReasons,
        voicePreferences: voicePreferences,
        totalSwitches
      }
    });
  } catch (error) {
    console.log('Error getting analytics:', error);
    return c.json({ error: 'Failed to get analytics' }, 500);
  }
});

Deno.serve(app.fetch);