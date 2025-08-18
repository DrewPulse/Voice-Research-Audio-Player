import { useEffect, useRef, useState } from 'react';
import { X, Video, Eye, EyeOff, VideoOff } from 'lucide-react';

interface FloatingCameraVideoProps {
  stream: MediaStream | null;
  onClose: () => void;
  onStop: () => void;
  onHiddenChange?: (isHidden: boolean) => void;
}

export function FloatingCameraVideo({ stream, onClose, onStop, onHiddenChange }: FloatingCameraVideoProps) {
  const [isHidden, setIsHidden] = useState(true);

  const toggleHidden = (hidden: boolean) => {
    setIsHidden(hidden);
    onHiddenChange?.(hidden);
    
    // When showing video, ensure stream is applied
    if (!hidden && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Ensure video stream is applied when becoming visible
  useEffect(() => {
    if (!isHidden && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isHidden, stream]);

  if (!stream) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-600 relative">
      {/* Minimized state - just controls */}
      {isHidden ? (
        <div className="p-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs">Recording</span>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => toggleHidden(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs"
              title="Show camera"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={onStop}
              className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
              title="Stop recording"
            >
              <VideoOff className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded state - video + controls */
        <div className="relative group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-20 h-15 object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video like a selfie
          />
          
          {/* Controls overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <button
                onClick={() => toggleHidden(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs"
                title="Hide camera"
              >
                <EyeOff className="w-2 h-2" />
              </button>
              <button
                onClick={onStop}
                className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                title="Stop recording"
              >
                <VideoOff className="w-2 h-2" />
              </button>
            </div>
          </div>
          
          {/* Recording indicator */}
          <div className="absolute top-1 left-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}