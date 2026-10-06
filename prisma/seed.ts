import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------
// REAL data migrated from the OIS LTFB Google Site
// (https://sites.google.com/oberoi-is.net/ois30lunchtimefooty), audited
// directly before writing this file. NOT fictional sample data.
//
// Known gaps / assumptions, exactly as found on the Google Site:
//  - No year was given for match/MOTM dates — assumed 2026 (the current
//    season). Change dates in Admin if this is wrong.
//  - "Amay" and "Ishaan" appear on the Team List page but have no full
//    surname or photo on the Players page — seeded with their short name
//    only. Fill in full details via Admin → Players.
//  - "Abir Lahoty" is registered (on the Players page) but not assigned to
//    either team on the Team List page — seeded as unassigned.
//  - The 28th August MOTM entry ("Kabir/Nishil") has NO matching result on
//    the Match Results page — seeded as a match with that date and MOTMs,
//    but no score. Fill in the score via Admin if you have it.
//  - No individual numeric Player IDs were visible in extractable form on
//    the Google Site — ltfbId is left blank for every player.
//  - Semester Award winners were blank for both semesters on the live
//    site — seeded as the real award categories with no winner (TBD),
//    not invented.
// ---------------------------------------------------------------------

const TEAM1_ROSTER: { short: string; full: string }[] = [
  { short: "Neel", full: "Neel Verma" },
  { short: "Naman", full: "Naman Nagori" },
  { short: "Nishil", full: "Nishil Parwani" },
  { short: "Amay", full: "Amay" },
  { short: "Ishaan", full: "Ishaan" },
  { short: "Kabir", full: "Kabir Hariani" },
  { short: "Chouha", full: "Reean Chouhadry" },
  { short: "Vivaan Parekh", full: "Vivaan Parekh" },
  { short: "Vivaan Shetty", full: "Vivaan Shetty" },
  { short: "Aditya", full: "Aditya Shah" },
  { short: "Khanna", full: "Riaan Khanna" },
];

const TEAM2_ROSTER: { short: string; full: string }[] = [
  { short: "Kiyaan", full: "Kiyaan Gupta" },
  { short: "Ganeri", full: "Vivan Ganeriwal" },
  { short: "Raghav", full: "Raghav Ramachandran" },
  { short: "Kuku", full: "Sarthak Kukreja" },
  { short: "Mohak", full: "Mohak Sanghai" },
  { short: "Giri", full: "Giridhari Kaushik" },
  { short: "Nandi", full: "Ayaan Nandi" },
  { short: "Zahaan", full: "Zahaan Hemrajani" },
];

const UNASSIGNED_ROSTER: { short: string; full: string }[] = [{ short: "Abir", full: "Abir Lahoty" }];

// date (2026), scoreTeam1, scoreTeam2
const MATCH_RESULTS: { date: string; scoreA: number; scoreB: number }[] = [
  { date: "2026-08-20", scoreA: 10, scoreB: 5 },
  { date: "2026-08-21", scoreA: 5, scoreB: 5 },
  { date: "2026-08-24", scoreA: 6, scoreB: 8 },
  { date: "2026-08-25", scoreA: 4, scoreB: 16 },
  { date: "2026-08-26", scoreA: 5, scoreB: 5 },
  { date: "2026-08-27", scoreA: 7, scoreB: 5 },
  { date: "2026-09-18", scoreA: 4, scoreB: 5 },
  { date: "2026-09-21", scoreA: 6, scoreB: 13 },
  { date: "2026-09-22", scoreA: 3, scoreB: 3 },
  { date: "2026-09-28", scoreA: 9, scoreB: 12 },
  { date: "2026-09-30", scoreA: 2, scoreB: 4 },
];

// date -> short names of MOTM(s), exactly as recorded (some dates shared)
const MOTM_BY_DATE: Record<string, string[]> = {
  "2026-08-20": ["Naman", "Nishil"],
  "2026-08-21": ["Nishil", "Neel"],
  "2026-08-24": ["Kiyaan"],
  "2026-08-25": ["Kiyaan"],
  "2026-08-26": ["Ganeri"],
  "2026-08-27": ["Kuku"],
  "2026-08-28": ["Kabir", "Nishil"], // no matching result — see note above
  "2026-09-21": ["Ganeri"],
  "2026-09-22": ["Naman"],
  "2026-09-30": ["Ganeri"],
};

// short name -> Semester 1 goals, from the real Top Scorer Chart
const TOP_SCORERS_SEM1: { short: string; goals: number }[] = [
  { short: "Nishil", goals: 28 },
  { short: "Ganeri", goals: 25 },
  { short: "Kiyaan", goals: 18 },
  { short: "Kuku", goals: 13 },
  { short: "Raghav", goals: 12 },
  { short: "Naman", goals: 12 },
  { short: "Mohak", goals: 6 },
  { short: "Kabir", goals: 6 },
  { short: "Chouha", goals: 6 },
  { short: "Abir", goals: 6 },
  { short: "Neel", goals: 4 },
  { short: "Vivaan Parekh", goals: 4 },
  { short: "Khanna", goals: 3 },
  { short: "Amay", goals: 1 },
];

const SEMESTER_AWARD_NAMES = [
  "MVP (Messi Award)",
  "Top Scorer (CR7 Award)",
  "Best Goalkeeper (Yashin Award)",
  "Most Entertaining Player (Neymar Award)",
  "Most Clutch Player (Zidane Award)",
  "Best Defender (Ramos Award)",
];

