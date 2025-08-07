import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { AudioClip } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NowPlayingProps {
  clip: AudioClip;
  onSwitch: () => void;
  onBack: () => void;
}

export function NowPlaying({ clip, onSwitch }: NowPlayingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  // Reset audio when clip changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset playback state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    // Load new audio
    audio.load();
  }, [clip.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // const seek = (time: number) => {
  //   const audio = audioRef.current;
  //   if (!audio) return;
  //   audio.currentTime = time;
  //   setCurrentTime(time);
  // };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="flex flex-col h-full">
        {/* Header with proper spacing for SessionTimer */}
        <div className="bg-white w-full pt-16 sm:pt-20">
          <div className="flex items-center justify-center px-4 py-4">
            <h1 className="text-lg font-bold text-gray-800 text-center">
              Now Playing
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white flex-1 w-full">
          <div className="flex flex-col gap-6 px-4 py-3 w-full">
            {/* Album Art */}
            <div className="w-full">
              <div className="flex items-center justify-center px-0 py-7 w-full">
                <div className="w-64 h-64 rounded-lg overflow-hidden bg-gray-200">
                  <ImageWithFallback
                    src={clipImages[clip.id - 1]}
                    alt={clip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="w-full">
              <div className="flex flex-col items-center justify-start w-full">
                <div className="flex flex-col items-center justify-start overflow-hidden w-full">
                  <h2 className="text-gray-800 text-xl font-bold text-center overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
                    {clip.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="w-full">
              <div className="flex items-center justify-center py-1 w-full">
                <button
                  onClick={togglePlay}
                  className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex flex-col gap-3 px-4 py-4 w-full">
            <div className="bg-gray-200 rounded w-full h-2 relative">
              <div className="flex flex-col items-start justify-start w-full">
                <div 
                  className="bg-gray-800 h-2 rounded transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          <div className="flex items-start justify-center w-full">
            <div className="px-4 py-3">
              <button
                onClick={onSwitch}
                className="bg-gray-100 h-12 rounded-lg flex items-center justify-center px-8 hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-800 text-base font-bold overflow-ellipsis overflow-hidden whitespace-nowrap">
                  Switch Clip
                </span>
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={clip.audioUrl}
        preload="metadata"
      />
    </div>
  );
}