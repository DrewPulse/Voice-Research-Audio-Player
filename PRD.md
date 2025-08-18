# Voice Research Audio Player - Product Requirements Document

## TL;DR
A mobile-responsive web application for collecting voice preference data comparing AI-generated vs. human-read audiobook content. 100 participants complete 1-hour listening sessions, naturally switching between clips while providing behavioral data and feedback through camera monitoring and exit surveys.

## 1. Goals & Objectives

**Business Goals**
- Deliver high-quality voice preference data comparing AI vs. human narration
- Collect behavioral switching patterns and preference rankings for voice synthesis research
- Generate clean, exportable dataset for customer analysis

**User Goals**
- Complete engaging 1-hour audiobook listening sessions without technical friction
- Provide authentic feedback about voice preferences in natural listening environment
- Experience seamless authentication and session flow

**Success Metrics**
- 95%+ session completion rate (full 1-hour sessions)
- Balanced data collection across both AI and Human voice groups
- High-quality switch behavior data with detailed reasons
- Complete survey responses from all participants
- Camera footage captured for attention monitoring

## 2. Problem Statement & Context

**Current State**
Research into AI vs. human voice preferences in audiobook content lacks authentic behavioral data captured during natural listening experiences over extended periods.

**Why Now?**
- AI voice synthesis technology requires validation against human narration preferences
- Extended session data provides insights into listener fatigue and preference evolution
- Controlled group comparison enables statistical analysis of voice type preferences

**Expected Outcome**
Comparative dataset showing natural voice switching behaviors, preference patterns, and qualitative feedback between AI-generated and human-narrated audiobook content.

## 3. Target Users & Use Cases

**Primary Users**
- Research participants (100 audiobook listeners, split into AI and Human voice groups)
- Research operations team (session management and data export)

**User Stories**
- As a participant, I want to authenticate easily with a PIN code, so that I can start my session quickly
- As a participant, I want to listen to audiobook clips naturally on my phone, so that my behavior reflects real usage
- As a participant, I want to switch clips when I lose interest, so that I can explore content freely
- As a research ops member, I want balanced participant distribution, so that each group has equal representation

**Use Cases & Scenarios**

**Use Case 1: Session Authentication and Start**
Participant receives PIN code → enters PIN in web app → assigned to AI or Human group → begins 1-hour session → camera starts recording

**Use Case 2: Natural Listening with Group-Specific Content**
Participant sees 5 clips from their assigned group (AI or Human) → selects clip → listens naturally → switches with reason → continues for full hour → completes survey

## 4. Scope Overview

**In Scope**
- **Two Voice Groups**: 50 participants each for AI-generated and Human-narrated content
- **Group-Specific Clip Libraries**: 5 clips per group (same content, different voice types)
- **PIN Code Authentication**: Simple numeric PIN for participant identification
- **Group Assignment Logic**: Automatic balanced assignment to AI/Human groups
- **Camera Recording Storage**: Full session video recording with file storage
- **Mobile-Responsive Interface**: Optimized for smartphone usage
- **1-Hour Session Management**: Fixed 60-minute sessions with completion tracking
- **Switch Tracking**: Detailed reasons for each clip change with timestamps
- **Exit Survey**: Preference rankings and experience feedback
- **CSV Data Export**: Structured export for analysis

**Out of Scope**
- Real-time session monitoring dashboard
- Multi-session support per participant
- Advanced analytics interface
- Desktop optimization (mobile-first only)
- Custom authentication beyond PIN codes

## 5. User Experience & Key Features

**Core Features**
✅ **PIN Authentication** – Simple numeric PIN entry for participant identification and group assignment
✅ **Group-Based Content** – Participants see only clips from their assigned voice group (AI or Human)
✅ **Mobile Audio Player** – Touch-friendly clip selection and playback controls
✅ **Camera Recording** – Continuous front-facing camera recording throughout session
✅ **Switch Reason Capture** – Modal interface for recording why participants changed clips
✅ **Session Timer** – Prominent 1-hour countdown with automatic completion
✅ **Exit Survey** – Comparative preference questions and experience feedback
✅ **Data Export** – CSV format with all session data, switches, and survey responses

**User Flow**
PIN entry → Group assignment → Session start → Camera permission → Clip library (AI or Human) → Natural listening → Switch with reason → Continue for 1 hour → Exit survey → Completion

**Key Interactions**
- PIN code entry on landing page
- Tap to select clips from group-specific library
- Swipe/tap to switch during playbook
- Modal reason selection for each switch
- Survey completion with preference rankings

## 6. Functional Requirements

**Must Have (P0)**
- PIN code authentication with participant identification
- Automatic balanced assignment to AI or Human voice groups (50 participants each)
- Group-specific clip libraries (5 clips per group, same content different voices)
- 1-hour session timer with automatic completion
- Continuous camera recording with file storage
- Switch reason capture for every clip change
- Exit survey with AI vs. Human preference questions
- CSV data export with all session and participant data
- Mobile-responsive design optimized for phones

**Should Have (P1)**
- Session recovery if browser crashes
- Group assignment tracking to maintain balance
- Camera recording quality optimization for mobile
- Audio preloading for smooth switching
- Real-time data persistence

**Could Have (P2)**
- PIN validation against participant database
- Basic session monitoring for research ops
- Participant feedback on technical issues

**Won't Have (This Release)**
- UUID-based authentication (PIN only for now)
- Real-time researcher monitoring
- Advanced analytics dashboard
- Multi-session support per participant

## 7. Technical Considerations

