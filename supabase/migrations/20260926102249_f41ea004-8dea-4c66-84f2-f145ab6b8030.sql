CREATE TYPE public.app_role AS ENUM ('admin','customer');
CREATE TYPE public.vehicle_status AS ENUM ('available','reserved','sold','draft');
CREATE TYPE public.request_status AS ENUM ('new','contacted','viewing_scheduled','negotiating','reviewing','accepted','rejected','completed','closed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body_type TEXT,
  image_url TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  mileage INT NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'Used',
  body_type TEXT NOT NULL DEFAULT 'Sedan',
  fuel_type TEXT NOT NULL DEFAULT 'Petrol',
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  drive_type TEXT,
  engine TEXT,
  engine_size NUMERIC(4,1),
  doors INT DEFAULT 4,
  seats INT DEFAULT 5,
  exterior_color TEXT,
  interior_color TEXT,
  location TEXT,
  stock_number TEXT,
  description TEXT,
  status public.vehicle_status NOT NULL DEFAULT 'available',
  featured BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles public read" ON public.vehicles FOR SELECT USING (status <> 'draft' OR public.is_admin());
CREATE POLICY "vehicles admin write" ON public.vehicles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_images TO authenticated;
GRANT ALL ON public.vehicle_images TO service_role;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle images public read" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "vehicle images admin write" ON public.vehicle_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  position INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT ALL ON public.features TO service_role;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "features public read" ON public.features FOR SELECT USING (true);
CREATE POLICY "features admin write" ON public.features FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.vehicle_features (
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.features ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, feature_id)
);
GRANT SELECT ON public.vehicle_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_features TO authenticated;
GRANT ALL ON public.vehicle_features TO service_role;
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle features public read" ON public.vehicle_features FOR SELECT USING (true);
CREATE POLICY "vehicle features admin write" ON public.vehicle_features FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, vehicle_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist own read" ON public.wishlists FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "wishlist own insert" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "wishlist own delete" ON public.wishlists FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  kind TEXT NOT NULL DEFAULT 'vehicle',
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enquiries anyone insert" ON public.enquiries FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "enquiries read own or admin" ON public.enquiries FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "enquiries admin update" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "enquiries admin delete" ON public.enquiries FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER enquiries_updated BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.sell_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  mileage INT,
  transmission TEXT,
  fuel_type TEXT,
  expected_price NUMERIC(12,2),
  location TEXT,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.sell_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.sell_requests TO authenticated;
GRANT ALL ON public.sell_requests TO service_role;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sell anyone insert" ON public.sell_requests FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "sell read own or admin" ON public.sell_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "sell admin update" ON public.sell_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "sell admin delete" ON public.sell_requests FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER sell_updated BEFORE UPDATE ON public.sell_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.financing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_interest TEXT,
  employment_status TEXT,
  monthly_income NUMERIC(12,2),
  deposit NUMERIC(12,2),
  payment_period TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.financing_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.financing_requests TO authenticated;
GRANT ALL ON public.financing_requests TO service_role;
ALTER TABLE public.financing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin anyone insert" ON public.financing_requests FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "fin read own or admin" ON public.financing_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "fin admin update" ON public.financing_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "fin admin delete" ON public.financing_requests FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER fin_updated BEFORE UPDATE ON public.financing_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating INT NOT NULL DEFAULT 5,
  review TEXT NOT NULL,
  vehicle_purchased TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  position INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.website_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.website_settings TO authenticated;
GRANT ALL ON public.website_settings TO service_role;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.website_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "vehicle images readable" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "vehicle images admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images' AND public.is_admin());
CREATE POLICY "vehicle images admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-images' AND public.is_admin());
CREATE POLICY "vehicle images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images' AND public.is_admin());
CREATE POLICY "sell photos readable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'sell-photos' AND public.is_admin());
CREATE POLICY "sell photos anyone upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sell-photos');

INSERT INTO public.features (name, position) VALUES
 ('Air Conditioning',1),('Leather Seats',2),('Sunroof',3),('Reverse Camera',4),('Parking Sensors',5),
 ('Bluetooth',6),('Apple CarPlay',7),('Android Auto',8),('Cruise Control',9),('Navigation',10),
 ('Keyless Entry',11),('Push Start',12),('ABS',13),('Airbags',14);

INSERT INTO public.categories (name, slug, body_type, position) VALUES
 ('SUVs','suvs','SUV',1),('Sedans','sedans','Sedan',2),('Hatchbacks','hatchbacks','Hatchback',3),
 ('Pickups','pickups','Pickup',4),('Luxury Cars','luxury','Luxury',5),('Sports Cars','sports','Sports',6),
 ('Electric Cars','electric','Electric',7),('Commercial Vehicles','commercial','Commercial',8);

INSERT INTO public.services (title, description, icon, position) VALUES
 ('Vehicle Sales','A curated range of inspected vehicles ready for immediate purchase.','car',1),
 ('Vehicle Sourcing','Tell us the exact specification you want and we will find it for you.','search',2),
 ('Vehicle Importation','End-to-end importation handling, duty, clearing and documentation.','ship',3),
 ('Trade-In','Bring your current car and offset its value against your next one.','repeat',4),
 ('Vehicle Financing','We connect you with financing partners and guide the paperwork.','wallet',5),
 ('Vehicle Inspection','Independent multi-point inspection reports before you commit.','clipboard-check',6),
 ('Delivery','Nationwide delivery of your vehicle to an address you choose.','truck',7),
 ('After-Sales Support','Servicing advice, parts sourcing and ownership support after purchase.','life-buoy',8);