async function main() {
  console.log("Seeding OIS Lunchtime Footy with real migrated data...");

  // ---- Admin user ----
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, passwordHash: await bcrypt.hash(adminPassword, 10) },
  });

  // ---- Settings ----
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      announcementBanner: "Welcome to the new LTFB website — all your stats, now in one place.",
      playerIdInfo:
        "Player ID registration details were not available in extractable form on the old Google Site. Add your registration/Player ID instructions here.",
    },
  });

  // ---- Season ----
  const season = await prisma.season.upsert({
    where: { name: "2026/27" },
    update: {},
    create: { name: "2026/27", isCurrent: true },
  });

  if (await prisma.team.count()) {
    console.log("Teams already exist — skipping the rest of the real-data seed (safe to re-run).");
  } else {
    // ---- Teams ----
    const team1 = await prisma.team.create({ data: { name: "Team 1" } });
    const team2 = await prisma.team.create({ data: { name: "Team 2" } });

    // ---- Players ----
    const playerByShort = new Map<string, { id: string }>();
    for (const p of TEAM1_ROSTER) {
      const created = await prisma.player.create({ data: { name: p.full, teamId: team1.id } });
      playerByShort.set(p.short, created);
    }
    for (const p of TEAM2_ROSTER) {
      const created = await prisma.player.create({ data: { name: p.full, teamId: team2.id } });
      playerByShort.set(p.short, created);
    }
    for (const p of UNASSIGNED_ROSTER) {
      const created = await prisma.player.create({ data: { name: p.full } });
      playerByShort.set(p.short, created);
    }
    console.log(`Seeded ${playerByShort.size} real players across 2 teams (+1 unassigned).`);

    // ---- Matches + MOTMs ----
    const matchByDate = new Map<string, { id: string }>();
    for (const m of MATCH_RESULTS) {
      const created = await prisma.match.create({
        data: {
          seasonId: season.id,
          teamAId: team1.id,
          teamBId: team2.id,
          scoreA: m.scoreA,
          scoreB: m.scoreB,
          date: new Date(m.date),
          status: "COMPLETED",
        },
      });
      matchByDate.set(m.date, created);
    }
    // The flagged 28th August date — MOTM recorded, no score on the source site.
    const aug28 = await prisma.match.create({
      data: {
        seasonId: season.id,
        teamAId: team1.id,
        teamBId: team2.id,
        date: new Date("2026-08-28"),
        status: "COMPLETED",
        notes: "Score not recorded on the original Google Site — only the MOTM was listed. Fill in the score if known.",
      },
    });
    matchByDate.set("2026-08-28", aug28);
    console.log(`Seeded ${matchByDate.size} real matches (including the one flagged missing-score date).`);

    for (const [date, shorts] of Object.entries(MOTM_BY_DATE)) {
      const match = matchByDate.get(date);
      if (!match) continue;
      for (const short of shorts) {
        const player = playerByShort.get(short);
        if (!player) continue;
        await prisma.matchMotm.create({ data: { matchId: match.id, playerId: player.id } }).catch(() => {});
      }
    }
    console.log("Seeded real MOTM history.");

    // ---- Goals (from the Semester 1 Top Scorer Chart) ----
    // The chart gives season totals, not per-match attribution, so goals
    // are attached to the LATEST seeded match as a practical way to make
    // them count toward the real totals immediately — admin can redistribute
    // them across specific matches later via Admin → Matches if desired.
    const latestMatch = [...matchByDate.values()][matchByDate.size - 1];
    for (const ts of TOP_SCORERS_SEM1) {
      const player = playerByShort.get(ts.short);
      if (!player) continue;
      for (let i = 0; i < ts.goals; i++) {
        await prisma.matchEvent.create({ data: { matchId: latestMatch.id, playerId: player.id, type: "GOAL" } });
      }
    }
    console.log("Seeded real Semester 1 goal totals (attributed to the most recent match — see note in seed.ts).");

    // ---- Semester Awards (real categories, blank winners — matches the live site) ----
    for (const semester of ["Semester 1", "Semester 2"]) {
      for (const name of SEMESTER_AWARD_NAMES) {
        await prisma.award.create({
          data: { name, category: semester, seasonId: season.id },
        });
      }
    }
    console.log("Seeded real Semester Award categories (winners left blank, matching the live Google Site).");

    // ---- A starter 2v2 pair + result, clearly sample data (not from the Google Site) ----
    const neel = playerByShort.get("Neel");
    const nishil = playerByShort.get("Nishil");
    if (neel && nishil) {
      const pair = await prisma.twoVTwoPair.create({
        data: { name: "Neel & Nishil", player1Id: neel.id, player2Id: nishil.id },
      });
      await prisma.twoVTwoResult.create({
        data: { seasonId: season.id, date: new Date(), winningPairId: pair.id, notes: "Sample 2v2 result — the Google Site had no existing 2v2 data, this is a brand new section." },
      });
      console.log("Seeded one SAMPLE 2v2 pair/result (the 2v2 league is brand new — no Google Site data existed for it).");
    }
  }

  console.log("");
  console.log("=================================================");
  console.log(`Admin login  ->  username: "${adminUsername}"   password: "${adminPassword}"`);
  console.log("=================================================");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
