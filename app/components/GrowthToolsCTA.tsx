import Link from "next/link";
import { TrendingUp, RefreshCw } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

// ---- Data ---------------------------------------------------------------

const growthVelocity = [28, 34, 24, 46, 40, 62, 70];

// ---- Component ------------------------------------------------------------

export default function GrowthToolsCTA() {
  return (
    <section className="w-full rounded-3xl bg-transparent px-6 py-16 text-white">
      <div className="mx-auto rounded-3xl max-w-6xl">
        {/* Advanced growth tools panel */}
        <div className="grid grid-cols-1 gap-8 rounded-2xl border shadow-xl border-none bg-white/[0.03] p-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: copy + feature list */}
          <div>
            <div className="rounded-lg border-none shadow-xl  bg-cyan-400/[0.06] p-3.5">
              <h3 className="text-xl text-cyan-900 font-semibold">Advanced Growth Tools</h3>
              <p className="mt-3 text-[10px] font-bold leading-relaxed text-slate-500">
                Our proprietary Engine gives you a 360° view of your
                business health. Monitor burn rates, runway, and global market
                exposure from a single, unified command center.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-lg border-none shadow-xl bg-cyan-400/[0.06] p-3.5">
                <p className="text-xl font-bold text-cyan-900">
                  Dynamic Runway Tracking
                </p>
                <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-500">
                  Simulate market scenarios and their impact on your capital.
                </p>
              </div>
              <div className=" shadow-xl border-cyan-400/40 bg-cyan-400/[0.06] p-3.5 rounded-lg borderp-3.5">
                <p className="text-xl font-semibold text-cyan-900">
                  Automated Invoicing
                </p>
                <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-500">
                  Smart reconciliation and automated follow-ups.
                </p>
              </div>
            </div>
          </div>

          {/* Right: dashboard mock */}
          <div className="rounded-xl border border-none bg-cyan-400/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 shadow-xl rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 shadow-xl rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 shadow-xl rounded-full bg-emerald-400/70" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-none p-4">
                <p className="text-[10px] font-bold text-cyan-900 tracking-wide">
                  EQUITY BALANCE
                </p>
            <AnimatedCounter
                  value={4281090}
                  prefix="$"
                  suffix=""
                  className="mt-1 text-lg font-semibold"/>
                  <TrendingUp size={12} />
                  
                  <AnimatedCounter
                    value={14}
                    prefix="+"
                    suffix="%"
                    className="mt-1 flex items-center gap-1
                    text-sm font-bold text-emerald-400"/>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-400">
                  <TrendingUp size={12} />
                </p>
              </div>
              <div className="rounded-lg border-none p-4">
                <p className="text-[10px] font-poppins font-bold tracking-wide text-cyan-900">
                  GLOBAL EXPOSURE
                </p>
                <p className="mt-1 text-lg font-semibold">Low</p>
                <div className="mt-3 h-1.5 w-full rounded-full">
                  <div className="h-1.5 w-1/4 rounded-full bg-cyan-400" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg  border border-white/10 p-4">
              <p className="text-[10px] tracking-wide text-cyan-900 font-bold">
                GROWTH  CHART
              </p>

              
              <div className="mt-4 flex h-24 items-end gap-2">
                {growthVelocity.map((value, i) => (
                  <span
                    key={i}
                    style={{ height: `${value}%` }}
                    className={`w-full rounded-sm  ${
                      i >= growthVelocity.length - 2
                        ? "bg-cyan-300"
                        : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>


            </div>
          </div>
        </div>

        {/* Final CTA */}
        {/* <div className="mt-20 text-[#0a0e17] text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to scale your <span className="text-[#0a0e17]">Enterprise?</span>
          </h2>
          <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-1.5 text-sm text-slate-800">
            Join the world's most innovative companies banking with
            us. Institutional power, unmatched speed.
          </p>

          <Link
            href="/sign-up"
            className="mt-8 inline-block rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Open Your Business Account
          </Link>
        </div> */}
      </div>
    </section>
  );
}
