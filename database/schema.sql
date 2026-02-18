-- Syncro (Phase 1) initial schema placeholder
-- Planned tables: users, rfp, bids, categories

-- 1. PROFILES: The "Master" User Table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  contact_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_picture_url TEXT,
  role TEXT CHECK (role IN ('buyer', 'seller')) DEFAULT 'buyer',
  
  -- Sri Lanka District Selection (Essential for Search)
  district TEXT CHECK (district IN (
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  )),

  rating_average DECIMAL(3,2) DEFAULT 0.0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BIDS: The Negotiation Engine
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  proposed_price DECIMAL(12,2) NOT NULL,
  task_details TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CHAT_MESSAGES: The Real-time History
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  bid_id INTEGER REFERENCES bids(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);