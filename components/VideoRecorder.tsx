import { useState, useEffect, useRef } from 'react';
import { VideoRecordingService } from '../services/videoRecordingService';

interface VideoRecorderProps {
  stream: MediaStream | null;
  sessionId: string | null;
  isSessionActive: boolean;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onUploadComplete?: (success: boolean, filePath?: string) => void;
  onError?: (error: string) => void;
}

interface RecordingStats {
  isRecording: boolean;
  duration: number;
  fileSize: number;
  status: 'idle' | 'recording' | 'stopping' | 'uploading' | 'complete' | 'error';
}

export function VideoRecorder({
  stream,
  sessionId,
  isSessionActive,
  onRecordingStart,
  onRecordingStop,
  onUploadComplete,
  onError
}: VideoRecorderProps) {
  const [stats, setStats] = useState<RecordingStats>({
    isRecording: false,
    duration: 0,
    fileSize: 0,
    status: 'idle'
  });
  
  const videoRecorderRef = useRef<VideoRecordingService | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video recorder
  useEffect(() => {
    if (!videoRecorderRef.current) {
      videoRecorderRef.current = new VideoRecordingService({
        videoBitsPerSecond: 1000000, // 1 Mbps for good quality
        audioBitsPerSecond: 128000,  // 128 kbps audio
        maxFileSize: 100 * 1024 * 1024 // 100MB limit
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (videoRecorderRef.current) {
        videoRecorderRef.current.cleanup();
      }
    };
  }, []);

  // Auto-start recording when session becomes active
  useEffect(() => {
    if (isSessionActive && stream && sessionId && !stats.isRecording) {
      startRecording();
    } else if (!isSessionActive && stats.isRecording) {
      stopAndUploadRecording();
    }
  }, [isSessionActive, stream, sessionId]);

  // Update stats periodically while recording
  useEffect(() => {
    if (stats.isRecording && videoRecorderRef.current) {
      intervalRef.current = setInterval(() => {
        const currentStats = videoRecorderRef.current!.getRecordingStats();
        setStats(prev => ({
          ...prev,
          duration: currentStats.duration,
          fileSize: currentStats.estimatedSize
        }));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stats.isRecording]);

  const startRecording = async () => {
    if (!stream || !sessionId || !videoRecorderRef.current) {
      const error = 'Cannot start recording: missing stream, session ID, or recorder';
      console.error(error);
      onError?.(error);
      return;
    }

    try {
      setStats(prev => ({ ...prev, status: 'recording' }));
      await videoRecorderRef.current.startRecording(stream, sessionId);
      
      setStats(prev => ({ 
        ...prev, 
        isRecording: true, 
        status: 'recording',
        duration: 0,
        fileSize: 0
      }));
      
      onRecordingStart?.();
      console.log('Video recording started');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      console.error('Recording start failed:', error);
      setStats(prev => ({ ...prev, status: 'error' }));
      onError?.(errorMsg);
    }
  };

  const stopAndUploadRecording = async () => {
    if (!videoRecorderRef.current || !stats.isRecording) {
      return;
    }

    try {
      setStats(prev => ({ ...prev, status: 'stopping' }));
      onRecordingStop?.();

      // Stop recording and get the blob
      const blob = await videoRecorderRef.current.stopRecording();
      
      setStats(prev => ({ 
        ...prev, 
        isRecording: false, 
        status: 'uploading',
        fileSize: blob.size
      }));

      // Upload the recording
      const result = await videoRecorderRef.current.uploadRecording(blob);
      
      if (result.success) {
        setStats(prev => ({ ...prev, status: 'complete' }));
        onUploadComplete?.(true, result.filePath);
        console.log('Recording uploaded successfully');
      } else {
        setStats(prev => ({ ...prev, status: 'error' }));
        onUploadComplete?.(false);
        onError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to stop/upload recording';
      console.error('Recording stop/upload failed:', error);
      setStats(prev => ({ ...prev, status: 'error' }));
      onError?.(errorMsg);
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'recording': return 'text-red-500';
      case 'uploading': return 'text-blue-500';
      case 'complete': return 'text-green-500';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'idle': return 'Ready';
      case 'recording': return 'Recording';
      case 'stopping': return 'Stopping...';
      case 'uploading': return 'Uploading...';
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  // Don't render if browser doesn't support recording
  if (!VideoRecordingService.isBrowserSupported()) {
    return (
      <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
        Video recording not supported in this browser
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${stats.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium">Video Recording</span>
        </div>
        <span className={`text-xs font-medium ${getStatusColor(stats.status)}`}>
          {getStatusText(stats.status)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <div className="font-medium">Duration</div>
          <div className="text-gray-800">{formatDuration(stats.duration)}</div>
        </div>
        <div>
          <div className="font-medium">File Size</div>
          <div className="text-gray-800">{formatFileSize(stats.fileSize)}</div>
        </div>
      </div>

      {stats.status === 'error' && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          Recording error occurred. Please check console for details.
        </div>
      )}

      {stats.status === 'complete' && (
        <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
          ✓ Recording uploaded successfully
        </div>
      )}
    </div>
  );
}