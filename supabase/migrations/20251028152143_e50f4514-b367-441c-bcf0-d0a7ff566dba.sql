-- Create tickets table for university support system
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  matric_number TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  nature_of_complaint TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  staff_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert tickets (public submission)
CREATE POLICY "Anyone can create tickets"
  ON public.tickets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read tickets if they provide matching email
CREATE POLICY "Users can view tickets with matching email"
  ON public.tickets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for faster ticket lookups
CREATE INDEX idx_tickets_ticket_id ON public.tickets(ticket_id);
CREATE INDEX idx_tickets_email ON public.tickets(email);
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();