import { redirect } from "next/navigation";

// Threads now lives with Instagram and Facebook under each account on Subpages
export default function ThreadsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  redirect(`/admin/subpages?page=${searchParams.account ?? searchParams.page ?? "nikahin_foreigner"}&view=inbox`);
}
