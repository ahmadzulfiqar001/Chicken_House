const round = (value: number) => Number(value.toFixed(2));

type FinanceTransactionLike = {
  id: string;
  type: string;
  amount: number;
  source: string;
  date: string;
  category: string;
};

type OrderLike = {
  id: string;
  total?: number;
  subtotal?: number;
  deliveryFee?: number;
  status?: string;
  time?: string;
  paymentMethod?: string;
  type?: string;
};

const isValidDate = (value?: string) => {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const isOrderCountedAsRevenue = (order: OrderLike) => {
  const status = String(order.status ?? "").toLowerCase();
  return status !== "cancelled" && status !== "rejected";
};

const normalizeAmount = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const startOfDay = (date: Date) => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildDayBuckets = (days: number) => {
  const today = startOfDay(new Date());
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    return {
      key: date.toISOString().slice(0, 10),
      date,
      label: new Intl.DateTimeFormat("en-PK", { weekday: "short" }).format(date),
      sales: 0,
      expenses: 0,
      otherIncome: 0,
    };
  });
};

const buildMonthBuckets = (months: number) => {
  const now = new Date();
  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      date,
      label: new Intl.DateTimeFormat("en-PK", { month: "short" }).format(date),
      sales: 0,
      expenses: 0,
      otherIncome: 0,
    };
  });
};

export const buildFinanceSummary = (
  transactions: FinanceTransactionLike[],
  orders: OrderLike[],
) => {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const dayBuckets = buildDayBuckets(7);
  const monthBuckets = buildMonthBuckets(6);

  let todaySales = 0;
  let monthSales = 0;
  let todayExpenses = 0;
  let monthExpenses = 0;
  let todayOtherIncome = 0;
  let monthOtherIncome = 0;

  orders.forEach((order) => {
    if (!isOrderCountedAsRevenue(order) || !isValidDate(order.time)) {
      return;
    }

    const amount = normalizeAmount(order.total ?? order.subtotal);
    const orderDate = new Date(String(order.time));

    if (isSameDay(orderDate, today)) {
      todaySales += amount;
    }

    if (isSameMonth(orderDate, monthStart)) {
      monthSales += amount;
    }

    const dayBucket = dayBuckets.find((bucket) => isSameDay(bucket.date, orderDate));
    if (dayBucket) {
      dayBucket.sales += amount;
    }

    const monthBucket = monthBuckets.find((bucket) => isSameMonth(bucket.date, orderDate));
    if (monthBucket) {
      monthBucket.sales += amount;
    }
  });

  const expenseCategoryMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (!isValidDate(transaction.date)) {
      return;
    }

    const amount = normalizeAmount(transaction.amount);
    const txDate = new Date(transaction.date);
    const category = String(transaction.category ?? "General").trim() || "General";
    const txType = String(transaction.type ?? "").toLowerCase();

    if (txType === "debit") {
      if (isSameDay(txDate, today)) {
        todayExpenses += amount;
      }

      if (isSameMonth(txDate, monthStart)) {
        monthExpenses += amount;
      }

      expenseCategoryMap.set(category, round((expenseCategoryMap.get(category) ?? 0) + amount));
    } else if (txType === "credit" && !String(transaction.source ?? "").toLowerCase().startsWith("order ")) {
      if (isSameDay(txDate, today)) {
        todayOtherIncome += amount;
      }

      if (isSameMonth(txDate, monthStart)) {
        monthOtherIncome += amount;
      }
    }

    const dayBucket = dayBuckets.find((bucket) => isSameDay(bucket.date, txDate));
    if (dayBucket) {
      if (txType === "debit") {
        dayBucket.expenses += amount;
      } else if (!String(transaction.source ?? "").toLowerCase().startsWith("order ")) {
        dayBucket.otherIncome += amount;
      }
    }

    const monthBucket = monthBuckets.find((bucket) => isSameMonth(bucket.date, txDate));
    if (monthBucket) {
      if (txType === "debit") {
        monthBucket.expenses += amount;
      } else if (!String(transaction.source ?? "").toLowerCase().startsWith("order ")) {
        monthBucket.otherIncome += amount;
      }
    }
  });

  const expenseBreakdown = Array.from(expenseCategoryMap.entries())
    .map(([category, amount]) => ({ category, amount: round(amount) }))
    .sort((left, right) => right.amount - left.amount);

  const totalExpenses = transactions
    .filter((transaction) => String(transaction.type).toLowerCase() === "debit")
    .reduce((sum, transaction) => sum + normalizeAmount(transaction.amount), 0);

  const otherIncome = transactions
    .filter(
      (transaction) =>
        String(transaction.type).toLowerCase() === "credit" &&
        !String(transaction.source ?? "").toLowerCase().startsWith("order "),
    )
    .reduce((sum, transaction) => sum + normalizeAmount(transaction.amount), 0);

  const orderRevenue = orders
    .filter((order) => isOrderCountedAsRevenue(order))
    .reduce((sum, order) => sum + normalizeAmount(order.total ?? order.subtotal), 0);

  const totalRevenue = round(orderRevenue + otherIncome);
  const netProfit = round(totalRevenue - totalExpenses);

  return {
    overview: {
      todaySales: round(todaySales),
      monthSales: round(monthSales),
      todayExpenses: round(todayExpenses),
      monthExpenses: round(monthExpenses),
      todayNet: round(todaySales + todayOtherIncome - todayExpenses),
      monthNet: round(monthSales + monthOtherIncome - monthExpenses),
      totalRevenue,
      totalExpenses: round(totalExpenses),
      netProfit,
      profitMargin: totalRevenue > 0 ? round((netProfit / totalRevenue) * 100) : 0,
    },
    dailySeries: dayBuckets.map((bucket) => ({
      label: bucket.label,
      sales: round(bucket.sales),
      expenses: round(bucket.expenses),
      otherIncome: round(bucket.otherIncome),
      profit: round(bucket.sales + bucket.otherIncome - bucket.expenses),
    })),
    monthlySeries: monthBuckets.map((bucket) => ({
      label: bucket.label,
      sales: round(bucket.sales),
      expenses: round(bucket.expenses),
      otherIncome: round(bucket.otherIncome),
      profit: round(bucket.sales + bucket.otherIncome - bucket.expenses),
    })),
    expenseBreakdown,
    profitLoss: {
      orderRevenue: round(orderRevenue),
      otherIncome: round(otherIncome),
      totalRevenue,
      totalExpenses: round(totalExpenses),
      netProfit,
    },
  };
};
