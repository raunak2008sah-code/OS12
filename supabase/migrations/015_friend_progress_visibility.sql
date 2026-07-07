-- Allow authenticated users to view each other's progress for Friend/Compare features
CREATE POLICY "Chapter progress viewable by authenticated users" 
ON public.chapter_progress FOR SELECT TO authenticated USING (true);

CREATE POLICY "Resource progress viewable by authenticated users" 
ON public.resource_progress FOR SELECT TO authenticated USING (true);

CREATE POLICY "Notes viewable by authenticated users" 
ON public.notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Revisions viewable by authenticated users" 
ON public.revision FOR SELECT TO authenticated USING (true);
