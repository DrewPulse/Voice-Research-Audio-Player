import { useState } from 'react';
import { ClipSelector } from './components/ClipSelector';
import { NowPlaying } from './components/NowPlaying';
import { SwitchReasonModal } from './components/SwitchReasonModal';
import { ExitSurvey } from './components/ExitSurvey';
import { SessionTimer } from './components/SessionTimer';
import { ResearchComplete } from './components/ResearchComplete';
import { researchService } from './services/researchService';

export interface AudioClip {
  id: number;
  title: string;
  author: string;
  image: string;
  audioUrl: string;
  voice: string;
}

export interface SwitchReason {
  clipId: number;
  reason: string;
  customReason?: string;
  timestamp: number;
}

export interface SessionData {
  startTime: number;
  duration: number; // in minutes (60 or 120)
  switches: SwitchReason[];
  currentClip: number | null;
  isComplete: boolean;
  sessionId?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'selector' | 'playing' | 'complete'>('setup');
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: 0,
    duration: 60,
    switches: [],
    currentClip: null,
    isComplete: false
  });
  const [currentClip, setCurrentClip] = useState<AudioClip | null>(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioClips: AudioClip[] = [
    { id: 1, title: "After Twenty Years", author: "O. Henry", image: "/placeholder-book-1.jpg", audioUrl: "/audio/clip1.mov", voice: "Voice A" },
    { id: 2, title: "A Scientific Phenomenon", author: "Anonymous", image: "/placeholder-book-2.jpg", audioUrl: "/audio/clip2.mov", voice: "Voice B" },
    { id: 3, title: "The Deportations Delirium of Nineteen Twenty", author: "Post", image: "/placeholder-book-3.jpg", audioUrl: "/audio/clip3.mov", voice: "Voice C" },
    { id: 4, title: "The Heart at Twenty", author: "Alain Locke", image: "/placeholder-book-4.jpg", audioUrl: "/audio/clip4.mov", voice: "Voice D" },
    { id: 5, title: "The Twenty Kroner Story", author: "A.E.W. Mason", image: "/placeholder-book-5.jpg", audioUrl: "/audio/clip5.mov", voice: "Voice E" },
    { id: 6, title: "The Princess with Twenty Petticoats", author: "William Elliott Griffis", image: "/placeholder-book-6.jpg", audioUrl: "/audio/clip6.mov", voice: "Voice F" },
    { id: 7, title: "Twenty Years at Hull House", author: "Jane Addams", image: "/placeholder-book-7.jpg", audioUrl: "/audio/clip7.mov", voice: "Voice G" },
    { id: 8, title: "Twenty Years of Arctic Struggle", author: "John Maclean", image: "/placeholder-book-8.jpg", audioUrl: "/audio/clip8.mov", voice: "Voice H" },
    { id: 9, title: "Twenty-Six and One", author: "Maxim Gorky", image: "/placeholder-book-9.jpg", audioUrl: "/audio/clip9.mov", voice: "Voice I" },
    { id: 10, title: "What Should Be the Master Demand of Twentieth Century Civilization", author: "B.O. Flower", image: "/placeholder-book-10.jpg", audioUrl: "/audio/clip10.mov", voice: "Voice J" }
  ];

  const startSession = async (duration: number) => {
    try {
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { sessionId } = await researchService.startSession(participantId, duration);
      
      setSessionData({
        startTime: Date.now(),
        duration,
        switches: [],
        currentClip: null,
        isComplete: false,
        sessionId
      });
      setCurrentView('selector');
      setError(null);
    } catch (error) {
      console.error('Failed to start session:', error);
      setError('Failed to start research session. Please try again.');
    }
  };

  const selectClip = (clip: AudioClip) => {
    setCurrentClip(clip);
    setSessionData(prev => ({ ...prev, currentClip: clip.id }));
    setCurrentView('playing');
  };

  const handleSwitch = () => {
    // Show the switch reason modal immediately and navigate to selector
    setShowSwitchModal(true);
    setCurrentView('selector');
    
    // If session has ended, show survey after switch modal is handled
    if (sessionEnded) {
      setShowSurvey(true);
    }
  };

  const recordSwitchReason = async (reason: string, customReason?: string) => {
    if (currentClip && sessionData.sessionId) {
      try {
        const switchRecord: SwitchReason = {
          clipId: currentClip.id,
          reason,
          customReason,
          timestamp: Date.now() - sessionData.startTime
        };
        
        await researchService.recordSwitch(
          sessionData.sessionId,
          currentClip.id,
          reason,
          customReason,
          switchRecord.timestamp
        );
        
        setSessionData(prev => ({
          ...prev,
          switches: [...prev.switches, switchRecord]
        }));
        
        setError(null);
      } catch (error) {
        console.error('Failed to record switch reason:', error);
        // Still update local state even if backend fails
        const switchRecord: SwitchReason = {
          clipId: currentClip.id,
          reason,
          customReason,
          timestamp: Date.now() - sessionData.startTime
        };
        setSessionData(prev => ({
          ...prev,
          switches: [...prev.switches, switchRecord]
        }));
      }
    }
    setShowSwitchModal(false);
  };

  const handleSessionEnd = () => {
    setSessionEnded(true);
    // Show survey immediately if user is on selector page, otherwise it will show when they switch
    if (currentView === 'selector') {
      setShowSurvey(true);
    }
  };

  const handleSurveyComplete = async (surveyResponses: any) => {
    try {
      if (sessionData.sessionId) {
        await researchService.completeSession(sessionData.sessionId, surveyResponses);
      }
      
      setSessionData(prev => ({ ...prev, isComplete: true }));
      setShowSurvey(false);
      setCurrentView('complete');
      setError(null);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      setError('Failed to submit survey data, but your responses have been recorded locally.');
      // Still mark as complete locally
      setSessionData(prev => ({ ...prev, isComplete: true }));
      setShowSurvey(false);
      setCurrentView('complete');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setCurrentView('setup');
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice Research Study</h1>
            <p className="text-gray-600">
              Welcome! You'll be listening to audiobook clips with different voice samples. 
              Choose clips naturally as you would when browsing audiobooks.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select your session duration:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startSession(60)}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                1 Hour Session
              </button>
              <button
                onClick={() => startSession(120)}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                2 Hour Session
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Listen to clips naturally and switch when you feel like it</p>
            <p>• You'll be asked why you switched each time</p>
            <p>• Complete a brief survey at the end</p>
            <p>• All responses are collected for research analysis</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'complete') {
    return (
      <ResearchComplete 
        sessionData={sessionData}
        onStartNew={() => {
          setCurrentView('setup');
          setSessionData({
            startTime: 0,
            duration: 60,
            switches: [],
            currentClip: null,
            isComplete: false
          });
          setCurrentClip(null);
          setSessionEnded(false);
          setShowSurvey(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SessionTimer 
        startTime={sessionData.startTime}
        duration={sessionData.duration}
        onSessionEnd={handleSessionEnd}
        isActive={currentView === 'selector' || currentView === 'playing'}
      />
      
      {currentView === 'selector' && (
        <ClipSelector
          clips={audioClips}
          onSelectClip={selectClip}
          currentClip={currentClip}
        />
      )}
      
      {currentView === 'playing' && currentClip && (
        <NowPlaying
          clip={currentClip}
          onSwitch={handleSwitch}
          onBack={() => setCurrentView('selector')}
        />
      )}
      
      <ExitSurvey
        sessionData={sessionData}
        clips={audioClips}
        onComplete={handleSurveyComplete}
        open={showSurvey}
        onOpenChange={setShowSurvey}
      />
      
      {showSwitchModal && (
        <SwitchReasonModal
          onSelectReason={recordSwitchReason}
          onClose={() => setShowSwitchModal(false)}
        />
      )}
    </div>
  );
}