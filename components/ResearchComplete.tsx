import { useState, useEffect } from 'react';
import { CheckCircle, BarChart3, Clock, RotateCcw } from 'lucide-react';
import { SessionData } from '../App';
import { researchService } from '../services/researchService';

interface ResearchCompleteProps {
  sessionData: SessionData;
  onStartNew: () => void;
}

interface AnalyticsData {
  totalSessions: number;
  completedSessions: number;
  averageSwitches: number;
  commonSwitchReasons: { [key: string]: number };
  voicePreferences: { [key: string]: { most: number, least: number } };
  totalSwitches: number;
}

export function ResearchComplete({ sessionData, onStartNew }: ResearchCompleteProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(false);

  const actualDuration = Math.floor((Date.now() - sessionData.startTime) / 1000 / 60);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await researchService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAnalytics && !analytics) {
      loadAnalytics();
    }
  }, [showAnalytics, analytics]);

  const topSwitchReasons = analytics ? 
    Object.entries(analytics.commonSwitchReasons)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) : [];

  const topVoicePreferences = analytics ?
    Object.entries(analytics.voicePreferences)
      .sort(([,a], [,b]) => b.most - a.most)
      .slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Completion Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h1>
            <p className="text-gray-600">Thank you for participating in our voice research study.</p>
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Session Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{actualDuration} minutes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-500">Clips Switched</div>
                <div className="font-medium">{sessionData.switches.length} times</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-500">Final Clip</div>
                <div className="font-medium">Clip {sessionData.currentClip || 'None'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Analytics Toggle */}
        <div className="border border-gray-200 rounded-lg p-4">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="font-medium text-gray-800">View Research Insights</span>
            <span className="text-sm text-gray-500">
              {showAnalytics ? 'Hide' : 'Show'} aggregate data from all participants
            </span>
          </button>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading research insights...</div>
              </div>
            ) : analytics ? (
              <>
                {/* Overall Statistics */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Overall Research Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalSessions}</div>
                      <div className="text-sm text-gray-600">Total Sessions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{analytics.completedSessions}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{analytics.averageSwitches}</div>
                      <div className="text-sm text-gray-600">Avg Switches</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{analytics.totalSwitches}</div>
                      <div className="text-sm text-gray-600">Total Switches</div>
                    </div>
                  </div>
                </div>

                {/* Switch Reasons */}
                {topSwitchReasons.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Most Common Switch Reasons</h3>
                    <div className="space-y-3">
                      {topSwitchReasons.map(([reason, count], index) => (
                        <div key={reason} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{reason}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-600">{count} times</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Preferences */}
                {topVoicePreferences.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Most Preferred Voices</h3>
                    <div className="space-y-3">
                      {topVoicePreferences.map(([voice, prefs], index) => (
                        <div key={voice} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                              index === 0 ? 'bg-green-500' : index === 1 ? 'bg-green-400' : 'bg-green-300'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{voice}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-600">{prefs.most} preferences</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">No analytics data available yet.</div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onStartNew}
            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Start New Session
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Refresh Application
          </button>
        </div>

        {/* Research Note */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Your anonymous research data helps improve voice technology for audiobooks and accessibility.
          </p>
        </div>
      </div>
    </div>
  );
}