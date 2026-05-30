const normalize = (value: string) => value.trim().toLowerCase();

export const calculateDeliveryFee = ({
  orderType,
  city,
  address,
  subtotal,
}: {
  orderType: string;
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

export const validateOrderPayload = ({
  customer,
  customerEmail,
  customerPhone,
  orderType,
  deliveryAddress,
  paymentMethod,
  details,
  subtotal,
  total,
}: {
  customer: string;
  customerEmail: string;
  customerPhone: string;
  orderType: string;
  deliveryAddress: string;
  paymentMethod: string;
  details: unknown[];
  subtotal: number;
  total: number;
}) => {
  if (normalize(customer).length < 2) {
    return "Please enter the customer name.";
  }

  if (!normalize(customerEmail).includes("@")) {
    return "Please enter a valid email address.";
  }

  if (!/^\+?[0-9\s-]{10,16}$/.test(customerPhone.trim())) {
    return "Please enter a valid phone number.";
  }

  if (!details.length) {
    return "Add at least one menu item before checkout.";
  }

  if (orderType === "Delivery" && normalize(deliveryAddress).length < 8) {
    return "Please enter a complete delivery address.";
  }

  if (!normalize(paymentMethod)) {
    return "Please choose a payment method.";
  }

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return "Order subtotal is invalid.";
  }

  if (!Number.isFinite(total) || total <= 0) {
    return "Order total is invalid.";
  }

  return "";
};
