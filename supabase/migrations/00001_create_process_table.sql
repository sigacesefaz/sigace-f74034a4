-- Create process table
CREATE TABLE IF NOT EXISTS public.process (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    court VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT process_status_check CHECK (status IN ('active', 'pending', 'closed'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS process_number_idx ON public.process(number);
CREATE INDEX IF NOT EXISTS process_status_idx ON public.process(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.process ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.process
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.process
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.process
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_process_updated_at
    BEFORE UPDATE ON public.process
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
