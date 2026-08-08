# iOS Shortcuts Alarm Integration Plan

## Goal
Bridge PiTrack's existing ICS calendar export with iOS native **Clock alarm alerts** (full-screen interrupt) using the iPhone Shortcuts app.

---

## Background

PiTrack already exports reminders as `.ics` files to the iPhone Calendar app.  
The problem: Calendar events only show a **banner notification**, not a full-screen alarm alert.  
The solution: Use **iPhone Shortcuts** + the `Create Alarm` action to turn Calendar events into real Clock alarms.

---

## Code Change Required (PiTrack side)

### File to edit
`src/screens/PlannerScreen.tsx` (or wherever the ICS export function lives)

### What to change
Add a `[PiTrack]` prefix to every exported ICS event title so iPhone Shortcuts can reliably filter only PiTrack events.

**Before:**
```ts
SUMMARY:${reminder.title}
```

**After:**
```ts
SUMMARY:[PiTrack] ${reminder.title}
```

### Why this matters
The Shortcut automation uses a keyword filter (`title contains "[PiTrack]"`) to target only PiTrack Calendar events and ignore everything else on the user's Calendar.

---

## iPhone Shortcuts Setup (user does once)

### Option A — Manual Shortcut (on-demand)

The user creates a Shortcut and saves it to their Home Screen:

```
Shortcut Name: "PiTrack Alarm"

Steps:
1. Find Calendar Events
   → Calendar: All Calendars
   → Filter: Title contains "[PiTrack]"
   → Sort: Start Date (ascending)
   → Limit: 10

2. Choose from List
   → Prompt: "Which PiTrack reminder to set alarm for?"

3. Get Dates from [Chosen Event]
   → Type: Start Date

4. Format Date
   → Format: HH:mm (time only)

5. Create Alarm
   → Time: [formatted time from step 4]
   → Label: [event title from step 2]
   → Enabled: Yes
```

**Result:** User taps shortcut → picks reminder → real Clock alarm is set → full-screen alert fires at the right time.

---

### Option B — Automatic Shortcut (runs without user input)

The user creates a **Personal Automation** in Shortcuts:

```
Trigger: "Calendar Event Starts"
  → Calendar: All Calendars
  → Event Title Contains: "[PiTrack]"
  → Time Before Event: 0 minutes (or 5/10/15 min before)
  → Run Immediately: ON (no confirmation required)

Actions:
1. Get Current Calendar Event
2. Get Start Date from [Event]
3. Format Date → HH:mm
4. Create Alarm
   → Time: [formatted time]
   → Label: "PiTrack: " + [event title]
   → Enabled: Yes
```

**Result:** Every time a `[PiTrack]` calendar event is about to start, iOS automatically creates a Clock alarm — no user interaction needed.

---

## User Flow End-to-End

```
User adds reminder in PiTrack Planner
        ↓
Taps "Export to Calendar" → downloads .ics file
        ↓
Opens .ics → saves to iPhone Calendar
  (title: "[PiTrack] Electricity - 6:00 PM")
        ↓
iPhone Shortcuts automation detects [PiTrack] event
        ↓
Shortcut creates Clock alarm for that time
        ↓
At alarm time: full-screen Clock alert fires
  with sound + snooze button
```

---

## Notes

- The `Create Alarm` action requires **iOS 13.1+**
- Automation running without confirmation requires **iOS 14.3+**
- The PWA must be installed on the Home Screen for ICS export to work cleanly
- Shortcuts automations set to "Run Immediately" do NOT require the user to tap a banner to confirm — they fire silently in the background

---

## Implementation Checklist

- [ ] Update ICS export in `PlannerScreen.tsx` to prefix title with `[PiTrack]`
- [ ] Test ICS import on iPhone Calendar
- [ ] Set up Option A shortcut and test
- [ ] Set up Option B automation and test
- [ ] Push changes to GitHub
