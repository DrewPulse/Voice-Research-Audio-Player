import { useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface CameraPermissionModalProps {
  onPermissionGranted: (stream: MediaStream) => void;
  onPermissionDenied: () => void;
  onClose: () => void;
}

export function CameraPermissionModal({ onPermissionGranted, onPermissionDenied, onClose }: CameraPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCameraAccess = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      onPermissionGranted(stream);
      onClose();
    } catch (err) {
      console.error('Camera access denied:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied. You can continue without video recording.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Unable to access camera. Please check your browser settings.');
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const continueWithoutCamera = () => {
    onPermissionDenied();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
      <div 
        className="bg-white w-full max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl sm:max-w-md sm:max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-100">
          <Camera className="w-5 h-5 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            Enable Camera Recording
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                <strong>Research Enhancement:</strong> As part of this research study, 
                we need to record your session using your front-facing camera.
              </p>
              <p>
                Capturing your full experience helps researchers better understand participant 
                engagement and reactions to different voice samples.
              </p>
              <p>
                The video will only be used for research purposes and will be handled 
                according to our privacy guidelines.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={requestCameraAccess}
              disabled={isRequesting}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                isRequesting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {isRequesting ? 'Requesting Access...' : 'Enable Camera'}
            </button>
            <button
              onClick={continueWithoutCamera}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-gray-500 hover:bg-gray-600 text-white shadow-sm"
            >
              Continue Without
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}