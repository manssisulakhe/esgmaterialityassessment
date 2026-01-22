-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG topics table
CREATE TABLE public.esg_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.esg_topics(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stakeholder_importance INTEGER NOT NULL CHECK (stakeholder_importance >= 1 AND stakeholder_importance <= 4),
  business_impact INTEGER NOT NULL CHECK (business_impact >= 1 AND business_impact <= 4),
  materiality_score INTEGER GENERATED ALWAYS AS (stakeholder_importance + business_impact) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id)
);

-- Enable Row Level Security (public access for this app)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this assessment tool)
CREATE POLICY "Allow all operations on projects" 
ON public.projects FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on esg_topics" 
ON public.esg_topics FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on survey_responses" 
ON public.survey_responses FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_esg_topics_project_id ON public.esg_topics(project_id);
CREATE INDEX idx_esg_topics_category ON public.esg_topics(category);
CREATE INDEX idx_survey_responses_project_id ON public.survey_responses(project_id);
CREATE INDEX idx_survey_responses_topic_id ON public.survey_responses(topic_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();