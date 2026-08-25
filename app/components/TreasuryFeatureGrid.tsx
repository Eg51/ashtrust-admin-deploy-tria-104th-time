import Link from "next/link";
import {
  Wallet,
  Landmark,
  ShieldCheck,
  LineChart,
  Blocks,
  ChevronRight,
} from "lucide-react";

// ---- Data ---------------------------------------------------------------

const smallFeatures = [
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    description:
      "Military-grade encryption and multi-factor biometric authentication for all corporate movements.",
    highlighted: true,
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description:
      "Forecasting models that anticipate cash flow needs before they occur using proprietary AI.",
    highlighted: true,
  },

];

// ---- Component ------------------------------------------------------------

export default function TreasuryFeatureGrid() {
  return (
    <section className="w-full from-blue-200 via-cyan-200 shadow-xl to-purple-200 px-6 py-16 text-[#0a0e17]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Institutional Treasury — large card */}
        <div className="relative overflow-hidden shadow-xl rounded-2xl bg-cyan-400/[0.06] border-slate-500 p-7">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-900">
            <Wallet size={18} strokeWidth={2} />
          </span>
          <h3 className="mt-5 text-lg text-cyan-900 font-bold">Institutional Treasury</h3>
          <p className="mt-2 max-w-xs text-sm font-bold leading-relaxed text-slate-500">
            Optimize your working capital with automated sweeping, high-yield
            commercial accounts, and global multi-currency and crypto management tools.
          </p>

          <div className="mt-8  flex gap-10">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-slate-500">
                CURRENT APY
              </p>
              <p className="mt-1 text-base font-bold text-cyan-400">
                4.85%*
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wide text-slate-500">
                SWEEP VELOCITY
              </p>
              <p className="mt-1 text-base font-bold text-cyan-400">
                Real-Time
              </p>
            </div>
          </div>
        </div>

        {/* Global Payments — large card */}
        <div className="flex flex-col justify-between shadow-xl rounded-2xl border-none bg-cyan-400/[0.06] p-7">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-900">
              <Landmark size={18} strokeWidth={2} />
            </span>
            <h3 className="mt-5 text-xl text-cyan-900 font-bold">Global Payments</h3>
            <p className="mt-2 max-w-xs font-bold text-sm leading-relaxed text-slate-500">
              Execute cross-border transactions across 140+ countries with
              mid-market rates and zero hidden fees.
            </p>
          </div>

          <Link
            href="/Deposite"
            className="mt-6 flex items-center gap-1 text-sm font-bold text-cyan-900 hover:text-cyan-300"
          >
            Explore Network
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Three small feature cards */}
        {smallFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`rounded-2xl font-bold border-none p-6 ${
                feature.highlighted
                  ? "shadow-xl bg-cyan-400/[0.04]"
                  : " shadow-xl bg-white/[0.03]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-900">
                <Icon size={16} strokeWidth={2} />
              </span>
              <h4 className="mt-4 text-xl text-cyan-900 font-bold">{feature.title}</h4>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
