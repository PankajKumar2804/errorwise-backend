-- Migration: Create Support System Tables (Feedback, Contact, Help Center)
-- Date: 2024-11-01
-- Description: Creates tables to store user feedback, contact messages, and help center tickets

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('feature_request', 'bug_report', 'general_feedback', 'improvement_suggestion')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'addressed', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    admin_notes TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Indexes for Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON Feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON Feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON Feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON Feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON Feedback(user_email);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ContactMessages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'sales', 'support', 'partnership', 'enterprise')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(255),
    reply_text TEXT,
    replied_at TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ContactMessages
CREATE INDEX IF NOT EXISTS idx_contact_user_id ON ContactMessages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_email ON ContactMessages(email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON ContactMessages(status);
CREATE INDEX IF NOT EXISTS idx_contact_type ON ContactMessages(message_type);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON ContactMessages(created_at DESC);

-- ============================================
-- HELP CENTER TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS HelpCenterTickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'getting_started', 
        'api_integration', 
        'billing_subscriptions', 
        'troubleshooting', 
        'security_privacy', 
        'account_management',
        'technical_issue',
        'feature_request',
        'other'
    )),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- Indexes for HelpCenterTickets
CREATE INDEX IF NOT EXISTS idx_help_ticket_number ON HelpCenterTickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_help_user_id ON HelpCenterTickets(user_id);
CREATE INDEX IF NOT EXISTS idx_help_email ON HelpCenterTickets(user_email);
CREATE INDEX IF NOT EXISTS idx_help_category ON HelpCenterTickets(category);
CREATE INDEX IF NOT EXISTS idx_help_status ON HelpCenterTickets(status);
CREATE INDEX IF NOT EXISTS idx_help_created_at ON HelpCenterTickets(created_at DESC);

-- ============================================
-- HELP CENTER TICKET RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS HelpCenterTicketResponses (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES HelpCenterTickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    responder_email VARCHAR(255) NOT NULL,
    responder_name VARCHAR(255),
    is_staff BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for HelpCenterTicketResponses
CREATE INDEX IF NOT EXISTS idx_help_response_ticket ON HelpCenterTicketResponses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_help_response_created ON HelpCenterTicketResponses(created_at DESC);

-- ============================================
-- HELP CENTER ARTICLES (For FAQ/Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS HelpCenterArticles (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    author_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    meta_description TEXT,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Indexes for HelpCenterArticles
CREATE INDEX IF NOT EXISTS idx_help_article_category ON HelpCenterArticles(category);
CREATE INDEX IF NOT EXISTS idx_help_article_published ON HelpCenterArticles(is_published);
CREATE INDEX IF NOT EXISTS idx_help_article_slug ON HelpCenterArticles(slug);
CREATE INDEX IF NOT EXISTS idx_help_article_tags ON HelpCenterArticles USING GIN(tags);

-- ============================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON Feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON ContactMessages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_ticket_updated_at BEFORE UPDATE ON HelpCenterTickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_article_updated_at BEFORE UPDATE ON HelpCenterArticles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE Feedback IS 'Stores user feedback submissions from the feedback modal';
COMMENT ON TABLE ContactMessages IS 'Stores contact form submissions from the contact modal';
COMMENT ON TABLE HelpCenterTickets IS 'Stores help center support tickets';
COMMENT ON TABLE HelpCenterTicketResponses IS 'Stores responses/replies to help center tickets';
COMMENT ON TABLE HelpCenterArticles IS 'Stores help center articles for FAQ/Knowledge Base';

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================
-- Insert sample help center articles
INSERT INTO HelpCenterArticles (category, title, content, tags, is_published, slug, published_at) VALUES
('getting_started', 'How to Get Started with ErrorWise', 'Welcome to ErrorWise! This guide will help you get started...', ARRAY['getting-started', 'basics', 'tutorial'], TRUE, 'how-to-get-started', CURRENT_TIMESTAMP),
('api_integration', 'API Authentication Guide', 'Learn how to authenticate your API requests...', ARRAY['api', 'authentication', 'security'], TRUE, 'api-authentication-guide', CURRENT_TIMESTAMP),
('billing_subscriptions', 'Understanding Our Pricing Plans', 'ErrorWise offers three pricing tiers...', ARRAY['pricing', 'billing', 'subscription'], TRUE, 'understanding-pricing-plans', CURRENT_TIMESTAMP),
('troubleshooting', 'Common Error Messages and Solutions', 'This article covers the most common error messages...', ARRAY['troubleshooting', 'errors', 'solutions'], TRUE, 'common-error-messages', CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions (adjust based on your database user)
-- GRANT SELECT, INSERT, UPDATE ON Feedback TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON ContactMessages TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON HelpCenterTickets TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON HelpCenterTicketResponses TO your_app_user;
-- GRANT SELECT ON HelpCenterArticles TO your_app_user;

COMMIT;
