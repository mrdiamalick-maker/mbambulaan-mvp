import { redirect } from "next/navigation";

export default function LegacyPrivateSpacePage() {
  redirect("/connexion");
}
