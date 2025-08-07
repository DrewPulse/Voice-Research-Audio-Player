import { AudioClip } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
// import imgDepth3Frame0 from "../imports/StitchDesign.tsx";

interface ClipSelectorProps {
  clips: AudioClip[];
  onSelectClip: (clip: AudioClip) => void;
  currentClip: AudioClip | null;
}

export function ClipSelector({ clips, onSelectClip, currentClip }: ClipSelectorProps) {
  const clipImages = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop", 
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1576872381149-7847515ce5d8?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=300&fit=crop"
  ];

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="flex flex-col h-full">
        {/* Header with proper spacing for SessionTimer */}
        <div className="bg-white w-full pt-16 sm:pt-20">
          <div className="flex items-center justify-center px-4 py-4 relative">
            <h1 className="text-lg font-bold text-gray-800 text-center">
              Audiobook Clips
            </h1>
          </div>
        </div>

        {/* Clips List */}
        <div className="flex-1 w-full">
          <div className="flex flex-col w-full">
            {clips.map((clip, index) => (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip)}
                className={`bg-white min-h-[72px] w-full cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentClip?.id === clip.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center min-h-[72px] w-full">
                  <div className="flex gap-4 items-center justify-start min-h-[72px] px-4 py-2 w-full">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <ImageWithFallback 
                        src={clipImages[index]}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col items-start justify-center">
                        <h3 className="text-gray-800 text-base font-medium leading-6 truncate w-full">
                          {clip.title}
                        </h3>
                        <p className="text-gray-500 text-sm font-normal leading-5">
                          Clip {clip.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}