/*
  # Add dashboard analytics tables

  1. New Tables
    - `analytics_daily`
      - Daily aggregated metrics for user analysis
      - Stores total analyses, average scores, etc.
    
    - `analytics_trends`
      - Trend analysis for user progress
      - Tracks score improvements over time
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    
  3. Functions
    - Add aggregation functions for dashboard metrics
*/

-- Daily analytics table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_analyses integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  highest_score numeric(5,2) DEFAULT 0,
  lowest_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own analytics"
  ON analytics_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trends analysis table
CREATE TABLE IF NOT EXISTS analytics_trends (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  improvement_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, start_date, end_date)
);

-- Enable RLS
ALTER TABLE analytics_trends ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own trends"
  ON analytics_trends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_daily (user_id, date, total_analyses, average_score, highest_score, lowest_score)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    (NEW.scores->>'total')::numeric,
    (NEW.scores->>'total')::numeric,
    (NEW.scores->>'total')::numeric
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_analyses = analytics_daily.total_analyses + 1,
    average_score = (analytics_daily.average_score * analytics_daily.total_analyses + (NEW.scores->>'total')::numeric) / (analytics_daily.total_analyses + 1),
    highest_score = GREATEST(analytics_daily.highest_score, (NEW.scores->>'total')::numeric),
    lowest_score = LEAST(analytics_daily.lowest_score, (NEW.scores->>'total')::numeric),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating analytics
CREATE TRIGGER update_analytics_on_analysis
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics();