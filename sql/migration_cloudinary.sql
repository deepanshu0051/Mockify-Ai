-- Add cloudinary_public_id to track assets for cleanup

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS cloudinary_public_id text;