INSERT INTO public.testimonials (name, location, rating, review, vehicle_purchased, is_demo) VALUES
 ('Daniel Mwangi','Nairobi',5,'The whole process was transparent. The price I saw was the price I paid, and the inspection report was thorough.','2022 Toyota Harrier Hybrid',true),
 ('Aisha Noor','Mombasa',5,'They sourced the exact trim I wanted within three weeks. Excellent communication throughout.','2021 Mazda CX-5',true),
 ('Peter Otieno','Kisumu',4,'Straightforward trade-in and a fair valuation on my old car. Would buy from TNL Motor again.','2020 Subaru Forester',true);

INSERT INTO public.website_settings (key, value) VALUES
 ('company_name','TNL Motor'),
 ('phone','+254 700 000 000'),
 ('whatsapp','+254700000000'),
 ('email','sales@tnlmotor.com'),
 ('address','TNL Motor Yard, Mombasa Road, Nairobi'),
 ('opening_hours','Mon-Fri 8:00-18:00 · Sat 9:00-16:00 · Sun Closed'),
 ('facebook','https://facebook.com'),
 ('instagram','https://instagram.com'),
 ('twitter','https://twitter.com'),
 ('youtube','https://youtube.com'),
 ('hero_heading','Find Your Next Car With TNL Motor'),
 ('hero_description','Quality vehicles. Transparent pricing. A better way to buy and sell cars.'),
 ('cta_heading','Ready to Find Your Next Car?'),
 ('footer_text','TNL Motor — quality vehicles, transparent pricing and honest advice.');

INSERT INTO public.vehicles (make, model, variant, year, price, mileage, condition, body_type, fuel_type, transmission, drive_type, engine, engine_size, doors, seats, exterior_color, interior_color, location, stock_number, description, status, featured, is_demo) VALUES
 ('Toyota','Harrier','Hybrid Z',2022,4850000,32000,'Used','SUV','Hybrid','Automatic','AWD','2.5L Hybrid',2.5,5,5,'Pearl White','Black','Nairobi','TNL-1001','A well kept Harrier Hybrid with full service history, panoramic roof and factory navigation. Inspected and ready for transfer.','available',true,true),
 ('BMW','5 Series','530i M Sport',2021,6200000,41000,'Used','Sedan','Petrol','Automatic','RWD','2.0L Turbo',2.0,4,5,'Black Sapphire','Cognac','Nairobi','TNL-1002','Executive saloon in excellent condition with M Sport package, heated leather seats and adaptive cruise control.','available',true,true),
 ('Mazda','CX-5','2.0 Skyactiv',2021,3750000,52000,'Used','SUV','Petrol','Automatic','AWD','2.0L',2.0,5,5,'Soul Red','Black','Mombasa','TNL-1003','Popular family crossover with balanced ride quality, reverse camera and CarPlay.','available',true,true),
 ('Toyota','Hilux','Double Cab 2.8 GR',2023,7100000,18000,'Used','Pickup','Diesel','Automatic','4WD','2.8L Diesel',2.8,4,5,'Silver','Black','Nairobi','TNL-1004','Low mileage double cab with load liner, tow bar and full dealer service record.','available',false,true),
 ('Volkswagen','Golf','GTI',2020,3980000,60000,'Used','Hatchback','Petrol','Automatic','FWD','2.0L Turbo',2.0,5,5,'Tornado Red','Black','Nairobi','TNL-1005','Hot hatch with DSG gearbox, digital cockpit and recent major service.','available',false,true),
 ('Tesla','Model 3','Long Range',2022,6950000,24000,'Used','Electric','Electric','Automatic','AWD','Dual Motor',0.0,4,5,'Midnight Grey','White','Nairobi','TNL-1006','Long range dual motor with premium interior, fast charging and a clean battery health report.','available',true,true),
 ('Mercedes-Benz','C-Class','C200 AMG Line',2020,5200000,58000,'Used','Luxury','Petrol','Automatic','RWD','1.5L Turbo',1.5,4,5,'Obsidian Black','Beige','Mombasa','TNL-1007','AMG Line saloon with Burmester sound, ambient lighting and a fresh full service.','reserved',false,true),
 ('Nissan','NV350','Urvan 15 Seater',2019,3150000,98000,'Used','Commercial','Diesel','Manual','RWD','2.5L Diesel',2.5,4,15,'White','Grey','Nakuru','TNL-1008','Reliable 15 seater van, ideal for shuttle or staff transport. Well maintained fleet unit.','sold',false,true);

INSERT INTO public.vehicle_features (vehicle_id, feature_id)
SELECT v.id, f.id FROM public.vehicles v CROSS JOIN public.features f
WHERE v.is_demo AND f.name IN ('Air Conditioning','Bluetooth','Reverse Camera','ABS','Airbags','Cruise Control');

INSERT INTO public.vehicle_features (vehicle_id, feature_id)
SELECT v.id, f.id FROM public.vehicles v CROSS JOIN public.features f
WHERE v.is_demo AND v.price > 4500000 AND f.name IN ('Leather Seats','Sunroof','Navigation','Keyless Entry','Push Start','Apple CarPlay');