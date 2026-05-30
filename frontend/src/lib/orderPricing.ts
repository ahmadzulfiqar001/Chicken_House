export type DeliveryMode = "Delivery" | "Takeaway";
export type DeliveryCity = "Renala Khurd" | "Okara" | "Mitchell's Area" | "Other";

const normalize = (value: string) => value.trim().toLowerCase();

export const calculateDeliveryFee = ({
  orderType,
  city,
  address,
  subtotal,
}: {
  orderType: DeliveryMode;
  city?: string;
  address?: string;
  subtotal: number;
}) => {
  if (orderType === "Takeaway") {
    return 0;
  }

  const combined = `${city ?? ""} ${address ?? ""}`.toLowerCase();

  if (subtotal >= 5000) {
    return 0;
  }

  if (combined.includes("renala")) {
    return subtotal >= 2500 ? 90 : 120;
  }

  if (combined.includes("okara") || combined.includes("mitchell")) {
    return subtotal >= 2500 ? 140 : 180;
  }

  return subtotal >= 2500 ? 170 : 220;
};

export const estimateFulfillmentWindow = (orderType: DeliveryMode) =>
  orderType === "Takeaway" ? "15-20 mins pickup" : "25-35 mins delivery";

export const supportedDeliveryCities: DeliveryCity[] = [
  "Renala Khurd",
  "Okara",
  "Mitchell's Area",
  "Other",
];

export const validateCheckoutDetails = ({
  name,
  email,
  phone,
  address,
  city,
  paymentMethod,
  orderType,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  orderType: DeliveryMode;
}) => {
  if (normalize(name).length < 2) {
    return "Please enter the customer name.";
  }

  if (!normalize(email).includes("@")) {
    return "Please enter a valid email address.";
  }

  if (!/^\+?[0-9\s-]{10,16}$/.test(phone.trim())) {
    return "Please enter a valid phone number.";
  }

  if (orderType === "Delivery" && normalize(address).length < 8) {
    return "Please enter a complete delivery address.";
  }

  if (!normalize(city)) {
    return "Please enter the delivery city.";
  }

  if (!normalize(paymentMethod)) {
    return "Please choose a payment method.";
  }

  return "";
};
