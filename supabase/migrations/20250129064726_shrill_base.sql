/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - User profiles with basic information
      - Linked to auth.users
    - `analyses`
      - Stores face analysis results
      - Links to user profiles
    - `daily_tasks`
      - Personalized daily tasks for users
      - Based on analysis results
    - `task_completions`
      - Tracks completed tasks
      - Helps monitor user progress

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure user data isolation

  3. Changes
    - Initial schema creation
    - Basic table structure
    - Core functionality support
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gender text CHECK (gender IN ('male', 'female', 'unspecified')),
  birth_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  scores jsonb NOT NULL,
  detailed_scores jsonb NOT NULL,
  advice jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for analyses
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Analyses policies
CREATE POLICY "Users can view own analyses"
  ON analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own analyses"
  ON analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Daily tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  time_of_day text NOT NULL,
  duration integer NOT NULL,
  difficulty text NOT NULL,
  priority integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for daily_tasks
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Daily tasks policies
CREATE POLICY "Users can view own tasks"
  ON daily_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks"
  ON daily_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Task completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES daily_tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS for task_completions
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Task completions policies
CREATE POLICY "Users can view own completions"
  ON task_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own completions"
  ON task_completions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();