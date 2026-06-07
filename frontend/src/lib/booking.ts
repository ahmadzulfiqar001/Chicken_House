import {
  Calendar,
  Heart,
  PartyPopper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

const cafeWeddingSetup = new URL("../../assets/source-images/Cafe Images/crockery setting.png", import.meta.url).href;
const cafeEngagementSetup = new URL("../../assets/source-images/Cafe Images/get to gether.png", import.meta.url).href;
const cafeBirthdaySetup = new URL("../../assets/source-images/Cafe Images/birthday sequence.png", import.meta.url).href;
const cafeCorporateSetup = new URL("../../assets/source-images/Cafe Images/class 10 farewull.png", import.meta.url).href;
const cafeFamilyDining = new URL("../../assets/source-images/Cafe Images/eating in cafe.png", import.meta.url).href;
const cafeOutdoorZone = new URL("../../assets/source-images/Cafe Images/sitting lawn.png", import.meta.url).href;
const cafeIndoorZone = new URL("../../assets/source-images/Cafe Images/indor sitting.png", import.meta.url).href;
const cafePlayAreaZone = new URL("../../assets/source-images/Cafe Images/sitting with play area.png", import.meta.url).href;
const cafeBookingHero = new URL("../../assets/source-images/Cafe Images/crockery.png", import.meta.url).href;

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export const eventTypes: Array<{
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  summary: string;
  image: string;
}> = [
  {
    id: "wedding",
    name: "Wedding",
    icon: Heart,
    color: "bg-red-500/10 text-red-500",
    summary: "Signature family functions with banquet-style service.",
    image: cafeWeddingSetup,
  },
  {
    id: "engagement",
    name: "Engagement",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500",
    summary: "Elegant setups for intimate and formal ceremonies.",
    image: cafeEngagementSetup,
  },
  {
    id: "birthday",
    name: "Birthday",
    icon: PartyPopper,
    color: "bg-yellow-500/10 text-yellow-500",
    summary: "Celebration-friendly tables, platters, and custom notes.",
    image: cafeBirthdaySetup,
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500",
    summary: "Team dinners, business lunches, and hosted meetings.",
    image: cafeCorporateSetup,
  },
  {
    id: "other",
    name: "Other Event",
    icon: Calendar,
    color: "bg-primary/10 text-primary",
    summary: "Flexible arrangements for custom gatherings and requests.",
    image: cafeFamilyDining,
  },
];

export const zones: Array<{
  id: string;
  name: string;
  capacity: number;
  description: string;
  image: string;
}> = [
  {
    id: "outdoor",
    name: "Outdoor Garden",
    capacity: 200,
    description: "Open-air family seating with fresh ambience and group flexibility.",
    image: cafeOutdoorZone,
  },
  {
    id: "indoor",
    name: "Grand Hall",
    capacity: 150,
    description: "Air-conditioned banquet-style hall for elegant event hosting.",
    image: cafeIndoorZone,
  },
  {
    id: "rooftop",
    name: "Family Play Area",
    capacity: 100,
    description: "Family seating beside the play area for relaxed evening dinners and celebrations.",
    image: cafePlayAreaZone,
  },
];

export const menuPackages: Array<{
  id: string;
  name: string;
  pricePerHead: number;
  items: string[];
  highlight: string;
}> = [
  {
    id: "silver",
    name: "Silver Package",
    pricePerHead: 1500,
    items: ["1 Main", "1 Side", "1 Drink"],
    highlight: "Best for compact family bookings",
  },
  {
    id: "gold",
    name: "Gold Package",
    pricePerHead: 2500,
    items: ["2 Mains", "2 Sides", "2 Drinks", "1 Dessert"],
    highlight: "Balanced choice for premium events",
  },
  {
    id: "platinum",
    name: "Platinum Package",
    pricePerHead: 4000,
    items: ["3 Mains", "3 Sides", "Unlimited Drinks", "2 Desserts"],
    highlight: "Full-service setup for flagship functions",
  },
];

export const bookingStatuses: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

export const bookingStatusStyles: Record<BookingStatus, string> = {
  Pending: "bg-yellow-500/10 text-yellow-600",
  Confirmed: "bg-blue-500/10 text-blue-600",
  Completed: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-500",
};

export const bookingTimeSlots = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export const guestPresets = [10, 25, 50, 75, 100, 150, 200];

export const getEventTypeLabel = (id: string) =>
  eventTypes.find((item) => item.id === id)?.name ?? id;

export const getZoneLabel = (id: string) =>
  zones.find((item) => item.id === id)?.name ?? id;

export const getPackageLabel = (id: string) =>
  menuPackages.find((item) => item.id === id)?.name ?? id;

export const getPackagePrice = (id: string) =>
  menuPackages.find((item) => item.id === id)?.pricePerHead ?? 0;

export const getZoneCapacity = (id: string) =>
  zones.find((item) => item.id === id)?.capacity ?? 0;

export const formatBookingTime = (value: string) => {
  if (!value) return "";
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString ?? "0");

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${meridiem}`;
};

export const bookingHeroImage = cafeBookingHero;
