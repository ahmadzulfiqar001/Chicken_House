import {
  Calendar,
  Heart,
  PartyPopper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

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
    image:
      "https://cdn.pixabay.com/photo/2019/01/03/09/35/table-3911237_1280.jpg",
  },
  {
    id: "engagement",
    name: "Engagement",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500",
    summary: "Elegant setups for intimate and formal ceremonies.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "birthday",
    name: "Birthday",
    icon: PartyPopper,
    color: "bg-yellow-500/10 text-yellow-500",
    summary: "Celebration-friendly tables, platters, and custom notes.",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500",
    summary: "Team dinners, business lunches, and hosted meetings.",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "other",
    name: "Other Event",
    icon: Calendar,
    color: "bg-primary/10 text-primary",
    summary: "Flexible arrangements for custom gatherings and requests.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "indoor",
    name: "Grand Hall",
    capacity: 150,
    description: "Air-conditioned banquet-style hall for elegant event hosting.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "rooftop",
    name: "Rooftop Terrace",
    capacity: 100,
    description: "Scenic elevated setup for evening dinners and celebrations.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop",
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

export const bookingHeroImage =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1800&auto=format&fit=crop";

export const bookingInspirationLinks = {
  wedding: "https://pixabay.com/photos/table-wedding-banquet-chair-hall-4736377/",
  banquet: "https://pixabay.com/photos/banquet-hall-wedding-dinner-5120991/",
  garden: "https://in.pinterest.com/parthaksarathi/garden-lunches/",
  rooftop: "https://www.pinterest.com/pin/rustic-rooftop-dinner-set-up-goals--1477812373348144/",
  birthday: "https://www.pinterest.com/ideas/birthday-dinner-at-restaurant/903835240193/",
};
