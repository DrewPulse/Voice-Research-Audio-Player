# Voice Research Audio Player - Technical Feature Specifications

## Application Overview

A React/TypeScript web application for conducting voice preference research with AI vs. Human narrated audiobook content. Participants authenticate via PIN, complete 1-hour listening sessions, and provide behavioral data through natural interaction patterns.

---

## Feature Specifications

### 1. Authentication & Session Management

#### 1.1 PIN Authentication Screen
**Current State**: Auto-generated participant IDs  
**Required Changes**: PIN-based authentication

**UI Components**:
- Landing page with PIN entry field
- Numeric keypad (mobile-optimized)
- Group assignment indicator
- Error handling for invalid PINs

**Technical Requirements**:
```typescript
interface AuthState {
  pin: string;
  participantId: string;
  groupAssignment: 'AI' | 'Human';
  isAuthenticated: boolean;
}
```

**Functionality**:
- 4-6 digit PIN validation
- Automatic group assignment (balance 50 AI / 50 Human)
- Session initialization with participant data
- PIN uniqueness validation
- Local storage backup for session recovery

---

### 1.2 Session Timer Component
**Current Implementation**: SessionTimer.tsx with 60/120 minute options  
**Required Changes**: Fixed 1-hour sessions only

**UI Elements**:
- Prominent countdown display (MM:SS format)
- Visual progress indicator
- Session completion notifications
- Warning at 5-minute mark

**Technical Specifications**:
```typescript
interface SessionTimerProps {
  startTime: number;
  duration: 60; // Fixed at 1 hour
  onSessionEnd: () => void;
  isActive: boolean;
  participantId: string;
}
```

**Features**:
- Persistent timer (survives page refresh)
- Automatic session completion
- Browser notification permissions
- Time zone handling

---

### 2. Content Management System

#### 2.1 Group-Based Clip Libraries
**Current State**: Single library with 10 clips  
**Required Changes**: Two separate libraries (5 AI + 5 Human)

**Data Structure**:
```typescript
interface AudioClip {
  id: number;
  title: string;
  author: string;
  voiceType: 'AI' | 'Human';
  groupId: 'AI' | 'Human';
  audioUrl: string;
  duration: number;
  imageUrl: string;
  storyContent: string; // Same across voice types
}

interface ClipLibrary {
  AI: AudioClip[]; // 5 clips
  Human: AudioClip[]; // 5 clips (same stories, different voices)
}
```

**Content Serving Logic**:
- Participants see only their assigned group's clips
- Same story content with different narrators
- Randomized clip order per participant
- Preloading for smooth switching

---

#### 2.2 Enhanced ClipSelector Component
**Current Implementation**: Lists all 10 clips universally  
**Required Changes**: Group-specific filtering and enhanced UI

**UI Enhancements**:
- Group indicator (subtle "AI Voices" or "Human Voices" header)
- Voice type badges on clip cards
- Enhanced book cover imagery
- Loading states for audio preloading
- Currently playing indicator

**Component Interface**:
```typescript
interface ClipSelectorProps {
  clips: AudioClip[];
  groupType: 'AI' | 'Human';
  onSelectClip: (clip: AudioClip) => void;
  currentClip: AudioClip | null;
  isLoading: boolean;
}
```

**Features**:
- Responsive grid layout (1 column mobile, 2+ tablet/desktop)
- Touch-friendly tap targets (minimum 44px)
- Clip duration display
- Play/pause preview buttons
- Accessibility labels for screen readers

---

### 3. Audio Player System

#### 3.1 Enhanced NowPlaying Component
**Current Implementation**: Basic play/pause with progress bar  
**Required Changes**: Enhanced UX and group-aware features

**UI Improvements**:
- Larger album artwork (optimized for mobile viewing)
- Voice type indicator
- Enhanced progress bar with scrubbing capability
- Volume controls
- Skip forward/backward (15-30 second jumps)
- Playback speed controls (0.75x, 1x, 1.25x, 1.5x)

**Component Interface**:
```typescript
interface NowPlayingProps {
  clip: AudioClip;
  groupType: 'AI' | 'Human';
  onSwitch: () => void;
  onBack: () => void;
  playbackSettings: PlaybackSettings;
}

interface PlaybackSettings {
  volume: number; // 0-100
  playbackRate: number; // 0.75, 1, 1.25, 1.5
  autoPlay: boolean;
}
```

**Enhanced Features**:
- Waveform visualization (optional)
- Background audio (continues when switching views)
- Audio buffering indicators
- Error handling for failed loads
- Keyboard shortcuts (spacebar = play/pause)

---

### 4. Behavioral Data Collection

#### 4.1 Switch Reason Modal (Enhanced)
**Current Implementation**: Basic reason selection  
**Required Changes**: AI vs Human specific reasons and enhanced UX

