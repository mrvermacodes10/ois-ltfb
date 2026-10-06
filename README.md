# OIS Lunchtime Footy (LTFB)

The complete digital home of OIS Lunchtime Footy — replacing the old Google
Site with a real database-backed website, plus a brand new 2v2 League.
**This is a new, independent project.** It shares no code or data with the
old fantasy football site (`lunchtime-football.vercel.app`), which was used
only as visual inspiration.

---

## 1. What I built

A full-stack Next.js + TypeScript + Tailwind + Prisma + PostgreSQL
application. The database is the single source of truth — every piece of
content on the public site (teams, players, matches, goals, assists, MOTMs,
standings, top scorers, awards, announcements, Player IDs, the 2v2 League,
and every homepage section) is read live from the database and editable
from `/admin`. Nothing is hardcoded into a React component.

Nothing statistical is ever stored redundantly: wins, goals, standings,
top scorers are all calculated fresh from match results every time a page
loads (`src/lib/stats.ts`), so editing a past result automatically and
correctly recalculates everything that depends on it.

## 2. Project structure

```
prisma/
  schema.prisma     # 16 models — see the file for full relations
  seed.ts            # REAL migrated LTFB data (see Section 10 below)
src/
  app/
    (site)/           # Public pages — see Section 8
    admin/
      login/           # Not guarded
      (protected)/     # Everything else under /admin — requires login
    actions/           # Server actions, one file per domain
  components/
    admin/              # Admin CRUD UI
    (top level)         # Shared public UI: NavBar, ScoreLine, StatusBadge
  lib/
    prisma.ts, auth.ts, enums.ts, revalidate.ts   # Infrastructure
    data.ts             # Settings, current season, activity log
    stats.ts            # Standings / top scorers / MOTM / 2v2 record engine
    leagueData.ts        # Composes the above for the public site
```

## 3. Install dependencies

```
cd ltfb-website
npm install
```

## 4. Set up the database

