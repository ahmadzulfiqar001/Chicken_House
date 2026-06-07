import { Mail, MapPinned, MessageCircle, Phone } from "lucide-react";

const cafeBrandingImage = new URL("../../assets/source-images/Cafe Images/chick branding.png", import.meta.url).href;
const cafeFrontImage = new URL("../../assets/source-images/Cafe Images/front.png", import.meta.url).href;
const cafeIndoorImage = new URL("../../assets/source-images/Cafe Images/indor sitting.png", import.meta.url).href;
const cafeLocationImage = new URL("../../assets/source-images/Cafe Images/location 1.jpg", import.meta.url).href;
const cafeLiveKitchenVideo = new URL("../../assets/source-images/Cafe Images/live kitchen.mp4", import.meta.url).href;

export const siteConfig = {
  brandName: "Chicken House",
  tagline: "A Symbol of Quality & Freshness",
  phone: "+92 345 7493339",
  email: "info@chickenhouse.pk",
  whatsappNumber: "923457493339",
  addressLine1: "Near Mitchell's Fair Price Shop, GT Road",
  addressLine2: "Close to Mitchell's Fruit Farm",
  city: "Renala Khurd, Okara",
  neighborhood: "Renala Khurd",
  hours: "11:00 AM - 12:00 AM",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Chicken+House+Renala+Khurd+GT+Road",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Chicken+House+Renala+Khurd+GT+Road&output=embed",
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
  // Local payment accounts shown at checkout for the non-cash methods.
  // `method` matches the value selected in the checkout payment dropdown.
  bankAccounts: [
    {
      method: "Easypaisa",
      bank: "Easypaisa",
      accountTitle: "Chicken House",
      accountNumber: "0312-3456789",
      note: "Include your order ID in the transaction",
    },
    {
      method: "JazzCash",
      bank: "JazzCash",
      accountTitle: "Chicken House",
      accountNumber: "0300-1234567",
      note: "Include your order ID in the transaction",
    },
    {
      method: "Bank Transfer (HBL)",
      bank: "HBL",
      accountTitle: "Chicken House",
      accountNumber: "12345678901",
      note: "Include your order ID in the transaction",
    },
  ],
  imageFallback: cafeBrandingImage,
  aboutHeroImage: cafeFrontImage,
  aboutAmbienceImage: cafeIndoorImage,
  contactHeroImage: cafeLocationImage,
  heroVideo: cafeLiveKitchenVideo,
  storyPillars: [
    {
      title: "Built for Everyday Dining",
      detail:
        "The brand experience is designed for regular family meals, takeaway convenience, and dependable delivery support.",
    },
    {
      title: "Easy Landmark Access",
      detail:
        "Customers can reach the restaurant quickly through the GT Road location near Mitchell's Fruit Farm and Fair Price Shop.",
    },
    {
      title: "Restaurant + Digital Flow",
      detail:
        "Menu browsing, checkout, order tracking, bookings, and customer contact are kept inside one clean ecosystem.",
    },
  ],
  trustPoints: [
    "Live menu pricing and structured ordering flow",
    "Booking requests go directly into the admin booking queue",
    "WhatsApp, phone, and map access are available from the public site",
    "Customer-facing pages are tuned for mobile, tablet, and desktop use",
  ],
} as const;

export const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const hasConfiguredUrl = (value?: string) =>
  Boolean(value && /^https?:\/\//.test(value) && !/https?:\/\/(www\.)?(facebook|instagram|x)\.com\/?$/.test(value));

export const socialMediaLinks = [
  {
    label: "Facebook",
    href: siteConfig.socialLinks.facebook,
  },
  {
    label: "Instagram",
    href: siteConfig.socialLinks.instagram,
  },
  {
    label: "Updates",
    href: siteConfig.socialLinks.twitter,
  },
].filter((item) => hasConfiguredUrl(item.href));

export const connectChannels = [
  {
    label: "Call",
    href: `tel:${siteConfig.phone.replace(/\s+/g, "")}`,
    description: siteConfig.phone,
    icon: Phone,
  },
  {
    label: "Email",
    href: `mailto:${siteConfig.email}`,
    description: siteConfig.email,
    icon: Mail,
  },
  {
    label: "WhatsApp",
    href: buildWhatsAppUrl("Hello Chicken House, I need help with my order, booking, or location."),
    description: "Fast support for delivery, menu, and bookings",
    icon: MessageCircle,
  },
  {
    label: "Maps",
    href: siteConfig.googleMapsUrl,
    description: `${siteConfig.addressLine1}, ${siteConfig.city}`,
    icon: MapPinned,
  },
];