**Architecture Overview**
React/TypeScript frontend with Vite build system, Supabase backend for data persistence, mobile-first responsive design, integrated camera recording with file storage.

**Key Technical Requirements**
- PIN-based participant authentication and group assignment
- Two separate clip libraries (AI group: 5 clips, Human group: 5 clips)
- Camera access, recording, and file storage throughout session
- Real-time data synchronization with offline fallback
- CSV export generation with participant, session, switch, and survey data
- Group balance tracking to ensure 50/50 distribution

**Dependencies**
- **External Dependencies**: Supabase for data storage, camera recording storage, audio hosting infrastructure
- **Technical Dependencies**: React 18, TypeScript, Radix UI, Tailwind CSS, camera recording libraries

**Integration Points**
- Supabase Functions API for data storage and group assignment
- Camera recording API with file storage
- Audio file serving for AI and Human clip libraries
- CSV export pipeline with formatted data structure

**Performance & Scalability**
- Support 100 participants total (sessions likely staggered)
- Camera recording optimization for mobile storage and upload
- Audio preloading for smooth clip switching
- Group assignment logic to maintain balance

**Security & Compliance**
- PIN-based authentication only
- Camera recording with participant consent
- Participant data linked only to PIN/group assignment
- Data encryption in transit and at rest

## 8. Data Structure & Export

**Participant Data**
```csv
participant_id,group_assignment,pin_code,session_start,session_end,session_duration,completion_status
```

**Session Switch Data**
```csv
participant_id,clip_id,clip_title,voice_type,switch_timestamp,switch_reason,custom_reason,listen_duration
```

**Survey Response Data**
```csv
participant_id,preferred_voice_type,ai_voice_rating,human_voice_rating,fatigue_level,willingness_to_listen_again,overall_experience,additional_comments
```

**Camera Recording Files**
- File naming: `{participant_id}_{session_timestamp}.mp4`
- Storage location linked in participant data
- Recording duration matches session length

## 9. User Roles & Permissions

| Role | Permissions | Capabilities |
|------|-------------|--------------|
| Participant | Session access via PIN | Complete 1-hour session, switch clips, submit survey |
| Research Ops | Data export and monitoring | Download CSV exports, monitor completion rates, manage group balance |

## 10. Workflows & Processes

**Workflow 1: Session Completion**
1. Participant enters provided PIN code
2. System assigns to AI or Human group (balancing to 50 each)
3. Camera permission requested and granted
4. Recording starts, 1-hour session timer begins
5. Participant sees 5 clips from assigned group
6. Natural listening with switches and reason capture
7. Timer completes, exit survey triggered
8. Survey includes AI vs. Human preference questions
9. Session data and camera recording saved
10. Participant marked as complete

**Workflow 2: Data Export**
1. Research ops accesses export interface
2. Generates comprehensive CSV files:
   - Participant overview (group assignment, completion status)
   - Switch event data (timestamps, reasons, clip details)
   - Survey responses (preferences, ratings, feedback)
   - Camera recording file locations
3. Data delivered for analysis

**Edge Cases**
- **Uneven group assignment**: System tracks and prioritizes group with fewer participants
- **Camera recording failure**: Session continues with warning flag in data
- **Network interruption**: Auto-recovery with session state restoration
- **PIN code conflicts**: Unique PIN generation with validation

## 11. Technical Implementation Requirements

**Authentication System**
- PIN code entry interface
- Participant ID generation linked to PIN
- Group assignment algorithm (balance 50 AI / 50 Human)
- Session state management

**Content Management**
- Two clip libraries: AI voice group (5 clips), Human voice group (5 clips)
- Same story content, different narrator types
- Group-based content serving logic
- Audio file optimization for mobile

**Camera Integration**
- Continuous recording throughout session
- File storage with participant ID naming
- Quality optimization for mobile devices
- Recording permission handling

**Data Collection**
- Real-time session data sync
- Switch event tracking with timestamps
- Survey response collection
- CSV export generation

## 12. Success Criteria

**Quantitative Metrics**
- 100 participants complete full 1-hour sessions
- 50 participants assigned to each voice group
- <5% technical failure rate
- 100% survey completion rate
- Camera recordings captured for >90% of sessions

**Qualitative Metrics**
- Clean, analyzable data export
- Meaningful switch reason data
- Comprehensive preference feedback
- No participant authentication issues

## 13. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Unbalanced group assignment | High | Low | Real-time group tracking, assignment algorithm |
| Camera storage/upload failures | Medium | Medium | Local backup, retry logic, failure flagging |
| PIN code management complexity | Medium | Low | Simple unique generation, conflict resolution |
| Mobile browser camera issues | High | Medium | Extensive device testing, fallback options |
| Data export format requirements | Medium | Medium | Flexible CSV structure, early format confirmation |

---

## Implementation Notes

**Current Codebase Alignment**
Your existing code handles 10 clips with single voice types. Key changes needed:
- Modify clip library structure for 2 groups of 5 clips each
- Add group assignment logic on session start
- Update ClipSelector to show group-specific clips
- Enhance camera recording to store files (currently just streams)
- Add PIN authentication instead of auto-generated participant IDs
- Update survey questions for AI vs. Human comparison
- Modify data export to include group assignment and voice type data

**Priority Implementation Order**
1. PIN authentication system and group assignment
2. Dual clip library structure (AI/Human groups)
3. Camera recording file storage
4. Group-specific UI and content serving
5. Updated survey with voice type questions
6. CSV export with new data structure

This PRD focuses on the tool requirements while incorporating the study design needs for the AI vs. Human voice comparison research.