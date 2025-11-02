-- Update Users Table Schema for Authentication with Security Questions
-- Run this script to ensure your database has the correct schema

-- First, check if table exists and create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            reset_password_token VARCHAR(255),
            reset_password_expires TIMESTAMP,
            is_active BOOLEAN DEFAULT true,
            role VARCHAR(50) DEFAULT 'user',
            subscription_status VARCHAR(50) DEFAULT 'free',
            deleted_at TIMESTAMP,
            security_question_1 VARCHAR(255),
            security_answer_1 VARCHAR(255),
            security_question_2 VARCHAR(255),
            security_answer_2 VARCHAR(255),
            security_question_3 VARCHAR(255),
            security_answer_3 VARCHAR(255),
            google_id VARCHAR(255) UNIQUE,
            phone_number VARCHAR(50),
            is_phone_verified BOOLEAN DEFAULT false,
            phone_verification_token VARCHAR(255),
            phone_verification_expires TIMESTAMP,
            original_registration_date TIMESTAMP,
            account_recreation_count INTEGER DEFAULT 0,
            last_login_at TIMESTAMP,
            login_otp VARCHAR(10),
            login_otp_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_username ON users(username);
        CREATE INDEX idx_users_is_active ON users(is_active);
        
        RAISE NOTICE 'Users table created successfully';
    ELSE
        -- Table exists, add missing columns
        
        -- Add username if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
            ALTER TABLE users ADD COLUMN username VARCHAR(255);
            RAISE NOTICE 'Added username column';
        END IF;
        
        -- Rename password_hash to password if needed
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') 
           AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
            ALTER TABLE users RENAME COLUMN password_hash TO password;
            RAISE NOTICE 'Renamed password_hash to password';
        END IF;
        
        -- Add security question columns if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_question_1') THEN
            ALTER TABLE users ADD COLUMN security_question_1 VARCHAR(255);
            RAISE NOTICE 'Added security_question_1 column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_answer_1') THEN
            ALTER TABLE users ADD COLUMN security_answer_1 VARCHAR(255);
            RAISE NOTICE 'Added security_answer_1 column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_question_2') THEN
            ALTER TABLE users ADD COLUMN security_question_2 VARCHAR(255);
            RAISE NOTICE 'Added security_question_2 column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_answer_2') THEN
            ALTER TABLE users ADD COLUMN security_answer_2 VARCHAR(255);
            RAISE NOTICE 'Added security_answer_2 column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_question_3') THEN
            ALTER TABLE users ADD COLUMN security_question_3 VARCHAR(255);
            RAISE NOTICE 'Added security_question_3 column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'security_answer_3') THEN
            ALTER TABLE users ADD COLUMN security_answer_3 VARCHAR(255);
            RAISE NOTICE 'Added security_answer_3 column';
        END IF;
        
        -- Add last_login_at if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
            ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
            RAISE NOTICE 'Added last_login_at column';
        END IF;
        
        -- Add is_active if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
            ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Added is_active column';
        END IF;
        
        RAISE NOTICE 'Users table updated successfully';
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Display table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
