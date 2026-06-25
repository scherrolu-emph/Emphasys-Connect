---
story: 001-ai-briefing-banner-stream
unit: 011-ai-briefing-banner
intent: 001-construction-milestone-workspace
priority: must
status: complete
bolt: '014'
---

# Story: AI Briefing Banner — Role-Aware Streaming Catch-Up

## User Story

As an **HFA staff member or Developer** logging into Emphasys Connect, I want to see a smart catch-up banner at the top of my home screen that summarises what has happened since my last visit, so that I can immediately understand what needs my attention without navigating through multiple screens.

## Acceptance Criteria

- [ ] Banner appears automatically at the top of Dashboard (HFA) / My Cases (Developer) on every page load
- [ ] A skeleton shimmer is shown for ~300ms before text begins
- [ ] Summary text streams in character-by-character (typewriter effect at ~12ms/char)
- [ ] HFA sees: case activity, overdue prerequisites, unanswered developer messages
- [ ] Developer sees: HFA acceptances, newly active prerequisites, overdue uploads
- [ ] 2–3 action chips appear after streaming completes, each navigating to a relevant screen
- [ ] Tapping ✕ dismisses the banner for the session (page refresh restores it)
- [ ] Tapping ✨ in the toolbar replays the banner

## Notes

- Bolt 014: dummy pre-written strings — no API call
- Bolt 015: replace dummy strings with real Claude API call via Supabase Edge Function
