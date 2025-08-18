import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

interface VideoRecordingConfig {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  maxFileSize?: number; // in bytes
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class VideoRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private sessionId: string | null = null;
  private isRecording: boolean = false;
  private startTime: number = 0;
  private config: VideoRecordingConfig;

  constructor(config: VideoRecordingConfig = {}) {
    this.config = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 1000000, // 1 Mbps
      audioBitsPerSecond: 128000,  // 128 kbps
      maxFileSize: 100 * 1024 * 1024, // 100MB
      ...config
    };
  }

  async startRecording(stream: MediaStream, sessionId: string): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    this.sessionId = sessionId;
    this.recordedChunks = [];
    this.startTime = Date.now();

    try {
      // Check if the preferred mime type is supported
      let mimeType = this.config.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType!)) {
        // Fallback to more compatible format
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
      }

      const options: MediaRecorderOptions = {
        mimeType: mimeType!,
        videoBitsPerSecond: this.config.videoBitsPerSecond,
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      };

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          
          // Check file size limit
          const currentSize = this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
          if (currentSize > this.config.maxFileSize!) {
            console.warn('Recording approaching size limit, consider stopping');
            this.stopRecording();
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.handleRecordingError(event);
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      console.log('Video recording started for session:', sessionId);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start video recording');
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { 
          type: this.mediaRecorder?.mimeType || 'video/webm' 
        });
        
        this.isRecording = false;
        console.log('Recording stopped, blob size:', blob.size);
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  async uploadRecording(
    blob: Blob, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!this.sessionId) {
      return { success: false, error: 'No session ID available' };
    }

    try {
      const fileName = `session_${this.sessionId}_${Date.now()}.webm`;
      const filePath = `recordings/${this.sessionId}/${fileName}`;

      // Create video recording metadata in database
      const { data: videoRecord, error: dbError } = await supabase
        .from('video_recordings')
        .insert({
          session_id: this.sessionId,
          file_name: fileName,
          file_size: blob.size,
          mime_type: blob.type,
          duration_seconds: Math.floor((Date.now() - this.startTime) / 1000),
          upload_status: 'uploading',
          storage_path: filePath
        })
        .select()
        .single();

      if (dbError) {
        console.error('Failed to create video record:', dbError);
        return { success: false, error: 'Failed to create video record' };
      }

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-recordings')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        
        // Update status to failed
        await supabase
          .from('video_recordings')
          .update({ upload_status: 'failed' })
          .eq('id', videoRecord.id);

        return { success: false, error: uploadError.message };
      }

      // Update status to completed
      await supabase
        .from('video_recordings')
        .update({ 
          upload_status: 'completed',
          uploaded_at: new Date().toISOString()
        })
        .eq('id', videoRecord.id);

      console.log('Video uploaded successfully:', uploadData.path);
      return { success: true, filePath: uploadData.path };

    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Upload failed due to network error' };
    }
  }

  async saveRecording(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const blob = await this.stopRecording();
      return await this.uploadRecording(blob);
    } catch (error) {
      console.error('Failed to save recording:', error);
      return { success: false, error: 'Failed to save recording' };
    }
  }

  private handleRecordingError(event: MediaRecorderErrorEvent): void {
    console.error('Recording error:', event.error);
    this.isRecording = false;
    
    // Could emit an event or call a callback here for UI updates
    // this.onError?.(event.error);
  }

  getRecordingStats(): {
    isRecording: boolean;
    duration: number;
    chunksCount: number;
    estimatedSize: number;
  } {
    const currentSize = this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? Date.now() - this.startTime : 0,
      chunksCount: this.recordedChunks.length,
      estimatedSize: currentSize
    };
  }

  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.stopRecording();
    }
    this.recordedChunks = [];
    this.sessionId = null;
  }

  // Static method to check browser support
  static isBrowserSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && 
           (MediaRecorder.isTypeSupported('video/webm') || 
            MediaRecorder.isTypeSupported('video/mp4'));
  }

  // Get supported mime types for video recording
  static getSupportedMimeTypes(): string[] {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4'
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }
}

export { VideoRecordingService };
export type { VideoRecordingConfig, UploadProgress };