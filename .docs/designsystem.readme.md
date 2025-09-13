# TradeByBarter – Design System Reference

This document summarizes the visual identity and design rules extracted from the provided PNG screens.  
It serves as a **text-based reference** for developers when coding UI.

---

## Brand Identity
- **App Name**: TradeByBarter
- **Motto**: "Trade anything..."
- **Style**: Minimal, modern, and clean. Strong typography with bold titles, lots of whitespace, and clear hierarchy.

---

## Colors
- **Primary Blue**: #1E3A8A (Splash background, key buttons on dark bg)
- **Secondary Green**: #10B981 (Logo, accents, some call-to-actions)
- **Accent Orange**: #F97316 (Onboarding icon, Next button)
- **Background Light**: #F9FAFB (Main UI background)
- **Neutral Dark**: #111827 (Headings / Title text)
- **Neutral Gray**: #6B7280 (Subtext / Placeholders)
- **Border/Stroke Gray**: #E5E7EB (Input borders, dividers)

---

## Typography
- **Font**: Inter or Poppins (sans-serif, modern, rounded)
- **Heading (H1)**: Bold, ~24–28px
- **Subheading (H2)**: Medium, ~18–20px
- **Body**: Regular, 14–16px
- **Buttons**: Bold, uppercase or sentence case depending on design

---

## Icons
- **Icon set**: Lucide or Feather icons (outline, clean, modern)
- **Usage**:
  - Search bar → Magnifying glass
  - Profile → User circle
  - Notifications → Bell
  - Navigation & actions → Outline icons only
- **No emojis anywhere**.

---

## Layout & Frames
### Splash Screen
- Dark blue background (#1E3A8A)
- Centered green logo (circle + “X” inside)
- App name in bold white
- Motto in green (#10B981), small font, centered

### Onboarding Screen
- White/light background (#F9FAFB)
- Large circular icon in accent orange (#F97316), centered
- Title bold dark text
- Subtitle light gray explanatory text
- Pagination dots (active = orange, inactive = gray)
- Skip button (gray text, left)
- Next button (rounded orange, right)

### Marketplace Feed
- White background
- Top bar: logo (left), search bar (center), icons (right)
- Category filters as rounded pills (active = primary blue bg + white text, inactive = light gray)
- Product cards:
  - Image at top
  - Title bold black
  - Price in primary blue with ₦ symbol
  - Location in gray small text
- Grid layout: 2 columns, consistent spacing, rounded card corners

---

## Interaction
- Buttons: Rounded corners, solid fill
- Inputs: Rounded corners, thin border gray
- Hover/active states: Slight shadow or darker shade
- Navigation: Simple tab or drawer on mobile, top nav for web

---

## Overall Feel
- Modern and minimal
- Heavy use of whitespace
- Clear visual hierarchy (bold titles, lighter subtitles)
- Trustworthy and clean, competitive with top marketplace apps

---

This design system is binding — developers must use it in all frontend implementations (web + mobile).
