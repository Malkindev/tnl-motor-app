-- Demo-only image references. The source files are CC0/public-domain on Wikimedia Commons.
-- These URLs intentionally remain remote demo imagery; real TNL Motor inventory should use Admin > Vehicles > Upload photos.
INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2017-2020%20Toyota%20Harrier%20Hybrid%20Premium.jpg', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1001'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://upload.wikimedia.org/wikipedia/commons/e/e8/BMW_G30_%285er%29_164634.jpg', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1002'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2020-2021%20Mazda%20CX-5%20XD%20AWD.jpg', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1003'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Toyota_Hilux_172018.jpg', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1004'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/VolksWagen%20Golf%20VI%20GTI%203.JPG', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1005'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2022.07.19%20Fully%20electric%20car%20Tesla%20Model%203%20Dual%20motor%20in%20Tomasz%C3%B3w%20Mazowiecki%2C%20Poland%20%281%29.jpg', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1006'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mercedes-Benz%20C200%20AVANTGARDE%20%28W205%29%20front.JPG', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1007'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);

INSERT INTO public.vehicle_images (vehicle_id, url, position, is_primary)
SELECT v.id, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/NISSAN%20NV350%20CARAVAN%20front.JPG', 0, true
FROM public.vehicles v
WHERE v.stock_number = 'TNL-1008'
  AND v.is_demo
  AND NOT EXISTS (SELECT 1 FROM public.vehicle_images i WHERE i.vehicle_id = v.id);