const packageRates: Record<string, number> = {
  silver: 1500,
  gold: 2500,
  platinum: 4000,
  custom: 0,
};

const zoneCapacities: Record<string, number> = {
  outdoor: 200,
  indoor: 150,
  rooftop: 100,
};

export const calculateQuotedBookingPrice = (packageId: string, guests: number) => {
  const rate = packageRates[packageId] ?? 0;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return rate * guests;
};

export const validateBookingPayload = ({
  customerName,
  customerEmail,
  customerPhone,
  eventType,
  zone,
  guests,
  packageId,
  date,
  time,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  zone: string;
  guests: number;
  packageId: string;
  date: string;
  time: string;
}) => {
  if (customerName.trim().length < 2) {
    return "Please enter the guest name.";
  }

  if (!customerEmail.includes("@")) {
    return "Please enter a valid email address.";
  }

  if (!/^\+?[0-9\s-]{10,16}$/.test(customerPhone.trim())) {
    return "Please enter a valid contact number.";
  }

  if (!eventType || !zone || !packageId || !date || !time) {
    return "Please complete all booking details.";
  }

  if (!Number.isFinite(guests) || guests < 1) {
    return "Guest count must be at least 1.";
  }

  const maxCapacity = zoneCapacities[zone];
  if (maxCapacity && guests > maxCapacity) {
    return `Guest count exceeds the selected venue capacity of ${maxCapacity}.`;
  }

  const bookingDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(bookingDate.getTime())) {
    return "Please choose a valid booking date and time.";
  }

  if (bookingDate.getTime() < Date.now() - 5 * 60 * 1000) {
    return "Please choose a future booking time.";
  }

  return "";
};
