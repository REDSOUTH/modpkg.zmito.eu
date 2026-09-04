# MODPKG — Design System & UI/UX Guidelines

This document defines the authoritative design standards, color mappings, component guidelines, and interaction rules for the MODPKG application.

---

## 1. Color Palette & Accent System

| Feature / Domain | Primary Accent | Accent Hex | Tailwind Classes | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Global App & Editor** | Orange | `#FE5000` | `bg-[#FE5000]`, `text-[#FE5000]`, `border-[#FE5000]` | Modpack Editor, primary CTA buttons, brand identity |
| **Custom Content** | Blue | `#3B82F6` | `bg-blue-500`, `text-blue-400`, `shadow-blue-500/20` | Custom Content tab in My Resources, direct URL downloads, resource items |
| **Custom Files** | Amber / Yellow | `#F59E0B` | `bg-amber-400`, `text-amber-400`, `shadow-amber-400/20` | Custom Files tab in My Resources, configuration files, scripts, overrides |

### Accent Rules
- **Custom Content**: ALWAYS use Blue accents (`bg-blue-500`, `text-blue-400`) for active tabs, primary action buttons, dialog highlights, and filter badges.
- **Custom Files**: ALWAYS use Amber accents (`bg-amber-400`, `text-amber-400`) for active tabs, primary action buttons, dialog highlights, and badges.
- **Hover States**: Keep hover states **subtle and standardized**. Avoid text or border color shifts to bright accent colors on row or button hovers. Prefer subtle background opacity changes (`hover:bg-[#1E1E1E]/50`, `hover:bg-white/10`, `hover:text-white`).

---

## 2. Component Standardization & Parity

### Principle: Reusability First
- **Never duplicate table structures or dialog layouts.** If a component exists or can be unified (e.g. `ResourcesTable` or `ResourceOptionsSection`), ALWAYS use the shared component.
- **Exact Visual Parity**: Features of similar nature must look and behave identically across tabs and modals.

### Data Tables (`ResourcesTable`)
- Standardized container: `rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] shadow-2xl`
- Standardized header row: `bg-[#121212]/80 text-[11px] font-bold text-white/40 uppercase tracking-wider`
- Standardized row hover: `hover:bg-[#1E1E1E]/40 transition-colors group` (row text remains clean white `text-white`, no color shifting on hover).
- Subtitles & Monospace paths: Monospace paths use `font-mono text-[11px] text-white/70 bg-[#1E1E1E] px-2.5 py-1 rounded-lg`.

---

## 3. Contextual UI Rules

### Global Library Context (My Resources) vs Package Editor Context
- **Standalone Global Context (`MyResourcesPage`)**:
  - Actions like *"Add directly to current package"* or *"Save in My Resources"* are **hidden** inside dialogs because there is no target package active and the user is already inside the global library.
  - Only global sync options (e.g. *"Save to REDSOUTH Account"*) are rendered.
- **Active Package Editor Context**:
  - Full destination options are rendered (*"Add directly to current package"*, *"Save in My Resources"*, *"Save to REDSOUTH Account"*).

---

## 4. Modal & Dialog Standards

- **Dialog Size**: `sm:max-w-4xl` for feature dialogs.
- **Body Layout**: 2-column grid (`grid-cols-1 md:grid-cols-2 gap-6`) wrapped inside a Radix `ScrollArea` with `max-h-[75vh]`.
- **Options Section**: Shared `ResourceOptionsSection` component with section label `<label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Storage & Options</label>`.
- **Primary Buttons**: Filled background (`bg-blue-500` or `bg-amber-400`), height `h-11`, rounded `rounded-xl`, with click feedback (`active:scale-95 duration-200`).
- **Secondary / Cancel Buttons**: Ghost button `text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11`.

---

## 5. Micro-interactions & Animations

- Use `framer-motion` for table row transitions (`initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}`).
- Primary CTA buttons should include tactile click feedback: `active:scale-95 transition-all duration-200`.
