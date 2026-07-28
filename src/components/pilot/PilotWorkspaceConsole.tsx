"use client";

import { useState } from "react";
import Link from "next/link";
import { FieldCommerceConsole } from "@/components/commercial/FieldCommerceConsole";
import { CommercialIncidentConsole } from "@/components/commercial/CommercialIncidentConsole";

type PilotTab = "operations" | "incident" | "preuves" | "decision";

const tabs: Array<{ key: Pilot