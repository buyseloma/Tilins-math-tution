-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'admin', 'teacher', 'parent');
CREATE TYPE board_type AS ENUM ('state_board', 'cbse', 'icse', 'cambridge');
CREATE TYPE class_mode AS ENUM ('online', 'offline');
CREATE TYPE fee_status AS ENUM ('paid', 'pending', 'overdue');

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches table
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  board board_type NOT NULL,
  grade TEXT NOT NULL,
  mode class_mode NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table (extends profile with student-specific data)
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  parent_id UUID REFERENCES profiles(id),
  board board_type NOT NULL,
  grade TEXT NOT NULL,
  admission_date DATE DEFAULT CURRENT_DATE
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) NOT NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meet_link TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class notes table
CREATE TABLE class_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fees table
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status fee_status DEFAULT 'pending',
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) NOT NULL,
  subject TEXT NOT NULL,
  test_date DATE NOT NULL,
  max_marks INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test marks table
CREATE TABLE test_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) NOT NULL,
  marks_obtained DECIMAL(5,2),
  retest_eligible BOOLEAN DEFAULT FALSE,
  retest_date DATE,
  UNIQUE(test_id, student_id)
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) NOT NULL,
  is_present BOOLEAN DEFAULT FALSE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Tasks/Homework table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task submissions table
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  UNIQUE(task_id, student_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demo bookings table
CREATE TABLE demo_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  board board_type NOT NULL,
  preferred_mode class_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for students (students can view own data, admins/teachers can view all)
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone authenticated can view batches" ON batches FOR SELECT TO authenticated USING (true);

-- RLS Policies for classes (students in batch can view, admins/teachers can manage)
CREATE POLICY "Students can view classes in their batch" ON classes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students WHERE students.id = auth.uid() AND students.batch_id = classes.batch_id
  )
);

-- RLS Policies for class notes
CREATE POLICY "Students can view notes for their classes" ON class_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM classes c
    JOIN students s ON s.batch_id = c.batch_id
    WHERE c.id = class_notes.class_id AND s.id = auth.uid()
  )
);

-- RLS Policies for fees
CREATE POLICY "Students can view own fees" ON fees FOR SELECT USING (auth.uid() = student_id);

-- RLS Policies for test marks
CREATE POLICY "Students can view own marks" ON test_marks FOR SELECT USING (auth.uid() = student_id);

-- RLS Policies for attendance
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT USING (auth.uid() = student_id);

-- RLS Policies for tasks
CREATE POLICY "Students can view tasks for their batch" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students WHERE students.id = auth.uid() AND students.batch_id = tasks.batch_id
  )
);

-- RLS Policies for task submissions
CREATE POLICY "Students can manage own submissions" ON task_submissions FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for events (public read)
CREATE POLICY "Anyone can view events" ON events FOR SELECT TO authenticated USING (true);

-- RLS Policies for event registrations
CREATE POLICY "Students can manage own registrations" ON event_registrations FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for demo bookings (public insert)
CREATE POLICY "Anyone can create demo booking" ON demo_bookings FOR INSERT WITH CHECK (true);

-- RLS Policies for testimonials (public read)
CREATE POLICY "Anyone can view testimonials" ON testimonials FOR SELECT TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();