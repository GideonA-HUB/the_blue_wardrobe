Frontend — THE BLUE WARDROBE

This scaffold contains a React + Vite + TypeScript frontend using Tailwind CSS and Zustand for cart state.

Quick start
1. cd frontend
2. npm install
3. npm run dev

Environment
- VITE_API_URL — backend API base (default: http://localhost:8000/api)

What I scaffolded
- Pages: Home (with parallax hero), Collections, Product, Cart, Checkout, Success
- Components: Navbar with dynamic logo spinner, ParallaxHero
- Zustand cart store (`src/store/cart.ts`)
- API client (`src/lib/api.ts`) that targets backend `/api` endpoints

Next steps
- Polish UI and add product image zoom carousel, animations, SEO tags
- Wire admin dashboard and secure owner-only area
- Add tests and build pipeline

Run notes
- The frontend expects the backend API at http://localhost:8000/api by default and will fetch `/assets/` and `/collections/` endpoints.
