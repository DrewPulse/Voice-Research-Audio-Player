import { useState, useRef } from "react";
import { AudioClip, SessionData } from "../App";
import { Play, Pause } from "lucide-react";

interface ExitSurveyProps {
  sessionData: SessionData;
  clips: AudioClip[];
  onComplete: (responses: SurveyResponse) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ExitSurvey({
  sessionData,
  clips,
  onComplete,
  open,
}: ExitSurveyProps) {
  const [responses, setResponses] = useState<SurveyResponse>({
    mostPreferred: "",
    leastPreferred: "",
    fatigueLevel: 5,
    willingnessToListenAgain: {},
    discomfortMoments: "",
    overallExperience: 5,
    additionalComments: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [playingClip, setPlayingClip] = useState<number | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  const clipImages = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop", 
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576872381149-7847515ce5d8?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop"
  ];

  // Get clips that were actually listened to during the session
  const getListenedClips = () => {
    const listenedClipIds = new Set<number>();
    
    // Add clips from switches (clips they switched away from)
    sessionData.switches.forEach(switchData => {
      listenedClipIds.add(switchData.clipId);
    });
    
    // Add current clip if exists (clip they ended on)
    if (sessionData.currentClip) {
      listenedClipIds.add(sessionData.currentClip);
    }
    
    // Return clips that were listened to
    return clips.filter(clip => listenedClipIds.has(clip.id));
  };

  const listenedClips = getListenedClips();

  const updateResponse = (
    key: keyof SurveyResponse,
    value: any,
  ) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const updateWillingness = (
    voice: string,
    willing: boolean,
  ) => {
    setResponses((prev) => ({
      ...prev,
      willingnessToListenAgain: {
        ...prev.willingnessToListenAgain,
        [voice]: willing,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(responses);
  };

  const playPreview = (clipId: number) => {
    // Stop any currently playing audio
    if (playingClip && audioRefs.current[playingClip]) {
      audioRefs.current[playingClip].pause();
      audioRefs.current[playingClip].currentTime = 0;
    }

    const audio = audioRefs.current[clipId];
    if (!audio) return;

    setPlayingClip(clipId);
    audio.currentTime = 0; // Start from beginning
    audio.play();

    // Stop after 5 seconds
    setTimeout(() => {
      if (audioRefs.current[clipId]) {
        audioRefs.current[clipId].pause();
        audioRefs.current[clipId].currentTime = 0;
        setPlayingClip(null);
      }
    }, 5000);

    // Also stop if audio ends naturally
    const handleEnd = () => {
      setPlayingClip(null);
      audio.removeEventListener('ended', handleEnd);
    };
    audio.addEventListener('ended', handleEnd);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return responses.mostPreferred !== "";
      case 2:
        return responses.leastPreferred !== "";
      case 3:
        return true; // Fatigue level has default
      case 4:
      case 5:
        return true; // Willingness questions are optional
      case 6:
        return true; // Text fields are optional
      case 7:
        return true; // Final step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Most Preferred Voice
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Which voice did you prefer most? *
              </label>
              <div className="space-y-2">
                {listenedClips.map((clip) => {
                  const index = clips.findIndex(c => c.id === clip.id);
                  return (
                    <label
                      key={clip.id}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="mostPreferred"
                        value={clip.voice}
                        checked={responses.mostPreferred === clip.voice}
                        onChange={() => updateResponse("mostPreferred", clip.voice)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <img
                        src={clipImages[index]}
                        alt={clip.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {clip.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {clip.voice}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          playPreview(clip.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0"
                      >
                        {playingClip === clip.id ? (
                          <Pause className="w-4 h-4 text-blue-700" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-700 ml-0.5" />
                        )}
                      </button>
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[clip.id] = el;
                        }}
                        src={clip.audioUrl}
                        preload="metadata"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Least Preferred Voice
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Which voice did you like least? *
              </label>
              <div className="space-y-2">
                {listenedClips.map((clip) => {
                  const index = clips.findIndex(c => c.id === clip.id);
                  return (
                    <label
                      key={clip.id}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="leastPreferred"
                        value={clip.voice}
                        checked={responses.leastPreferred === clip.voice}
                        onChange={() => updateResponse("leastPreferred", clip.voice)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <img
                        src={clipImages[index]}
                        alt={clip.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {clip.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {clip.voice}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          playPreview(clip.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0"
                      >
                        {playingClip === clip.id ? (
                          <Pause className="w-4 h-4 text-blue-700" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-700 ml-0.5" />
                        )}
                      </button>
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[clip.id] = el;
                        }}
                        src={clip.audioUrl}
                        preload="metadata"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Fatigue Assessment
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-4">
                How fatigued do you feel after this listening
                session?
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={responses.fatigueLevel}
                  onChange={(e) =>
                    updateResponse(
                      "fatigueLevel",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Not fatigued at all (1)</span>
                  <span className="font-medium">
                    Current: {responses.fatigueLevel}
                  </span>
                  <span>Extremely fatigued (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        const firstHalf = listenedClips.slice(0, Math.ceil(listenedClips.length / 2));
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Willingness to Listen Again
            </h2>
            <p className="text-gray-600">
              For each voice you heard, would you be willing to
              listen to it again?
            </p>

            <div className="space-y-3">
              {firstHalf.map((clip) => {
                const originalIndex = clips.findIndex(c => c.id === clip.id);
                return (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <img
                        src={clipImages[originalIndex]}
                        alt={clip.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {clip.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {clip.voice}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          playPreview(clip.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0"
                      >
                        {playingClip === clip.id ? (
                          <Pause className="w-4 h-4 text-blue-700" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-700 ml-0.5" />
                        )}
                      </button>
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[clip.id] = el;
                        }}
                        src={clip.audioUrl}
                        preload="metadata"
                      />
                    </div>
                    <div className="flex gap-4 ml-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`willing-${clip.voice}`}
                          checked={
                            responses.willingnessToListenAgain[
                              clip.voice
                            ] === true
                          }
                          onChange={() =>
                            updateWillingness(clip.voice, true)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`willing-${clip.voice}`}
                          checked={
                            responses.willingnessToListenAgain[
                              clip.voice
                            ] === false
                          }
                          onChange={() =>
                            updateWillingness(clip.voice, false)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        const secondHalf = listenedClips.slice(Math.ceil(listenedClips.length / 2));
        if (secondHalf.length === 0) {
          // Skip this step if there are no clips in the second half
          nextStep();
          return null;
        }
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Willingness to Listen Again (Continued)
            </h2>

            <div className="space-y-3">
              {secondHalf.map((clip) => {
                const originalIndex = clips.findIndex(c => c.id === clip.id);
                return (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <img
                        src={clipImages[originalIndex]}
                        alt={clip.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {clip.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {clip.voice}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          playPreview(clip.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex-shrink-0"
                      >
                        {playingClip === clip.id ? (
                          <Pause className="w-4 h-4 text-blue-700" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-700 ml-0.5" />
                        )}
                      </button>
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[clip.id] = el;
                        }}
                        src={clip.audioUrl}
                        preload="metadata"
                      />
                    </div>
                    <div className="flex gap-4 ml-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`willing-${clip.voice}`}
                          checked={
                            responses.willingnessToListenAgain[
                              clip.voice
                            ] === true
                          }
                          onChange={() =>
                            updateWillingness(clip.voice, true)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`willing-${clip.voice}`}
                          checked={
                            responses.willingnessToListenAgain[
                              clip.voice
                            ] === false
                          }
                          onChange={() =>
                            updateWillingness(clip.voice, false)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Discomfort and Experience
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Did you experience any discomfort or annoyance?
                Please describe any specific moments:
              </label>
              <textarea
                value={responses.discomfortMoments}
                onChange={(e) =>
                  updateResponse(
                    "discomfortMoments",
                    e.target.value,
                  )
                }
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="Describe any moments of discomfort, annoyance, or specific issues you noticed..."
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-4">
                How would you rate your overall experience?
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={responses.overallExperience}
                  onChange={(e) =>
                    updateResponse(
                      "overallExperience",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Very poor (1)</span>
                  <span className="font-medium">
                    Current: {responses.overallExperience}
                  </span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Additional Comments
            </h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Any additional thoughts or feedback about the
                voice samples or listening experience?
              </label>
              <textarea
                value={responses.additionalComments}
                onChange={(e) =>
                  updateResponse(
                    "additionalComments",
                    e.target.value,
                  )
                }
                rows={5}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="Share any additional thoughts, suggestions, or observations..."
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">
                Session Summary
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • Duration:{" "}
                  {Math.floor(
                    (Date.now() - sessionData.startTime) /
                      1000 /
                      60,
                  )}{" "}
                  minutes
                </p>
                <p>
                  • Clips switched:{" "}
                  {sessionData.switches.length} times
                </p>
                <p>
                  • Current clip:{" "}
                  {sessionData.currentClip
                    ? `Clip ${sessionData.currentClip}`
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
      <div 
        className="bg-white w-full max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl sm:max-w-lg sm:max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Exit Survey
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 py-4 bg-gray-50 flex-shrink-0">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i + 1 <= currentStep
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Survey Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              canProceed()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentStep === totalSteps
              ? "Complete Survey"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}