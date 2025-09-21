-- CivicReport Database Schema
-- PostgreSQL 15 with PostGIS extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    firebase_uid VARCHAR(128) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    profile_data JSONB,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_role ON users(role);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_metadata JSONB,
    location POINT NOT NULL,
    address JSONB NOT NULL,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('pothole', 'garbage', 'broken_streetlight', 'damaged_road', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ai_analysis JSONB,
    description TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'analyzed', 'certificate_generated', 'tweeted', 'completed', 'failed')),
    processing_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for reports
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_issue_severity ON reports(issue_type, severity);
CREATE INDEX idx_reports_user_status ON reports(user_id, status);

-- Government officials table
CREATE TABLE government_officials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    twitter_handle VARCHAR(50),
    jurisdiction_boundary POLYGON,
    jurisdiction_level VARCHAR(20) NOT NULL CHECK (jurisdiction_level IN ('ward', 'municipal', 'district', 'state', 'national')),
    photo_url TEXT,
    contact_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for government officials
CREATE INDEX idx_officials_boundary ON government_officials USING GIST(jurisdiction_boundary);
CREATE INDEX idx_officials_level_active ON government_officials(jurisdiction_level, is_active);
CREATE INDEX idx_officials_twitter ON government_officials(twitter_handle);
CREATE INDEX idx_officials_priority ON government_officials(priority DESC);

-- Certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    qr_code_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT TRUE
);

-- Create indexes for certificates
CREATE INDEX idx_certificates_report ON certificates(report_id);
CREATE INDEX idx_certificates_generated ON certificates(generated_at DESC);
CREATE UNIQUE INDEX idx_certificates_report_unique ON certificates(report_id);

-- Social posts table
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram')),
    post_id VARCHAR(100),
    post_url TEXT,
    content TEXT,
    officials_tagged TEXT[],
    posted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'deleted')),
    error_message TEXT,
    engagement_metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for social posts
CREATE INDEX idx_social_posts_report ON social_posts(report_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_posted ON social_posts(posted_at DESC);

-- Processing queue table for tracking async operations
CREATE TABLE processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    queue_name VARCHAR(50) NOT NULL,
    job_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    processing_data JSONB,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for processing queue
CREATE INDEX idx_queue_status ON processing_queue(status);
CREATE INDEX idx_queue_scheduled ON processing_queue(scheduled_at);
CREATE INDEX idx_queue_report ON processing_queue(report_id);
CREATE INDEX idx_queue_priority ON processing_queue(priority DESC);

-- API rate limiting table
CREATE TABLE api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for rate limiting
CREATE INDEX idx_rate_limits_user ON api_rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limits_ip ON api_rate_limits(ip_address, endpoint, window_start);
CREATE INDEX idx_rate_limits_window ON api_rate_limits(window_start);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_officials_updated_at BEFORE UPDATE ON government_officials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON processing_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT)
RETURNS FLOAT AS $$
BEGIN
    RETURN ST_Distance(
        ST_GeogFromText('POINT(' || lng1 || ' ' || lat1 || ')'),
        ST_GeogFromText('POINT(' || lng2 || ' ' || lat2 || ')')
    );
END;
$$ LANGUAGE plpgsql;

-- Function to find officials by location
CREATE OR REPLACE FUNCTION find_officials_by_location(report_lat FLOAT, report_lng FLOAT)
RETURNS TABLE(
    official_id UUID,
    name VARCHAR(255),
    position VARCHAR(100),
    twitter_handle VARCHAR(50),
    jurisdiction_level VARCHAR(20),
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        go.id,
        go.name,
        go.position,
        go.twitter_handle,
        go.jurisdiction_level,
        go.priority
    FROM government_officials go
    WHERE go.is_active = TRUE
    AND (
        go.jurisdiction_boundary IS NULL 
        OR ST_Contains(go.jurisdiction_boundary, ST_Point(report_lng, report_lat))
    )
    ORDER BY 
        go.priority DESC,
        CASE go.jurisdiction_level
            WHEN 'ward' THEN 1
            WHEN 'municipal' THEN 2
            WHEN 'district' THEN 3
            WHEN 'state' THEN 4
            WHEN 'national' THEN 5
        END;
END;
$$ LANGUAGE plpgsql;

-- View for report statistics
CREATE VIEW report_statistics AS
SELECT 
    issue_type,
    severity,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_processing_minutes,
    DATE_TRUNC('day', created_at) as report_date
FROM reports
GROUP BY issue_type, severity, status, DATE_TRUNC('day', created_at);

-- View for user engagement metrics
CREATE VIEW user_engagement_metrics AS
SELECT 
    u.id as user_id,
    u.phone_number,
    COUNT(r.id) as total_reports,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_reports,
    COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as reports_last_30_days,
    MAX(r.created_at) as last_report_date,
    AVG(EXTRACT(EPOCH FROM (r.updated_at - r.created_at))/60) as avg_processing_time_minutes
FROM users u
LEFT JOIN reports r ON u.id = r.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.phone_number;

-- Materialized view for location-based analytics (refresh daily)
CREATE MATERIALIZED VIEW location_analytics AS
SELECT 
    ST_SnapToGrid(location, 0.01) as location_grid,
    issue_type,
    severity,
    COUNT(*) as report_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_processing_minutes,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    MAX(created_at) as latest_report
FROM reports
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY ST_SnapToGrid(location, 0.01), issue_type, severity
HAVING COUNT(*) > 1;

-- Create index for materialized view
CREATE INDEX idx_location_analytics_grid ON location_analytics USING GIST(location_grid);
CREATE INDEX idx_location_analytics_issue ON location_analytics(issue_type, severity);

-- Sample data inserts (for development)
INSERT INTO government_officials (name, position, twitter_handle, jurisdiction_level, priority, contact_info) VALUES
('John Smith', 'Ward Councillor', '@johnsmith_ward', 'ward', 10, '{"email": "john@ward.gov", "phone": "+1234567890"}'),
('Jane Doe', 'Municipal Commissioner', '@janedoe_municipal', 'municipal', 8, '{"email": "jane@municipal.gov", "phone": "+1234567891"}'),
('Robert Johnson', 'District Magistrate', '@robertj_district', 'district', 6, '{"email": "robert@district.gov", "phone": "+1234567892"}'),
('Sarah Williams', 'Transport Minister', '@sarahw_transport', 'state', 4, '{"email": "sarah@state.gov", "phone": "+1234567893"}');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
