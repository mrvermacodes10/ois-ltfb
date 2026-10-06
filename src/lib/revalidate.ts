import { revalidatePath } from "next/cache";

export function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/teams");
  revalidatePath("/players");
  revalidatePath("/matches");
  revalidatePath("/standings");
  revalidatePath("/top-scorers");
  revalidatePath("/motm");
  revalidatePath("/awards");
  revalidatePath("/announcements");
  revalidatePath("/history");
  revalidatePath("/2v2");
  revalidatePath("/player-id");
}
