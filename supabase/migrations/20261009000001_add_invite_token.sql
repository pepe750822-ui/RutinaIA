-- Add invite_token to student_instructor for magic-link accept flow
ALTER TABLE student_instructor
  ADD COLUMN IF NOT EXISTS invite_token uuid UNIQUE;
