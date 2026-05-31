import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  CreditCard,
  Download,
  LineChart,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useToast } from "../layout/ToastProvider";

type Transaction = {
  id: string;
  type: "Credit" | "Debit";
  amount: number;
  source: string;
  date: string;
  category: string;
};

type FinanceSummary = {
  overview: {
    todaySales: number;
    monthSales: number;
    todayExpenses: number;
    monthExpenses: number;
    todayNet: number;
    monthNet: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  dailySeries: Array<{
    label: string;
    sales: number;
    expenses: number;
    otherIncome: number;
    profit: number;
  }>;
  monthlySeries: Array<{
    label: string;
    sales: number;
    expenses: number;
    otherIncome: number;
    profit: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  profitLoss: {
    orderRevenue: number;
    otherIncome: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
};

const emptyForm = {
  type: "Credit" as "Credit" | "Debit",
  amount: "0",
  source: "",
  date: "",
  category: "General",
};

const categoryOptions = [
  "Sales",
  "Inventory",
  "Utilities",
  "Payroll",
  "Marketing",
  "Maintenance",
  "Rent",
  "Delivery",
  "General",
] as const;

const expenseColors = ["#d24a15", "#141414", "#f27d26", "#2b6cb0", "#0f8b6d", "#9b2c2c"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const AccountsModule = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Credit" | "Debit">("All");
  const [chartWindow, setChartWindow] = useState<"daily" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchFinanceData = async (preserveState = true) => {
    if (!preserveState || transactions.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [transactionsResponse, summaryResponse] = await Promise.all([
        fetch("/api/finance"),
        fetch("/api/finance/summary"),
      ]);

      const [transactionsData, summaryData] = await Promise.all([
        transactionsResponse.json(),
        summaryResponse.json(),
      ]);

      if (!transactionsResponse.ok) {
        throw new Error(transactionsData.message ?? "Finance transactions could not be loaded.");
      }

      if (!summaryResponse.ok) {
        throw new Error(summaryData.message ?? "Finance summary could not be loaded.");
      }

      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Finance records could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchFinanceData(false);
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesSearch = [item.id, item.source, item.category, item.type]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "All" || item.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [transactions, searchTerm, typeFilter],
  );

  const chartData = chartWindow === "daily" ? summary?.dailySeries ?? [] : summary?.monthlySeries ?? [];

  const totalCredits = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "Credit")
        .reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [transactions],
  );

  const totalDebits = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "Debit")
        .reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [transactions],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      source: transaction.source,
      date: transaction.date.slice(0, 10),
      category: transaction.category,
    });
    setShowForm(true);
  };

  const saveTransaction = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        source: form.source.trim(),
        date: form.date || new Date().toISOString(),
        category: form.category.trim() || "General",
      };

      const response = await fetch(editing ? `/api/finance/${editing.id}` : "/api/finance", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Transaction could not be saved.");
      }

      await fetchFinanceData();
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      showToast({
        tone: "success",
        title: editing ? "Transaction updated" : "Transaction created",
        description: `${payload.source} was saved successfully.`,
      });
    } catch (saveError) {
      console.error(saveError);
      const message = saveError instanceof Error ? saveError.message : "Transaction could not be saved.";
      setError(message);
      showToast({
        tone: "error",
        title: "Save failed",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Transaction could not be deleted.");
      }

      await fetchFinanceData();
      showToast({
        tone: "success",
        title: "Transaction deleted",
        description: "The transaction was removed successfully.",
      });
    } catch (deleteError) {
      console.error(deleteError);
      const message = deleteError instanceof Error ? deleteError.message : "Transaction could not be deleted.";
      setError(message);
      showToast({
        tone: "error",
        title: "Delete failed",
        description: message,
      });
    }
  };

  const exportCsv = () => {
    const summaryLines = [
      ["Metric", "Value"],
      ["Today Sales", String(summary?.overview.todaySales ?? 0)],
      ["Monthly Sales", String(summary?.overview.monthSales ?? 0)],
      ["Monthly Expenses", String(summary?.overview.monthExpenses ?? 0)],
      ["Net Profit", String(summary?.overview.netProfit ?? 0)],
      ["Profit Margin", `${summary?.overview.profitMargin ?? 0}%`],
      [],
      ["Transaction ID", "Type", "Amount", "Source", "Category", "Date"],
    ];

    const transactionLines = filteredTransactions.map((item) => [
      item.id,
      item.type,
      String(item.amount),
      item.source,
      item.category,
      item.date,
    ]);

    const csv = [...summaryLines, ...transactionLines]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll(`"`, `""`)}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chicken-house-finance-${chartWindow}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      tone: "success",
      title: "Export ready",
      description: "The finance report was downloaded as CSV.",
    });
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showForm ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onSubmit={saveTransaction}
              className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Finance Entry</p>
                  <h3 className="mt-2 text-3xl font-bold text-dark">
                    {editing ? "Edit transaction" : "Add transaction"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-muted transition hover:text-dark"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, type: event.target.value as "Credit" | "Debit" }))
                  }
                  className="rounded-2xl bg-surface px-5 py-4 outline-none transition focus:bg-white"
                >
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
                <input
                  value={form.amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none transition focus:bg-white"
                  placeholder="Amount"
                  type="number"
                  min="0"
                />
                <input
                  value={form.source}
                  onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none transition focus:bg-white"
                  placeholder="Source or reason"
                />
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none transition focus:bg-white"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="rounded-2xl bg-surface px-5 py-4 outline-none transition focus:bg-white md:col-span-2"
                  type="date"
                />
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white shadow-lg shadow-primary/20"
                >
                  {saving ? "Saving..." : editing ? "Update Transaction" : "Create Transaction"}
                </button>
              </div>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-dark">Sales & Finance</h2>
          <p className="text-muted">
            Monitor daily sales, monthly performance, expenses, profit and loss, and transaction activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void fetchFinanceData()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-bold text-dark transition hover:border-primary hover:text-primary"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-3 font-bold text-white transition hover:bg-primary"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            New Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <ArrowUpRight size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Daily Sales</p>
          <h3 className="mt-2 text-2xl font-display font-bold text-dark">
            {formatCurrency(summary?.overview.todaySales ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-muted">Sales captured from active orders today.</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarRange size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Monthly Sales</p>
          <h3 className="mt-2 text-2xl font-display font-bold text-dark">
            {formatCurrency(summary?.overview.monthSales ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-muted">Current month sales performance.</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ArrowDownRight size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Monthly Expenses</p>
          <h3 className="mt-2 text-2xl font-display font-bold text-dark">
            {formatCurrency(summary?.overview.monthExpenses ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-muted">Recorded debit transactions for this month.</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Net Profit</p>
          <h3 className="mt-2 text-2xl font-display font-bold text-dark">
            {formatCurrency(summary?.overview.netProfit ?? 0)}
          </h3>
          <p className="mt-2 text-sm text-muted">
            Margin: {summary?.overview.profitMargin ?? 0}% across available finance records.
          </p>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[2.8rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-dark">Sales trend report</h3>
              <p className="text-sm text-muted">
                Compare sales, expenses, and net performance over time.
              </p>
            </div>
            <div className="rounded-full bg-surface p-1">
              {(["daily", "monthly"] as const).map((window) => (
                <button
                  key={window}
                  onClick={() => setChartWindow(window)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    chartWindow === window ? "bg-primary text-white" : "text-muted hover:text-dark"
                  }`}
                >
                  {window === "daily" ? "Daily" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ece7" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 18, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                />
                <Legend iconType="circle" />
                <Bar name="Sales" dataKey="sales" fill="#d24a15" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar name="Expenses" dataKey="expenses" fill="#141414" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar name="Profit" dataKey="profit" fill="#0f8b6d" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.8rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-dark">Expense breakdown</h3>
              <p className="text-sm text-muted">Current expense categories by recorded value.</p>
            </div>
            <BarChart3 size={22} className="text-primary" />
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.expenseBreakdown ?? []} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1ece7" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#141414" }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 18, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={28}>
                  {(summary?.expenseBreakdown ?? []).map((entry, index) => (
                    <Cell key={entry.category} fill={expenseColors[index % expenseColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.55fr_0.95fr]">
        <div className="overflow-hidden rounded-[2.8rem] border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-8 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-dark">Transaction ledger</h3>
              <p className="text-sm text-muted">Track credits, debits, dates, and finance categories.</p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative min-w-[260px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full rounded-full bg-surface py-3 pr-4 pl-12 outline-none transition focus:bg-white"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "All" | "Credit" | "Debit")}
                className="rounded-full bg-surface px-5 py-3 outline-none transition focus:bg-white"
              >
                <option value="All">All types</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-surface text-xs font-bold uppercase tracking-widest text-muted">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Source</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/40">
                    <td className="px-8 py-5 font-mono text-sm text-dark">{item.id}</td>
                    <td className="px-8 py-5">
                      <span className="block font-bold text-dark">{item.source}</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-muted">{item.category}</td>
                    <td className="px-8 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.type === "Credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-dark">{formatCurrency(item.amount)}</td>
                    <td className="px-8 py-5 text-sm text-muted">
                      {new Date(item.date).toLocaleDateString("en-PK", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => void deleteTransaction(item.id)}
                          className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredTransactions.length === 0 ? (
              <div className="p-10 text-center text-muted">No finance records matched the current filters.</div>
            ) : null}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.8rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-dark">Profit & loss</h3>
                <p className="text-sm text-muted">A quick summary of revenue, costs, and net position.</p>
              </div>
              <LineChart size={22} className="text-primary" />
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4">
                <span className="text-muted">Order revenue</span>
                <span className="font-bold text-dark">{formatCurrency(summary?.profitLoss.orderRevenue ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4">
                <span className="text-muted">Other income</span>
                <span className="font-bold text-dark">{formatCurrency(summary?.profitLoss.otherIncome ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4">
                <span className="text-muted">Total expenses</span>
                <span className="font-bold text-dark">{formatCurrency(summary?.profitLoss.totalExpenses ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white">
                <span className="font-semibold">Net profit / loss</span>
                <span className="text-xl font-display font-bold">{formatCurrency(summary?.profitLoss.netProfit ?? 0)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2.8rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-dark">Quick totals</h3>
                <p className="text-sm text-muted">Ledger totals from finance entries.</p>
              </div>
              <CreditCard size={22} className="text-primary" />
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-green-50 px-5 py-4">
                <span className="text-green-700">Credits recorded</span>
                <span className="font-bold text-green-700">{formatCurrency(totalCredits)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-red-50 px-5 py-4">
                <span className="text-red-600">Debits recorded</span>
                <span className="font-bold text-red-600">{formatCurrency(totalDebits)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4">
                <span className="text-muted">Transaction count</span>
                <span className="font-bold text-dark">{transactions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsModule;
