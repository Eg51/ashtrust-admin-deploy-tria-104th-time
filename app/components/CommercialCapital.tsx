import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

// ---- Data ---------------------------------------------------------------

const loanOptions = [
  "Commercial Real Estate Loans",
  "Equipment & Fleet Financing",
  "Working Capital Credit Lines",
];

// ---- Component ------------------------------------------------------------

export default function CommercialCapital() {
  return (
    <section className="w-full bg-transparent px-6 py-16 text-white">
      <div className="mx-auto grid  max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        {/* Card image */}
        <div className="relative bg-cyan-400/[0.06] shadow-xl overflow-hidden rounded-2xl border-white/10">
          <Image
            src="/images/corporate-credit-card.jpg"
            alt="Elite corporate credit card"
            width={700}
            height={440}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-4 text-cyan-900 left-4 text-[10px] font-medium tracking-wide">
            CORPORATE CREDIT
            <br />
            <span className="text-sm font-bold text-cyan-900">
              Infinite Growth Line
            </span>
          </span>
          <span className="absolute bottom-4 right-4 text-right text-[10px] font-medium tracking-wide text-cyan-900">
            LIMIT UP TO
            <br />
            <span className="text-sm text-cyan-900 font-bold">$50M</span>
          </span>
        </div>

        {/* Text column */}
        <div className="p-9 bg-cyan-400/[0.06] rounded-xl shadow-xl flex flex-col items-center justify-center ">
          <h2 className="text-3xl text-cyan-300 font-bold leading-tight sm:text-4xl">
            Commercial <span className="text-cyan-900">Capital</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-cyan-900 leading-relaxed text-left font-bold">
            Access fast, flexible funding for your next phase of expansion.
            From asset-based lending to structured corporate finance.
          </p>

          {/* <ul className="mt-6 -ml-50 space-y-3">
            {loanOptions.map((option) => (
              <li key={option} className="flex items-center gap-2.5 text-sm text-[#0a0e17]">
                <CheckCircle2 size={16} className="shrink-0 text-cyan-400"/>
                {option}
              </li>
            ))}
          </ul>

          <Link
            href="/loans"
            className="inline-block rounded-md bg-cyan-400 px-5 py-2.5 
            text-sm font-semibold text-slate-900 transition hover:bg-cyan-900"
          >
            Explore Loan Options
          </Link> */}
        </div>
      </div> 
    </section>
  );
}
