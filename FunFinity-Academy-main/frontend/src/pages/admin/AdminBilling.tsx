import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, Download, FileText, CheckCircle2, Clock, Send, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Sep", amount: 0 }, { month: "Oct", amount: 0 }, { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 }, { month: "Jan", amount: 0 }, { month: "Feb", amount: 0 },
];

const invoices: any[] = [];

const statusStyle: Record<string, string> = {
  Paid: "text-green-600 bg-green-50 border-green-200",
  Overdue: "text-destructive bg-destructive/10 border-destructive/20",
  Pending: "text-accent bg-accent/10 border-accent/20",
};

const plans = [
  { name: "Basic", price: "$199/mo", students: "Up to 50", features: ["Core courses", "Basic analytics", "Email support"] },
  { name: "Pro", price: "$299/mo", students: "Up to 200", features: ["All courses", "Advanced analytics", "Live classes", "Priority support"], current: true },
  { name: "Enterprise", price: "$499/mo", students: "Unlimited", features: ["Everything in Pro", "Custom branding", "API access", "Dedicated manager"] },
];

export default function AdminBilling() {
  const [tab, setTab] = useState<"invoices" | "plans">("invoices");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Billing & Invoicing</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage subscriptions, invoices, and revenue tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="heroOutline" size="default"><Download className="w-4 h-4 mr-2" /> Export</Button>
            <Button variant="hero" size="default"><Send className="w-4 h-4 mr-2" /> Send Invoice</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Revenue (Feb)", value: "$0", icon: DollarSign, color: "accent" },
            { label: "Paid Invoices", value: "0", icon: CheckCircle2, color: "cyan" },
            { label: "Overdue", value: "0", icon: Clock, color: "destructive" },
            { label: "Paying Families", value: "0", icon: Users, color: "magenta" },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.color}/10 mb-3`}>
                <s.icon className={`w-4 h-4 text-${s.color}`} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="platform-card p-6 mb-4">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-4">
          {(["invoices", "plans"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${tab === t ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:bg-secondary/50"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "invoices" ? (
          <div className="platform-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Parent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground text-sm">No invoices found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, i) => (
                      <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3"><span className="text-sm font-medium text-primary">{inv.id}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-foreground">{inv.student}</span></td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-muted-foreground">{inv.parent}</span></td>
                        <td className="px-4 py-3"><span className="text-sm font-bold text-foreground">{inv.amount}</span></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle[inv.status]}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{inv.date}</span></td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-primary"><FileText className="w-3 h-3 mr-1" /> View</Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`platform-card p-6 ${plan.current ? "border-primary/30 bg-primary/5" : ""}`}>
                {plan.current && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mb-3 inline-block">CURRENT PLAN</span>}
                <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{plan.price}</p>
                <p className="text-xs text-muted-foreground mb-4">{plan.students}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-3 h-3 text-cyan shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.current ? "heroOutline" : "hero"} size="default" className="w-full">
                  {plan.current ? "Manage Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