**UI Improvements**:
- Sliding modal (bottom sheet on mobile)
- Voice type context ("Why did you switch from this AI/Human voice?")
- Enhanced reason categories
- Quick selection buttons
- Character counter for custom responses

**Updated Reasons List**:
```typescript
const switchReasons = {
  voiceQuality: [
    'Voice sounded robotic/artificial',
    'Voice sounded unnatural',
    'Poor pronunciation/emphasis',
    'Voice was too fast/slow',
    'Voice was tiring to listen to'
  ],
  content: [
    'Story wasn\'t interesting',
    'Content was difficult to follow',
    'Already familiar with this story'
  ],
  preference: [
    'Preferred a different voice style',
    'Just wanted variety',
    'Testing different voices'
  ],
  technical: [
    'Audio quality issues',
    'Playback problems'
  ]
};
```

**Data Collection**:
```typescript
interface SwitchEvent {
  participantId: string;
  sessionId: string;
  fromClipId: number;
  fromVoiceType: 'AI' | 'Human';
  timestamp: number;
  listenDuration: number; // seconds
  reason: string;
  reasonCategory: string;
  customReason?: string;
  userAgent: string;
}
```

---

#### 4.2 Exit Survey (AI vs Human Focus)
**Current Implementation**: Generic preference questions  
**Required Changes**: Comparative AI vs Human analysis

**Survey Structure**:
```typescript
interface ExitSurveyResponse {
  participantId: string;
  sessionId: string;
  responses: {
    // Preference Rankings
    preferredVoiceType: 'AI' | 'Human' | 'No preference';
    aiVoiceRating: number; // 1-10 scale
    humanVoiceRating: number; // 1-10 scale
    
    // Comparative Questions
    perceivedDifferences: string[];
    mostNaturalVoice: 'AI' | 'Human' | 'Couldn\'t tell';
    wouldListenToAILong: boolean;
    wouldListenToHumanLong: boolean;
    
    // Experience Metrics
    fatigueLevel: number; // 1-10
    sessionSatisfaction: number; // 1-10
    technicalIssues: string[];
    
    // Open-ended
    additionalComments: string;
    suggestions: string;
  };
}
```

**Survey UI Components**:
- Progress indicator
- Slider controls for ratings
- Multi-select for perceived differences
- Likert scale components
- Text area with character limits
- Skip validation for required fields

---

### 5. Camera Integration System

#### 5.1 Camera Permission & Recording
**Current Implementation**: Basic camera stream  
**Required Changes**: File storage and enhanced monitoring

**Permission Flow**:
```typescript
interface CameraPermissionState {
  granted: boolean;
  stream: MediaStream | null;
  recordingActive: boolean;
  recordingStartTime: number;
  errorState: string | null;
}
```

**UI Components**:
- Permission request modal with clear explanation
- Recording indicator (red dot)
- Camera preview thumbnail (optional)
- Recording status in session timer
- Privacy toggle (pause recording)

**Recording Specifications**:
- Resolution: 640x480 (optimized for mobile)
- Frame rate: 15fps (bandwidth optimization)
- Format: WebM (fallback to MP4)
- File naming: `{participantId}_{sessionTimestamp}_{segment}.webm`
- Max file size: 500MB per session
- Automatic compression

---

#### 5.2 Attention Monitoring (Optional Enhanced Feature)
**Basic Implementation**: Continuous recording  
**Enhanced Features**: 

```typescript
interface AttentionMetrics {
  participantId: string;
  sessionId: string;
  metrics: {
    faceDetectionEvents: number;
    lookAwayEvents: number;
    multitaskingIndicators: number;
    avgAttentionScore: number; // 0-100
    qualityFlags: string[];
  };
}
```

**Features**:
- Face detection API integration
- Look-away time tracking
- Device orientation monitoring
- App focus/blur detection
- Quality scoring for research validity

---

### 6. Data Management & Export

#### 6.1 Real-time Data Sync
**Current Implementation**: Session-end data save  
**Required Changes**: Real-time sync with offline capability

**Data Storage Schema**:
```typescript
interface SessionData {
  participantId: string;
  sessionId: string;
  groupAssignment: 'AI' | 'Human';
  startTime: number;
  endTime: number;
  completionStatus: 'completed' | 'abandoned' | 'technical_failure';
  
  // Audio interaction data
  clipInteractions: ClipInteraction[];
  switchEvents: SwitchEvent[];
  playbackEvents: PlaybackEvent[];
  
  // Survey data
  exitSurvey: ExitSurveyResponse;
  
  // Technical metadata
  deviceInfo: DeviceInfo;
  networkConditions: NetworkInfo[];
  errors: ErrorEvent[];
  
  // Camera data references
  videoRecordings: VideoRecordingReference[];
}
```

