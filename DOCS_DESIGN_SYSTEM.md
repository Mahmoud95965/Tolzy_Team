# Tolzy Documentation Design System Specification

This document defines the visual language and component standards for the Tolzy Documentation platform, inspired by modern SaaS aesthetics (Claude, Stripe, Notion).

---

## 1. Spacing & Layout

We use a modular spacing scale based on a 4px grid.

### Grid & Containers
- **Content Max Width:** `760px` (Optimized for readability).
- **Sidebar Width:** `288px` (`w-72`).
- **TOC Width:** `256px` (`w-64`).
- **Page Gutters:** `16px` (mobile), `32px` (tablet), `48px` (desktop).

### Spacing Scale (Tailwind defaults)
- **Extra Small:** `4px` (`gap-1`), `8px` (`p-2`, `gap-2`).
- **Small:** `12px` (`p-3`, `gap-3`), `16px` (`p-4`, `gap-4`).
- **Medium:** `24px` (`p-6`, `my-6`), `32px` (`p-8`, `my-8`).
- **Large:** `64px` (`mb-16`), `80px` (`py-20`).
- **Section Gap:** `96px` (`space-y-24`).

---

## 2. Typography

Focused on clarity, hierarchy, and Arabic readability.

### Typeface
- **Primary:** `Almarai` (Sans-serif, Arabic optimized).
- **Secondary:** System UI / Inter (Fallback).
- **Monospace:** `JetBrains Mono` / `Courier New` (Code).

### Hierarchy
- **H1 (Page Title):** `36px-48px` (`text-4xl` to `text-5xl`), Font-black, Tracking-tight.
- **H2 (Section):** `24px-30px` (`text-2xl` to `text-3xl`), Font-black.
- **H3 (Subsection):** `20px` (`text-xl`), Font-bold.
- **Body (Lead):** `18px` (`text-lg`), Leading-relaxed.
- **Body (Standard):** `16px` (`text-[16px]`), Leading-8 (Line height: 2).
- **Caption/Small:** `14px` (`text-sm`), `13px` (`text-[13px]`).
- **Overline/Label:** `10px` (`text-[10px]`), Bold, Uppercase, Tracking-widest.

---

## 3. Color Palette

A clean, high-contrast palette with soft neutral backgrounds.

### Core Surfaces
- **App Background:** `#FDFDFD` (Light) | `#050507` (Dark).
- **Card/Modal Surface:** `#FFFFFF` (Light) | `#0D1117` (Dark).
- **Code Block Background:** `#0d1117` (Unified dark theme).

### Brand & Status
- **Primary (Indigo):** `indigo-600` (#4F46E5).
- **Success (Emerald):** `emerald-500` (#10B981).
- **Warning (Amber):** `amber-500` (#F59E0B).
- **Danger (Rose):** `rose-500` (#F43F5E).

### Neutrals (Slate)
- **Primary Text:** `slate-900` (Light) | `white` (Dark).
- **Secondary Text:** `slate-600` (Light) | `slate-400` (Dark).
- **Muted Text:** `slate-500` (Light) | `slate-500` (Dark).
- **Subtle Borders:** `slate-200` (Light) | `slate-800/60` (Dark).

---

## 4. Components

### Sidebar Navigation
- **Structure:** Grouped sections with overline labels.
- **Interactive State:**
  - Active: `bg-indigo-50`, `text-indigo-700`, `font-semibold`.
  - Hover: `bg-slate-100`.
- **Icons:** Line-style (`lucide-react`), 16px size.

### Sticky Header (Nav)
- **Height:** `56px` (`h-14`).
- **Style:** `backdrop-blur-md`, semi-transparent background.
- **Search Trigger:** Large input-style button with `Cmd+K` keyboard shortcut hint.

### Code Block
- **Container:** `rounded-xl`, `border-slate-800`, `bg-[#0d1117]`.
- **Header:** Darker sub-surface (`#161b22`) containing language label and Copy button.
- **Content:** Syntax-highlighted text, horizontal scrollable.

### Callouts (Alerts)
- **Design:** `rounded-xl`, `border`, `p-5`, leading icon.
- **Logic:** Background and border color must match the status variant (soft opacity).
- **Variants:** `info`, `warning`, `tip`, `error`.

### Buttons
- **Primary:** `rounded-lg`, `bg-indigo-600`, `text-white`, `font-bold`, `shadow-sm`.
- **Ghost/Tertiary:** `text-slate-500`, `hover:bg-slate-100`, `p-2`.
- **Badge:** `rounded-md`, `text-[10px]`, `font-bold`, `border`, `uppercase`.

---

## 5. Interactions

- **Smooth Scroll:** Enabled globally for anchor links.
- **Transitions:** `duration-300`, `ease-in-out` for hover states and sidebar toggles.
- **Modals:** `framer-motion` scale-in and fade animations.
- **Focus:** Indigo ring for keyboard navigation.
