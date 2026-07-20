import { redirect } from "next/navigation";

export default async function LegacyPublicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/publications/${slug}`);
}
