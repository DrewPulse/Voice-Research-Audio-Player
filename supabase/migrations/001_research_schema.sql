-- Research Study Database Schema
-- This migration creates tables for storing research session data, survey responses, and video recordings

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Sessions table - stores research session metadata
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    camera_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Session switches table - stores clip switching behavior
CREATE TABLE IF NOT EXISTS session_switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    clip_id INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    custom_reason TEXT,
    timestamp_ms BIGINT NOT NULL, -- Time from session start in milliseconds
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Survey responses table - stores exit survey data
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    most_preferred VARCHAR(255),
    least_preferred VARCHAR(255),
    fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
    willingness_to_listen_again JSONB, -- Store as JSON object
    discomfort_moments TEXT,
    overall_experience INTEGER CHECK (overall_experience >= 1 AND overall_experience <= 10),
    additional_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Video recordings table - stores metadata about recorded videos
CREATE TABLE IF NOT EXISTS video_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    duration_seconds INTEGER,
    upload_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    storage_path TEXT, -- Path in Supabase storage
    uploaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_participant ON sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_session_switches_session_id ON session_switches(session_id);
CREATE INDEX IF NOT EXISTS idx_session_switches_timestamp ON session_switches(timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_video_recordings_session_id ON video_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_video_recordings_upload_status ON video_recordings(upload_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to sessions table
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_switches" ON session_switches FOR ALL USING (true);
CREATE POLICY "Allow all operations on survey_responses" ON survey_responses FOR ALL USING (true);
CREATE POLICY "Allow all operations on video_recordings" ON video_recordings FOR ALL USING (true);

-- Create a view for session analytics
CREATE VIEW session_analytics AS
SELECT 
    s.id,
    s.participant_id,
    s.session_id,
    s.start_time,
    s.end_time,
    s.duration_minutes,
    s.status,
    s.camera_enabled,
    COUNT(sw.id) as total_switches,
    AVG(sw.timestamp_ms) as avg_switch_time,
    (SELECT COUNT(*) FROM survey_responses sr WHERE sr.session_id = s.id) as has_survey,
    (SELECT COUNT(*) FROM video_recordings vr WHERE vr.session_id = s.id AND vr.upload_status = 'completed') as video_count
FROM sessions s
LEFT JOIN session_switches sw ON s.id = sw.session_id
GROUP BY s.id;

-- Grant permissions to authenticated users
GRANT ALL ON sessions TO authenticated;
GRANT ALL ON session_switches TO authenticated;
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON video_recordings TO authenticated;
GRANT SELECT ON session_analytics TO authenticated;