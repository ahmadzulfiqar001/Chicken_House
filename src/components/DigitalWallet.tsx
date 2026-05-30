import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Plus, QrCode, Wallet } from "lucide-react";

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  reason: string;
  time: string;
};

type DigitalWalletProps = {
  balance: number;
  loyaltyPoints: number;
  transactions: WalletTransaction[];
  onTopUp: (amount: number) => void;
};

const quickTopUps = [1000, 2500, 5000, 10000];

const DigitalWallet = ({
  balance,
  loyaltyPoints,
  transactions,
  onTopUp,
}: DigitalWalletProps) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[3rem] bg-primary p-10 text-white shadow-2xl shadow-primary/25"
      >
        <div className="relative z-10">
          <div className="mb-12 flex items-start justify-between gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Wallet size={32} />
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl bg-white/20 p-3 backdrop-blur-md transition hover:bg-white/30">
                <QrCode size={22} />
              </button>
              <button className="rounded-xl bg-white/20 p-3 backdrop-blur-md transition hover:bg-white/30">
                <CreditCard size={22} />
              </button>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">Wallet Balance</p>
            <h2 className="mt-3 font-display text-5xl font-bold">Rs. {balance.toLocaleString()}</h2>
            <p className="mt-3 text-sm text-white/70">Loyalty points: {loyaltyPoints.toLocaleString()}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickTopUps.map((amount) => (
              <button
                key={amount}
                onClick={() => onTopUp(amount)}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-md transition hover:bg-white hover:text-primary"
              >
                + Rs. {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute -right-10 -bottom-8 h-56 w-56 rounded-full bg-white/10 blur-[90px]" />
        <div className="absolute -left-8 top-0 h-48 w-48 rounded-full bg-accent/20 blur-[80px]" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { name: "Top Up", icon: Plus, color: "bg-green-500" },
          { name: "Rewards", icon: ArrowUpRight, color: "bg-blue-500" },
          { name: "Spend", icon: ArrowDownLeft, color: "bg-orange-500" },
          { name: "Cards", icon: CreditCard, color: "bg-purple-500" },
        ].map((action) => (
          <div
            key={action.name}
            className="group rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color} text-white shadow-lg transition group-hover:scale-110`}>
              <action.icon size={22} />
            </div>
            <p className="mt-4 text-sm font-bold text-dark">{action.name}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-dark">Recent Activity</h3>
          <span className="text-xs font-bold uppercase tracking-[0.26em] text-muted">
            Wallet History
          </span>
        </div>

        <div className="space-y-5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-2xl bg-surface p-4 transition hover:bg-primary/5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                    tx.type === "Top-up" ? "bg-green-500" : "bg-primary"
                  }`}
                >
                  {tx.type === "Top-up" ? <Plus size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                <div>
                  <p className="font-bold text-dark">{tx.reason}</p>
                  <p className="text-xs text-muted">{new Date(tx.time).toLocaleString("en-PK")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${tx.type === "Top-up" ? "text-green-500" : "text-dark"}`}>
                  {tx.type === "Top-up" ? "+" : "-"} Rs. {tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">{tx.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalWallet;
