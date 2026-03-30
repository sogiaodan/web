# Sacred Vellum Design System

## 🏷️ BRANDING & COPYWRITING RULES
- **Brand Name (Display):** "Sổ Giáo Dân". You MUST use this exact text for all logos, headers, titles, and footers.
- **Internal Theme (Hidden):** "Sacred Vellum". This is strictly the internal technical name of the Design System. NEVER display the words "Sacred Vellum" anywhere on the actual User Interface.


### 1. Overview & Creative North Star

**Creative North Star: "The Modern Archive"**

Sacred Vellum is a design system that marries the solemnity of historical record-keeping with the clarity of modern administrative tools. It moves away from the generic "SaaS" aesthetic by prioritizing high-contrast serif typography against a warm, parchment-like background. The layout uses intentional whitespace and subtle hairline dividers to create a sense of organized dignity, reflecting the importance of the data it preserves.



### 2. Colors

The palette is rooted in an academic and liturgical tradition:

- **Primary (Sacred Crimson):** A deep, authoritative red (#8B2635) used for navigation anchors and primary actions.

- **Background (Vellum):** A warm off-white (#FDFBF7) that reduces eye strain compared to pure digital white.

- **The "No-Line" Rule:** While the current interface uses subtle borders, future iterations should transition toward "Soft Boundaries." Avoid heavy 1px black lines. Instead, use `outline-variant` (#D6D3D1) or background shifts to `surface_container` (#F5F5F4) to define regions.

- **Surface Hierarchy:**

- `surface_container_low`: The main content canvas.

- `surface_container`: Used for header bars and table headers to provide subtle grounding.

- `surface_container_highest`: For active states or hover transitions.



### 3. Typography

Sacred Vellum utilizes a sophisticated dual-type system:

- **Display & Headlines:** Lora (Serif). This conveys heritage and truth. Used for page titles (2.25rem / 36px) and section headers.

- **Body & Interface:** Work Sans (Sans-Serif). A highly legible, modern gothic that ensures clarity in dense data tables and forms.

- **The Scale (Ground Truth):**

- **Display Large:** 2.25rem (36px) - Lora Bold.

- **Headline Medium:** 1.5rem (24px) - Lora Bold.

- **Title Small:** 1.125rem (18px) - Lora Bold.

- **Body Standard:** 1rem (16px) - Work Sans Regular.

- **Label/Small:** 0.875rem (14px) - Work Sans Medium/Bold.

- **Micro:** 0.75rem (12px) - Work Sans Regular.



### 4. Elevation & Depth

Elevation is achieved through tonal layering rather than aggressive shadows.

- **The Layering Principle:** Content cards are flush with the surface but defined by an `outline` (#E7E5E4). Depth is communicated by the "pop" of primary-colored icons or accent tags.

- **Ambient Shadows:** The system avoids traditional dropshadows. If elevation is required for a modal, use an extra-diffused shadow: `0 4px 20px -2px rgba(28, 25, 23, 0.08)`.

- **The "Ghost Border":** Navigation elements and secondary buttons use a 1px border that is 20% opacity of the primary color to create a "ghost" effect that feels integrated rather than floating.



### 5. Components

- **Buttons:** Sharp edges (2px-4px radius). Primary buttons are solid Crimson. Secondary buttons are "Vellum" with a Crimson outline.

- **Metric Cards:** Use "Corner Accents"—a subtle 10% opacity primary-colored flourish in the top-right corner to draw the eye toward key data points.

- **Status Chips:** Use high-chroma, low-saturation backgrounds (e.g., success-bg #F0FDF4) with high-contrast text to ensure accessibility while maintaining a professional tone.

- **Data Tables:** Use `surface_container` for the header row and a simple `divide-y` approach for rows. No vertical lines.



### 6. Do's and Don'ts

- **Do:** Use Lora for any text that represents a person's name or a significant title.

- **Do:** Maintain generous padding (p-8) for main containers to preserve the "Editorial" feel.

- **Don't:** Use rounded corners larger than 8px (except for full-pill badges). The system should feel structured and architectural, not "bubbly."

- **Don't:** Use pure black (#000). Always use `on_surface` (#1C1917) for text to maintain the vellum-ink contrast.