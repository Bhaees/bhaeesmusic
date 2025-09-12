/*
  # Create MyMusic Pro Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `credits` (integer, default 0)
      - `subscription_plan` (text, default 'free')
      - `role` (text, default 'user')
      - `created_at` (timestamp)
    
    - `songs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `album` (text)
      - `cover_url` (text)
      - `file_url` (text)
      - `duration` (integer, in seconds)
      - `created_at` (timestamp)
      - `uploaded_by` (uuid → users.id)
    
    - `downloads`
      - `id` (uuid, primary key)
      - `user_id` (uuid → users.id)
      - `song_id` (uuid → songs.id)
      - `timestamp` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid → users.id)
      - `plan` (text)
      - `amount` (numeric)
      - `payment_status` (text, default 'pending')
      - `credits_added` (integer)
      - `stripe_session_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access and admin privileges
    - Secure file access policies

  3. Functions
    - Function to handle credit deduction on download
    - Function to process successful payments
*/

-- Create users table with extended profile information
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  credits integer DEFAULT 0,
  subscription_plan text DEFAULT 'free',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create songs table for music catalog
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text NOT NULL,
  cover_url text NOT NULL,
  file_url text NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id)
);

-- Create downloads table to track user downloads
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  song_id uuid REFERENCES songs(id) NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  plan text NOT NULL,
  amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  credits_added integer NOT NULL,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Songs policies
CREATE POLICY "Anyone can read songs"
  ON songs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage songs"
  ON songs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Downloads policies
CREATE POLICY "Users can read own downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create downloads"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can see all downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can see all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle song downloads with credit deduction
CREATE OR REPLACE FUNCTION handle_song_download(song_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  user_credits integer;
  result json;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get user's current credits
  SELECT credits INTO user_credits
  FROM users
  WHERE id = current_user_id;
  
  -- Check if user has enough credits
  IF user_credits < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits');
  END IF;
  
  -- Check if song has already been downloaded by user
  IF EXISTS (
    SELECT 1 FROM downloads
    WHERE user_id = current_user_id AND song_id = song_uuid
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Song already downloaded');
  END IF;
  
  -- Deduct credit and record download
  UPDATE users
  SET credits = credits - 1
  WHERE id = current_user_id;
  
  INSERT INTO downloads (user_id, song_id)
  VALUES (current_user_id, song_uuid);
  
  RETURN json_build_object('success', true, 'remaining_credits', user_credits - 1);
END;
$$;

-- Function to process successful payments
CREATE OR REPLACE FUNCTION process_payment_success(session_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record transactions;
  result json;
BEGIN
  -- Find the transaction
  SELECT * INTO transaction_record
  FROM transactions
  WHERE stripe_session_id = session_id AND payment_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transaction not found');
  END IF;
  
  -- Update transaction status and add credits
  UPDATE transactions
  SET payment_status = 'completed'
  WHERE id = transaction_record.id;
  
  UPDATE users
  SET credits = credits + transaction_record.credits_added
  WHERE id = transaction_record.user_id;
  
  RETURN json_build_object('success', true, 'credits_added', transaction_record.credits_added);
END;
$$;

-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- INSERT INTO users (id, email, role, credits)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@mymusicpro.com', 'admin', 0);

-- Insert sample songs
INSERT INTO songs (title, artist, album, cover_url, file_url, duration) VALUES
('Shape of You', 'Ed Sheeran', '÷ (Divide)', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 233),
('Blinding Lights', 'The Weeknd', 'After Hours', 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 200),
('Watermelon Sugar', 'Harry Styles', 'Fine Line', 'https://images.pexels.com/photos/1616470/pexels-photo-1616470.jpeg', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 174),
('Good 4 U', 'Olivia Rodrigo', 'SOUR', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 178),
('Levitating', 'Dua Lipa', 'Future Nostalgia', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 203);