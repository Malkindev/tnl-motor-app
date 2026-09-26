DROP POLICY "vehicles public read" ON public.vehicles;
CREATE POLICY "vehicles anon read" ON public.vehicles FOR SELECT TO anon USING (status <> 'draft');
CREATE POLICY "vehicles auth read" ON public.vehicles FOR SELECT TO authenticated USING (status <> 'draft' OR public.is_admin());

DROP POLICY "testimonials public read" ON public.testimonials;
CREATE POLICY "testimonials anon read" ON public.testimonials FOR SELECT TO anon USING (published);
CREATE POLICY "testimonials auth read" ON public.testimonials FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "services public read" ON public.services;
CREATE POLICY "services anon read" ON public.services FOR SELECT TO anon USING (published);
CREATE POLICY "services auth read" ON public.services FOR SELECT TO authenticated USING (published OR public.is_admin());