**Sync Strategy**:
- Event-based real-time sync (every switch, every 30 seconds)
- Offline queue with retry logic
- Conflict resolution for reconnection
- Data integrity validation
- Compression for mobile networks

---

#### 6.2 CSV Export System
**Required Format**: Multiple CSV files with relational structure

**Export Files**:
1. **participants.csv**
   ```csv
   participant_id,pin,group_assignment,session_start,session_end,completion_status,total_switches,session_duration_minutes
   ```

2. **clip_interactions.csv**
   ```csv
   participant_id,clip_id,clip_title,voice_type,start_time,end_time,listen_duration_seconds,completion_percentage
   ```

3. **switch_events.csv**
   ```csv
   participant_id,switch_id,from_clip_id,from_voice_type,switch_timestamp,listen_duration,reason,reason_category,custom_reason
   ```

4. **survey_responses.csv**
   ```csv
   participant_id,preferred_voice_type,ai_rating,human_rating,perceived_differences,fatigue_level,satisfaction_score,additional_comments
   ```

5. **video_recordings.csv**
   ```csv
   participant_id,recording_file,recording_start,recording_end,file_size_mb,quality_score,attention_metrics
   ```

---

### 7. Administrative Features

#### 7.1 Group Balance Monitoring
**Interface**: Simple dashboard or API endpoint

**Features**:
- Real-time participant count per group
- Automatic group assignment logic
- Override capability for research ops
- Balance warnings and alerts

```typescript
interface GroupBalance {
  aiGroup: {
    assigned: number;
    completed: number;
    abandoned: number;
  };
  humanGroup: {
    assigned: number;
    completed: number;
    abandoned: number;
  };
  nextAssignment: 'AI' | 'Human';
}
```

---

#### 7.2 Data Export Interface
**Implementation**: Simple protected endpoint or admin page

**Features**:
- Date range selection
- Group filtering (AI/Human/Both)
- Export format options (CSV, JSON)
- File compression for large datasets
- Download progress indicators

---

### 8. Technical Architecture

#### 8.1 State Management
**Current**: React useState with local state  
**Enhanced**: Context + useReducer for complex state

```typescript
interface AppState {
  auth: AuthState;
  session: SessionState;
  audio: AudioState;
  camera: CameraState;
  data: DataSyncState;
}
```

#### 8.2 Performance Optimizations
**Requirements**:
- Audio preloading (2-3 clips ahead)
- Image lazy loading and caching
- Component code splitting
- Service worker for offline capability
- Bundle size optimization (<500KB initial)

#### 8.3 Error Handling & Monitoring
**Implementation**:
- Global error boundary
- Automatic error reporting
- User-friendly error messages
- Fallback UI components
- Performance monitoring

---

### 9. Mobile-Specific Features

#### 9.1 PWA Capabilities
**Features**:
- Add to home screen prompt
- Offline functionality
- Background sync
- Push notifications (session reminders)
- Native-like navigation

#### 9.2 Touch Interactions
**Optimizations**:
- Gesture-based navigation (swipe to switch)
- Touch feedback (haptic on compatible devices)
- Optimized tap targets (44px minimum)
- Prevent accidental interactions
- Volume button integration

#### 9.3 Device Integration
**Features**:
- Lock screen media controls
- Background audio handling
- Battery optimization
- Screen wake lock during session
- Orientation lock (portrait preferred)

---

### 10. Testing & Quality Assurance

#### 10.1 Test Coverage Requirements
**Areas**:
- Cross-browser compatibility (iOS Safari, Android Chrome, Desktop Chrome/Firefox)
- Network condition testing (3G, 4G, WiFi)
- Device compatibility (iPhone 8+, Android 8+)
- Audio format compatibility
- Camera functionality across devices

#### 10.2 Performance Benchmarks
**Targets**:
- Initial page load: <3 seconds
- Clip switching: <1 second
- Audio buffering: <2 seconds
- Memory usage: <100MB sustained
- Battery impact: Minimal during 1-hour session

---

## Implementation Priority

### Phase 1: Core Functionality (Week 1-2)
1. PIN authentication system
2. Group assignment logic
3. Enhanced clip library structure
4. Basic camera recording with storage
5. Updated ClipSelector for group filtering

### Phase 2: Enhanced UX (Week 2-3)
1. Improved NowPlaying interface
2. Enhanced SwitchReasonModal
3. Real-time data sync
4. Mobile optimizations

### Phase 3: Survey & Export (Week 3-4)
1. AI vs Human focused exit survey
2. CSV export system
3. Group balance monitoring
4. Final testing and optimization

---

This technical specification provides the detailed feature-level requirements needed to transform your current prototype into a production-ready research application.