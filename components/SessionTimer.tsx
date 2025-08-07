import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  startTime: number;
  duration: number; // in minutes
  onSessionEnd: () => void;
  isActive: boolean;
}

export function SessionTimer({ startTime, duration, onSessionEnd, isActive }: SessionTimerProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      const elapsed = Math.floor((now - startTime) / 1000 / 60); // elapsed minutes
      if (elapsed >= duration) {
        onSessionEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onSessionEnd, isActive]);

  if (!isActive || startTime === 0) return null;

  const elapsed = Math.floor((currentTime - startTime) / 1000 / 60); // elapsed minutes
  const remaining = Math.max(0, duration - elapsed);
  const remainingHours = Math.floor(remaining / 60);
  const remainingMinutes = remaining % 60;

  const progress = (elapsed / duration) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-3 py-2 z-40 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {remainingHours > 0 ? `${remainingHours}h ` : ''}{remainingMinutes}m left
              </span>
            </div>
            <button
              onClick={onSessionEnd}
              className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              End Now
            </button>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Session Time Remaining: {remainingHours > 0 ? `${remainingHours}h ` : ''}{remainingMinutes}m
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            <button
              onClick={onSessionEnd}
              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              End Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}