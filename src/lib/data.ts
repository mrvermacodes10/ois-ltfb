import { prisma } from "./prisma";

export async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function getCurrentSeason() {
  let season = await prisma.season.findFirst({ where: { isCurrent: true } });
  if (!season) season = await prisma.season.findFirst({ orderBy: { createdAt: "desc" } });
  return season;
}

export async function logActivity(action: string, detail?: string) {
  await prisma.adminActivity.create({ data: { action, detail } });
}