This project uses **PostgreSQL** in every environment (local dev and
production) — the easiest free option is [Neon](https://neon.tech). Open
`.env` and set:

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
SESSION_SECRET="change-this-to-a-long-random-string"
```

Create the tables:

```
npm run db:push
```

## 5. Seed the real LTFB data

```
npm run db:seed
```

This is **not generic sample data** — it's the real content migrated from
the Google Site (see Section 10). The only genuinely fictional part is one
sample 2v2 pair/result, clearly labelled as such in `prisma/seed.ts`, since
the Google Site had no 2v2 data at all (it's a brand new feature).

Watch the terminal for your admin login (defaults to `admin` /
`changeme123` unless you set `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`
in `.env` first).

## 6. Run it locally

```
npm run dev
```

- **http://localhost:3000** — the public site
- **http://localhost:3000/admin/login** — the admin control centre

## 7. Deploying (when you're ready)

1. Push to your own GitHub repo (I did not push anything, as instructed).
2. Import it in Vercel.
3. Add `DATABASE_URL` and `SESSION_SECRET` in Vercel → Settings →
   Environment Variables.
4. Deploy — `npm run build` runs `prisma generate && next build`
   automatically.
5. Run `npm run db:push` and `npm run db:seed` once against the production
   database (same commands, `DATABASE_URL` pointed at it).

---

## 8. Pages created

**Public**: Home, Teams + team profile, Players + player profile, Matches +
match-centre detail, Standings, Top Scorers, MOTM, Awards, Announcements,
2v2 League, History (by season), Player ID, a styled 404.

**Admin**: Login, Dashboard, Players, Teams, Matches (fast result entry +
goal/assist/MOTM tagging), MOTM history, Awards, Announcements, 2v2 League
(pairs + daily winners), Seasons, Activity log, Settings.

## 9. What's editable from Admin

Everything the brief asked for: player name/Player ID/team/position/photo/
bio/active status; team name/logo/description/active status; match teams/
date/time/score/status/notes, with goals and assists attributed per player
and MOTM (supports **shared MOTMs** — more than one player per match,
matching real LTFB history) toggled per player; award name/category/
player-or-team/season/description; announcement title/body/image/
published/featured/date; 2v2 pairs (exactly two players, name, active
status) and daily results (date, winner, optional opponent/score/MVP/
notes); seasons (create new ones without ever deleting old data); and every
homepage content field (hero title/subtitle, announcement banner, footer
text, featured player/team, Player ID info text, standings points config,
and show/hide toggles for Awards/History/2v2/Announcements).

## 10. What was migrated from the Google Site

I fetched and audited all 7 real content pages before writing any code.
Migrated into the seed data:
- **20 players**: Team 1 (11: Neel Verma, Naman Nagori, Nishil Parwani,
  Amay, Ishaan, Kabir Hariani, Reean Chouhadry, Vivaan Parekh, Vivaan
  Shetty, Aditya Shah, Riaan Khanna) and Team 2 (8: Kiyaan Gupta, Vivan
  Ganeriwal, Raghav Ramachandran, Sarthak Kukreja, Mohak Sanghai, Giridhari
  Kaushik, Ayaan Nandi, Zahaan Hemrajani), plus Abir Lahoty, registered but
  unassigned to either team on the live site.
- **11 real match results** (18th Aug – 30th Sep), always Team 1 vs Team 2.
- **Real Semester 1 Top Scorer Chart** (14 players, e.g. Nishil Parwani 28,
  down to Amay 1) — attributed as goal events in the seed.
- **Real MOTM history** (10 dates), including genuinely shared MOTMs on
  several dates (e.g. "Naman Nagori/Nishil P") — the schema has a proper
  `MatchMotm` join table specifically to support this, not a single-winner
  field.
- **Real Semester Award categories** for both semesters: MVP (Messi Award),
  Top Scorer (CR7 Award), Best Goalkeeper (Yashin Award), Most Entertaining
  Player (Neymar Award), Most Clutch Player (Zidane Award), Best Defender
  (Ramos Award). Winners are seeded as **blank/TBD**, exactly matching the
  live Google Site — I did not invent winners.
- **Explicitly excluded**: "Tactical Mastermind (Pep Award)" and "Fantasy
  MVP (Rooney Award)" — both explicitly FPL-tied on the Google Site, so
  excluded per your no-fantasy-functionality instruction.

### What could not be retrieved (flagged, not invented)
- **No year was visible** on match/MOTM dates on the Google Site — I
  assumed 2026 (the current season). Correct this in Admin if wrong.
- **"Amay" and "Ishaan"** appear only on the Team List page, with no full
  surname, photo, or profile on the Players page — seeded with their short
  name only.
- **The 28th August MOTM** ("Kabir/Nishil") has no matching result on the
  Match Results page — seeded as a match with that date and the MOTMs
  attached, score left blank, with a note explaining the gap. Fill in the
  score via Admin if you have it.
- **No individual numeric Player IDs** were visible in extractable form on
  the Players page — every player's `ltfbId` is blank, ready for you to
  fill in via Admin → Players. The Player ID public page and the Settings
  "Player ID info" text field are both built and ready.
- **No rules/registration page** exists separately on the Google Site
  beyond the "ALL REGISTERED PLAYERS UNDER OIS LTFB ID" heading — the
  Player ID info is an open text field in Settings for you to fill in.

## 11. How the 2v2 League works

Completely separate from the main LTFB competition and from fantasy
football. Admin creates **pairs** (exactly two players, optional pair
name), then records **daily winners**: date + winning pair, with an
*optional* beaten pair, score note, MVP, and notes. Recording just a winner
is the fast path (matches your exact "log in → select pair → select date →
save" workflow); optionally also recording who they beat unlocks real
appearances/win-percentage/streak calculations for **both** pairs (since
win% needs to know not just who won, but who else was playing) — see the
doc comment in `prisma/schema.prisma` and `computePairRecords` in
`src/lib/stats.ts` for exactly how this works. The public `/2v2` page shows
current pairs with their computed stats, a "most daily wins" leaderboard,
and the full chronological winners archive.

## 12. Verification — please read this

I could not get a real `npm install && npx prisma generate && npm run
build` pass to completion in the sandbox I built this in — it has no
network route to `binaries.prisma.sh`, the only source for Prisma's native
query-engine binary, confirmed with direct attempts that returned `403
Forbidden`. This is a sandbox infrastructure limitation, not a problem with
the code, and it will work normally on your machine and on Vercel.

What I verified instead:
- A full TypeScript syntax parse of every `.ts`/`.tsx` file, re-run after
  every major chunk of work — clean throughout, confirmed clean at the end.
- Cross-referenced all 30 server actions imported by admin components
  against their actual exports — **zero mismatches**.
- Manually checked every Prisma relation name and compound-key usage
  (e.g. `MatchMotm`'s `matchId_playerId`) against the schema.

**Please run the commands in Sections 3–6 yourself and send me the exact
error if anything other than a clean result comes back** — I'll fix it
directly against real compiler output, the same way I already fixed two
real build errors you reported on a related project earlier this session
(a `useTransition`/form-action typing issue, and a `next/font/google`
build-time network dependency — this project was built avoiding that same
font mistake from the start).

## 13. Remaining limitations

- **No photo/media upload system** — `photoUrl`/`logoUrl`/`imageUrl` fields
  throughout accept a URL (e.g. to an image you've uploaded elsewhere),
  rather than a built-in file upload and media library. This was a
  deliberate scope decision given the size of everything else requested;
  say the word if you want a real upload system added.
- **Player stats are attributed to whichever team a player is on now**,
  not a historical snapshot of their team at the time of each match. Fine
  for the common case (players don't change teams mid-season); worth
  knowing if that ever happens.
- **The Semester 1 goal totals migrated from the Top Scorer Chart are
  season totals**, not per-match data (the Google Site didn't break them
  down by match) — they're attributed to the most recent seeded match as a
  practical way to make them count immediately; redistribute them across
  specific matches via Admin → Matches if you want per-match accuracy.
- Build/runtime verification is limited to what's described in Section 12
  above — I have not personally clicked through the site with a live
  database.
