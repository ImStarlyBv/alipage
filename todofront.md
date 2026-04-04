# Frontend Revamp - Based on dulce.jpg Reference Design

## Color Palette (from reference)
- **Primary teal/mint:** `#A2BFC2`
- **Soft pink/salmon:** `#ECC3C3`
- **Off-white/cream:** `#FEFFFE`
- **Light beige:** `#FDF1EC`
- **Black** for text details
- Remove dark mode (reference is light-only)

## Typography
- **Headings:** Cursive serif font (decorative/script for hero titles)
- **Subheadings:** "Condensado perfecto" / bold condensed
- **Body:** Open Sans / sans-serif
- Replace current Geist fonts with Open Sans + a cursive serif (e.g. Playfair Display or similar)

## Button Styles (from reference)
- **Active buttons:** Teal `#A2BFC2` background, white text, rounded
- **Hover buttons:** Darker teal shade
- **Disabled buttons:** Muted/grayed out version
- Replace current black buttons everywhere

---

## Changes by File

### 1. `globals.css` - Theme & Colors
- [x] Replace `:root` CSS variables with new palette (`#A2BFC2`, `#ECC3C3`, `#FEFFFE`, `#FDF1EC`)
- [x] Remove dark mode media query
- [x] Add custom Tailwind theme colors: `primary`, `secondary`, `cream`, `beige`
- [x] Set body background to `#FEFFFE` (off-white cream)

### 2. `layout.tsx` - Fonts
- [x] Replace Geist fonts with Open Sans (body) + Playfair Display or cursive serif (headings)
- [x] Update font CSS variables

### 3. `Header.tsx` - Navigation Bar
- [x] Background: `#FEFFFE` (cream white)
- [x] Logo: use cursive serif font, styled with teal color
- [x] Nav links: Open Sans, teal hover color instead of gray
- [x] "Sign Up" button: teal `#A2BFC2` bg instead of black
- [x] Cart badge: teal bg instead of black
- [x] Mobile menu: soft beige `#FDF1EC` background
- [x] Add subtle bottom border in `#ECC3C3` (pink) instead of gray

### 4. `Footer.tsx` - Footer
- [x] Background: `#A2BFC2` (teal) or `#FDF1EC` (beige) instead of gray-50
- [x] Text: white or dark on beige
- [x] Headings in condensed/bold style
- [x] Links hover in pink `#ECC3C3`
- [x] Copyright bar: slightly darker teal

### 5. `page.tsx` (Home) - Hero & Featured
- [x] Hero section: gradient or solid `#FDF1EC` (beige) background
- [x] Hero title: cursive serif font, large
- [x] "Shop Now" button: teal `#A2BFC2` instead of black
- [x] "New Arrivals" section: clean cream background
- [x] Add decorative elements (rounded shapes, soft shadows matching reference aesthetic)

### 6. `ProductCard.tsx` - Product Cards
- [x] Border: softer, use `#ECC3C3` (pink) or remove border, add soft shadow
- [x] Background: white with rounded-xl corners
- [x] Hover: pink-tinted shadow instead of generic shadow
- [x] "Out of Stock" overlay: teal tint instead of black overlay
- [x] Price text: teal color instead of plain black bold
- [x] Add subtle hover scale animation

### 7. `products/[id]/page.tsx` - Product Detail (MAJOR)
- [x] **Image carousel**: Replace static image + thumbnail grid with an interactive carousel
  - Main image with left/right arrow navigation
  - Dot indicators at bottom
  - Thumbnail strip below that highlights active image
  - Swipe support on mobile
  - Create new `ImageCarousel.tsx` client component
- [x] **Description images**: Parse HTML description, extract `<img>` tags, display them in a scrollable gallery or masonry grid instead of raw HTML dump
  - Create `DescriptionGallery.tsx` component for beautiful image layout
  - Style remaining text content cleanly
- [x] Category label: pink `#ECC3C3` pill/badge
- [x] Price: teal color, larger
- [x] "In Stock" badge: teal instead of green
- [x] Variant buttons: teal border on hover/selected, rounded-full pills
- [x] "Add to Cart" button: teal bg, rounded, full-width
- [x] Shipping section: beige `#FDF1EC` background card
- [x] Description section: clean typography, beige bg card

### 8. `products/page.tsx` - Products Listing
- [x] Page title: cursive serif font
- [x] Pagination buttons: teal styled instead of plain border
- [x] Active page indicator: teal bg

### 9. `categories/page.tsx` - Categories
- [x] Category cards: alternating `#FDF1EC` and `#ECC3C3` soft backgrounds
- [x] Hover: teal border or shadow
- [x] Rounded-xl corners

### 10. `cart/page.tsx` - Cart
- [x] "Continue Shopping" button: teal instead of black
- [x] Quantity +/- buttons: teal border and hover
- [x] "Remove" text: teal instead of red
- [x] "Proceed to Checkout" button: teal bg instead of black
- [x] Subtotal area: beige `#FDF1EC` background

### 11. `checkout/page.tsx` - Checkout
- [x] Section cards: beige `#FDF1EC` background, teal borders
- [x] Input focus: teal ring instead of black
- [x] Labels: teal-tinted
- [x] Country select: styled with teal focus
- [x] "Payment" section heading: teal accent

### 12. `auth/login/page.tsx` & `auth/register/page.tsx` - Auth Pages
- [x] Card: centered with beige `#FDF1EC` background, soft shadow
- [x] "Sign In" button: teal instead of black
- [x] Input focus: teal border
- [x] "Create one" link: teal color

### 13. `CategoryNav.tsx` - Category Filter
- [x] Active category: teal `#A2BFC2` bg pill
- [x] Inactive: beige `#FDF1EC` bg, teal text on hover

### 14. `AddToCartButton.tsx` - Add to Cart
- [x] Button: teal `#A2BFC2` bg, white text, rounded-full or rounded-lg
- [x] Disabled: muted teal

### 15. `ShippingOptions.tsx` - Shipping Display
- [x] Container: beige `#FDF1EC` card with rounded corners
- [x] Selected option: teal highlight

---

## New Components to Create

### `ImageCarousel.tsx` (client component)
- Receives `images: string[]` and `alt: string`
- Main image display with prev/next arrows
- Thumbnail strip below (scrollable if many images)
- Active thumbnail highlighted with teal border
- Smooth transitions between images
- Touch/swipe support for mobile

### `DescriptionGallery.tsx` (client component)
- Receives raw HTML description string
- Extracts images from HTML
- Displays images in a clean grid/masonry layout
- Renders remaining text content with proper typography
- Images get rounded corners, soft shadows

---

## Order of Implementation
1. `globals.css` + `layout.tsx` (fonts & colors - affects everything)
2. `Header.tsx` + `Footer.tsx` (layout shell)
3. `ProductCard.tsx` (used on home + products page)
4. Home `page.tsx`
5. `ImageCarousel.tsx` + `DescriptionGallery.tsx` (new components)
6. Product detail page (biggest change)
7. Products listing + Categories pages
8. Cart + Checkout pages
9. Auth pages
10. Supporting components (AddToCartButton, ShippingOptions, CategoryNav)
