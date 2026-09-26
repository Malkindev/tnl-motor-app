# TNL Motor build status

## Completed in the repository

- [x] Supabase database schema, relationships, RLS and demo seed data
- [x] Persistent vehicle and sell-request photo storage with signed-link helpers
- [x] Email/password authentication and password reset UI
- [x] Shared TNL Motor design system, header, footer and responsive layout
- [x] Home page
- [x] Inventory, filtering, sorting and pagination
- [x] Vehicle detail pages, gallery, specifications, features, enquiry and similar vehicles
- [x] Sell Your Car form
- [x] Financing calculator and enquiry form
- [x] About, Services and Contact pages
- [x] Customer account, saved cars and enquiry/request history
- [x] Admin dashboard and management for vehicles, categories, features, customers, enquiries, sell requests, financing, testimonials, services and settings
- [x] Admin vehicle image upload, preview, reorder, primary-image selection and removal
- [x] Validation for vehicle and sell-request image uploads
- [x] Demo inventory imagery wired to the existing image pipeline
- [x] GitHub Actions lint + production-build checks

## Still requiring live environment verification

- [ ] Full browser E2E pass for registration, login, logout and password reset
- [ ] Full browser E2E pass for saved cars, enquiries, sell requests and financing submissions
- [ ] Live verification of admin add/edit/delete + image upload flows after deployment
- [ ] Responsive/mobile verification on real target devices
- [ ] Google sign-in provider configuration using TNL Motor's own Google OAuth credentials

## Demo-content note

- Demo vehicles are marked `is_demo = true`.
- The repository includes open-license Wikimedia Commons demo image references so the sample inventory is visually complete during development.
- Replace those demo images with TNL Motor-owned/licensed photos before production use.

## Important architecture note

- Real inventory photos uploaded from Admin > Vehicles are stored in the private `vehicle-images` Supabase bucket.
- Public pages resolve those stored paths to time-limited signed URLs.
