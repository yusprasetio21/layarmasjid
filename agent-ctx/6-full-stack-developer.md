---
Task ID: 6
Agent: full-stack-developer
Task: Build mobile-friendly SettingsPanel component

Work Log:
- Created SettingsPanel.tsx with auth flow and settings dashboard
- Implemented all 6 configuration sections using shadcn/ui Accordion
- Added device pairing with 4-digit ID + password via InputOTP
- Login screen with register dialog for new devices
- Settings Dashboard with sticky header, scrollable content, and fixed save button
- Section A: Nama Masjid & Tanggal (name inputs, font selects, size sliders, date color picker, opacity toggle)
- Section B: Jam Utama (digital/analog toggle, font selects, size sliders, analog number style and size buttons)
- Section C: Jadwal Sholat & Sidebar (auto/manual mode, editable prayer times with add/remove, sidebar width slider, card color grid, show sidebar toggle)
- Section D: Mode Adhan & Iqomah (enable toggles, duration select, font select, size slider, beep toggle, iqomah minutes slider with quick buttons)
- Section E: Teks Berjalan (show toggle, animation style grid, speed slider, announcement textarea)
- Section F: Tema & Tampilan (theme card buttons with color preview, display toggles for Hijri date, countdown, sound)
- Made fully responsive for mobile devices (mobile-first dark theme with amber accents)
- Integrated with Zustand store (useMasjidStore) and useDevice hook
- ESLint passes with 0 errors on the new file

Stage Summary:
- File: /home/z/my-project/src/components/masjid/SettingsPanel.tsx
- All settings sections implemented
- Mobile-first responsive design with dark zinc-950 background and amber-500 accents
- Auth flow with login + register dialog
- Sticky save button with gradient amber styling
