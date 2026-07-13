"use client";

import type { GeneratedArtifact } from "@/data/ministryValueJourneyData";
import { primaryButton } from "./MinistryControlTowerParts";

export type DocumentSectionData = {
  title: string;
  items: Array<{ label: string; value: string }>;
};

export type GeneratedDocument = {
  title: string;
  documentType: string;
  perimeter