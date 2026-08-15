import { useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------
   QuantFlow — marketing landing page
   Palette, type, and chrome pulled directly from the live
   product: near-black terminal with a warm mustard trend
   line and grid backdrop for the "data" screens, cream
   receipt paper with dashed leaders for the ledger/entry
   screen. The page opens in the product's own terminal skin,
   then "The Conversion" morphs a single line item from
   typed terminal readout into a paper ledger line and back —
   because that conversion is the whole product.
--------------------------------------------------------- */

function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function GridBackdrop({ glow = true }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      {glow && (
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "20%",
            width: "60%",
            height: "50%",
            background:
              "radial-gradient(circle, rgba(214,168,62,0.14) 0%, rgba(214,168,62,0) 70%)",
          }}
        />
      )}
      <svg
        viewBox="0 0 400 300"
        style={{ position: "absolute", right: "-4%", bottom: "-6%", width: "58%", opacity: 0.55 }}
        preserveAspectRatio="none"
      >
        <polyline
          points="0,260 60,235 110,245 150,190 190,205 230,140 270,155 320,70 400,20"
          fill="none"
          stroke="#D6A83E"
          strokeWidth="1.4"
        />
        <rect x="146" y="178" width="6" height="24" fill="#4CAE9C" opacity="0.8" />
        <rect x="266" y="145" width="6" height="20" fill="#BF5240" opacity="0.8" />
        <rect x="316" y="52" width="6" height="30" fill="#4CAE9C" opacity="0.8" />
      </svg>
    </div>
  );
}

function Sparkline({ points, stroke, active, delay = 0 }) {
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="w-full h-8" preserveAspectRatio="none">
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 160,
          strokeDashoffset: active ? 0 : 160,
          transition: `stroke-dashoffset 1.4s cubic-bezier(.16,.84,.44,1) ${delay}s`,
        }}
      />
    </svg>
  );
}

const KPI = [
  {
    label: "MONTH BURN",
    value: 1473,
    prefix: "$",
    pace: "ON PACE",
    paceColor: "#4CAE9C",
    pts: [
      { x: 0, y: 26 }, { x: 15, y: 22 }, { x: 30, y: 24 }, { x: 45, y: 16 },
      { x: 60, y: 18 }, { x: 75, y: 10 }, { x: 100, y: 12 },
    ],
  },
  {
    label: "ENTERTAINMENT",
    value: 232,
    prefix: "$",
    pace: "OVER",
    paceColor: "#BF5240",
    pts: [
      { x: 0, y: 20 }, { x: 15, y: 18 }, { x: 30, y: 14 }, { x: 45, y: 15 },
      { x: 60, y: 8 }, { x: 75, y: 6 }, { x: 100, y: 4 },
    ],
  },
  {
    label: "SAVED THIS MONTH",
    value: 1088,
    prefix: "$",
    pace: "WATCH",
    paceColor: "#E8C74A",
    pts: [
      { x: 0, y: 16 }, { x: 15, y: 24 }, { x: 30, y: 12 }, { x: 45, y: 26 },
      { x: 60, y: 10 }, { x: 75, y: 22 }, { x: 100, y: 8 },
    ],
  },
];

const CONVERSIONS = [
  { day: "02", terminalName: "NETFLIX", paperName: "Netflix", amt: "-15.49", status: "ON PACE", statusColor: "#4CAE9C" },
  { day: "05", terminalName: "TRADER JOE'S", paperName: "Trader Joe's", amt: "-64.30", status: "ON PACE", statusColor: "#4CAE9C" },
  { day: "08", terminalName: "UBER", paperName: "Uber", amt: "-22.40", status: "WATCH", statusColor: "#E8C74A" },
  { day: "12", terminalName: "BEST BUY", paperName: "Best Buy", amt: "-349.00", status: "OVER", statusColor: "#BF5240" },
  { day: "16", terminalName: "DELTA AIRLINES", paperName: "Delta Airlines", amt: "-210.75", status: "OVER", statusColor: "#BF5240" },
  { day: "21", terminalName: "STARBUCKS", paperName: "Starbucks", amt: "-6.85", status: "ON PACE", statusColor: "#4CAE9C" },
  { day: "27", terminalName: "PLANET FITNESS", paperName: "Planet Fitness", amt: "-24.99", status: "WATCH", statusColor: "#E8C74A" },
];

const FEATURES = [
  {
    tag: "PACE",
    title: "Pace-adjusted signals",
    body:
      "Every budget line reads ON PACE, WATCH, or OVER — measured against today's date, not the calendar's.",
  },
  {
    tag: "PROJECT",
    title: "Month-end projection",
    body:
      "Your daily burn rate compounds forward automatically, so you see the month's ending balance before it happens.",
  },
  {
    tag: "INSIGHT",
    title: "Insight banner",
    body:
      "A single line, generated from your own data, telling you the one thing worth noticing this week.",
  },
  {
    tag: "SEARCH",
    title: "Search, filter, undo",
    body:
      "Every transaction is queryable and every delete is reversible. Nothing about your ledger is permanent by accident.",
  },
];

export default function LandingPage({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const morphRef = useRef(null);
  const [morphT, setMorphT] = useState(0);
  const [kpiRef, kpiInView] = useInView(0.25);
  const [featRef, featInView] = useInView(0.15);
  const [morphInViewRef, morphInView] = useInView(0.2);
  const [txIndex, setTxIndex] = useState(0);
  const [txFade, setTxFade] = useState(true);

  useEffect(() => {
    if (!morphInView) return;
    const id = setInterval(() => {
      setTxFade(false);
      setTimeout(() => {
        setTxIndex((i) => (i + 1) % CONVERSIONS.length);
        setTxFade(true);
      }, 260);
    }, 2600);
    return () => clearInterval(id);
  }, [morphInView]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const el = morphRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = -rect.top;
      const t = total > 0 ? Math.min(1, Math.max(0, passed / total)) : 0;
      setMorphT(t);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const burn = useCountUp(KPI[0].value, kpiInView);
  const ent = useCountUp(KPI[1].value, kpiInView);
  const saved = useCountUp(KPI[2].value, kpiInView);
  const counted = [burn, ent, saved];

  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const mixHex = (h1, h2, t) => {
    const [r1, g1, b1] = hex(h1);
    const [r2, g2, b2] = hex(h2);
    return `rgb(${lerp(r1, r2, t)}, ${lerp(g1, g2, t)}, ${lerp(b1, b2, t)})`;
  };

  // morph goes terminal (t=0) -> paper receipt (t=1) -> terminal (t=2, normalized back)
  const swing = morphT < 0.5 ? morphT * 2 : (1 - morphT) * 2; // 0 -> 1 -> 0
  const bg = mixHex("#0B0F14", "#EDE3CE", swing);
  const fg = mixHex("#DCE6E0", "#3B3226", swing);
  const accent = mixHex("#D6A83E", "#A8412C", swing);
  const rule = mixHex("#233128", "#C9BFA0", swing);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0B0F14",
        color: "#DCE6E0",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .serif { font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        @keyframes blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        .cursor { animation: blink 1.1s step-end infinite; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: rise 0.8s cubic-bezier(.16,.84,.44,1) both; }
        .leader {
          flex: 1;
          margin: 0 8px;
          border-bottom: 2px dotted currentColor;
          opacity: 0.6;
          transform: translateY(-6px);
        }
        @media (prefers-reduced-motion: reduce) {
          .cursor { animation: none; opacity: 1; }
          .rise { animation: none; }
          * { transition: none !important; }
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid #4CAE9C;
          outline-offset: 3px;
        }
      `}</style>

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: scrolled ? "rgba(11,15,20,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom: scrolled ? "1px solid #1E2830" : "1px solid transparent",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <span className="serif text-lg tracking-tight" style={{ fontWeight: 600, color: "#F2ECDD" }}>
          QuantFlow
        </span>
        <div className="flex items-center gap-6">
          <a href="#features" className="mono text-xs hidden sm:inline" style={{ letterSpacing: "0.08em", color: "#8FA098" }}>
            FEATURES
          </a>
          <button
            onClick={onSignIn}
            className="mono text-xs px-4 py-2 rounded-sm"
            style={{ background: "#4CAE9C", color: "#0B0F14", letterSpacing: "0.05em", fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            SIGN IN →
          </button>
        </div>
      </nav>

      {/* HERO — terminal skin, matches the app's own entry screen */}
      <header className="relative px-6 md:px-10 pt-40 pb-28 overflow-hidden" style={{ background: "#0B0F14" }}>
        <GridBackdrop />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="serif rise" style={{ fontSize: "clamp(2.4rem, 7vw, 4rem)", color: "#F2ECDD", fontWeight: 600 }}>
            QuantFlow
          </p>
          <p
            className="mono rise mt-3"
            style={{ fontSize: "0.8rem", letterSpacing: "0.28em", color: "#8FA098", animationDelay: "0.1s" }}
          >
            SMART BUDGET &amp; EXPENSE ANALYTICS
          </p>

          <div
            className="rise inline-flex items-center gap-2 mt-8 mb-10"
            style={{ animationDelay: "0.2s" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4CAE9C",
                boxShadow: "0 0 8px #4CAE9C",
              }}
            />
            <span className="mono text-xs" style={{ letterSpacing: "0.15em", color: "#8FA098" }}>
              LIVE PACING MODEL — RECALCULATING EACH ENTRY
            </span>
          </div>

          <h1
            className="rise"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)", lineHeight: 1.35, color: "#DCE6E0", fontWeight: 400, animationDelay: "0.25s" }}
          >
            Your spending has a signal.{" "}
            <span style={{ color: "#D6A83E" }}>QuantFlow finds it.</span>
          </h1>
          <p className="mt-5 rise max-w-lg mx-auto" style={{ color: "#8FA098", lineHeight: 1.6, animationDelay: "0.3s" }}>
            Pace-adjusted budgets, burn-rate projections, and volatility
            stats that update the moment you spend — priced against your
            own numbers, not a template.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4 rise" style={{ animationDelay: "0.35s" }}>
            <button
              onClick={onSignIn}
              className="mono text-xs px-6 py-3 rounded-sm"
              style={{ background: "#4CAE9C", color: "#0B0F14", letterSpacing: "0.05em", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              OPEN QUANTFLOW →
            </button>
            <a
              href="https://github.com/anahadgill0718/QuantFlow"
              className="mono text-xs px-6 py-3 rounded-sm border"
              style={{ borderColor: "#3A4650", color: "#DCE6E0", letterSpacing: "0.05em" }}
            >
              VIEW ON GITHUB
            </a>
          </div>

          {/* NET card, styled exactly on the dashboard's gold-bordered summary card */}
          <div
            className="rise mt-16 mx-auto p-6 rounded-lg text-left max-w-sm"
            style={{
              background: "#141B22",
              border: "1px solid #D6A83E",
              boxShadow: "0 24px 48px -24px rgba(0,0,0,0.6)",
              animationDelay: "0.45s",
            }}
          >
            <p className="mono text-xs" style={{ color: "#8FA098", letterSpacing: "0.1em" }}>
              NET FOR AUG 2026
            </p>
            <div className="flex items-end justify-between mt-2">
              <p className="mono" style={{ fontSize: "2.4rem", color: "#4CAE9C" }}>
                +$302
              </p>
              <p className="mono text-xs mb-2" style={{ color: "#8FA098" }}>
                17% of income kept
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* THE CONVERSION — scroll-driven morph, terminal line ⇄ paper ledger line */}
      <section ref={(el) => { morphRef.current = el; morphInViewRef.current = el; }} style={{ height: "220vh", position: "relative" }}>
        <div
          className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden"
          style={{ background: bg, transition: "background 0.05s linear" }}
        >
          {/* dark-mode grid, fades out as the page turns to paper */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              opacity: Math.max(0, 1 - swing * 1.6),
            }}
          />
          {/* dark grid lines, visible on the paper side and through the muddy midpoint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              opacity: Math.min(1, swing * 1.6),
            }}
          />
          {/* paper-mode ruled lines, fades in as the page turns to paper */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 43px, #8C7A54 44px)",
              opacity: Math.max(0, swing * 1.6 - 0.6) * 0.5,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-5%",
              right: "-6%",
              width: "44%",
              opacity: Math.max(0, 1 - swing * 1.8) * 0.5,
            }}
          >
            <svg viewBox="0 0 400 300" preserveAspectRatio="none">
              <polyline
                points="0,260 60,235 110,245 150,190 190,205 230,140 270,155 320,70 400,20"
                fill="none"
                stroke="#D6A83E"
                strokeWidth="1.4"
              />
              <rect x="146" y="178" width="6" height="24" fill="#4CAE9C" opacity="0.8" />
              <rect x="266" y="145" width="6" height="20" fill="#BF5240" opacity="0.8" />
            </svg>
          </div>

          <div className="max-w-2xl w-full text-center relative">
            <p
              className="mono text-xs mb-8"
              style={{ color: accent, letterSpacing: "0.2em" }}
            >
              THE CONVERSION
            </p>

            <div
              className="mono flex items-center w-full max-w-md mx-auto"
              style={{
                color: fg,
                fontSize: "clamp(1rem, 2.6vw, 1.3rem)",
                opacity: txFade ? 1 : 0,
                transition: "opacity 0.26s ease",
                minHeight: "1.8em",
              }}
            >
              <span>
                {swing < 0.5
                  ? `${CONVERSIONS[txIndex].day}  ${CONVERSIONS[txIndex].paperName}`
                  : `${CONVERSIONS[txIndex].day}  ${CONVERSIONS[txIndex].terminalName}`}
              </span>
              <span className="leader" />
              <span style={{ color: swing < 0.5 ? CONVERSIONS[txIndex].statusColor : CONVERSIONS[txIndex].statusColor }}>
                {CONVERSIONS[txIndex].amt}
                {"  [ "}
                {CONVERSIONS[txIndex].status}
                {" ]"}
              </span>
              <span className="cursor" style={{ color: accent, marginLeft: 4 }}>
                {swing > 0.55 ? "▍" : ""}
              </span>
            </div>

            <div
              className="mt-10 mx-auto"
              style={{
                height: 1,
                width: `${40 + swing * 40}%`,
                background: rule,
                transition: "width 0.05s linear",
              }}
            />
            <p
              className="mt-8 mono text-xs"
              style={{ color: fg, opacity: 0.6, letterSpacing: "0.08em" }}
            >
              {swing < 0.5 ? "TERMINAL READOUT" : "LEDGER ENTRY"} — same
              transaction, priced against your budget either way
            </p>
          </div>
        </div>
      </section>

      {/* TERMINAL — KPI cards, matches the live dashboard */}
      <section
        ref={kpiRef}
        className="relative px-6 md:px-10 py-24 overflow-hidden"
        style={{ background: "#0B0F14", color: "#DCE6E0" }}
      >
        <GridBackdrop glow={false} />
        <div className="relative max-w-6xl mx-auto">
          <p className="mono text-xs mb-3" style={{ color: "#4CAE9C", letterSpacing: "0.12em" }}>
            LIVE READOUT
          </p>
          <h2 className="serif mb-12" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", color: "#F2ECDD" }}>
            The same ledger, priced in real time.
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {KPI.map((k, i) => (
              <div
                key={k.label}
                className="p-6 rounded-lg"
                style={{ background: "#141B22", border: "1px solid #1E2830" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="mono text-xs" style={{ color: "#7C8896", letterSpacing: "0.08em" }}>
                    {k.label}
                  </span>
                  <span
                    className="mono text-[10px] px-2 py-1 rounded-sm"
                    style={{ color: k.paceColor, border: `1px solid ${k.paceColor}66` }}
                  >
                    {k.pace}
                  </span>
                </div>
                <p className="mono" style={{ fontSize: "2rem", color: "#F2ECDD" }}>
                  {k.prefix}
                  {counted[i].toFixed(0)}
                </p>
                <div className="mt-3">
                  <Sparkline points={k.pts} stroke={k.paceColor} active={kpiInView} delay={i * 0.15} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featRef} className="px-6 md:px-10 py-24" style={{ background: "#0B0F14", color: "#DCE6E0" }}>
        <div className="max-w-6xl mx-auto">
          <p className="mono text-xs mb-3" style={{ color: "#4CAE9C", letterSpacing: "0.12em" }}>
            INSTRUMENTATION
          </p>
          <h2 className="serif mb-12" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", color: "#F2ECDD" }}>
            Built like a trading desk, run like a checkbook.
          </h2>
          <div className="grid sm:grid-cols-2 gap-px" style={{ background: "#1E2830" }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.tag}
                className="p-8"
                style={{
                  background: "#0B0F14",
                  opacity: featInView ? 1 : 0,
                  transform: featInView ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`,
                }}
              >
                <span className="mono text-xs" style={{ color: "#D6A83E" }}>
                  {f.tag}
                </span>
                <h3 className="serif mt-3 mb-2" style={{ fontSize: "1.3rem", color: "#F2ECDD", fontWeight: 500 }}>
                  {f.title}
                </h3>
                <p style={{ color: "#8FA098", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA — paper ledger receipt, matches the add-transaction screen */}
      <section className="relative px-6 md:px-10 py-28 overflow-hidden" style={{ background: "#EDE3CE" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 43px, #8C7A54 44px)",
            opacity: 0.35,
          }}
        />
        <div
          className="max-w-md mx-auto text-center p-8 rounded-md relative"
          style={{ background: "#F4EEDD", border: "1px solid #C9BFA0" }}
        >
          <p className="mono text-xs" style={{ color: "#8C7A54", letterSpacing: "0.15em" }}>
            * * * QUANTFLOW * * *
          </p>
          <h2 className="serif mt-4" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.1rem)", color: "#3B3226", fontWeight: 500 }}>
            Close the terminal.
            <br />
            Open the ledger.
          </h2>
          <p className="mt-4 mono text-sm" style={{ color: "#5A4F3D" }}>
            Free to use. Installs like an app. Your data never leaves your
            own row.
          </p>
          <button
            onClick={onSignIn}
            className="mono text-xs inline-block mt-8 px-6 py-3 rounded-sm"
            style={{ background: "#3B3226", color: "#EDE3CE", letterSpacing: "0.05em", border: "none", cursor: "pointer" }}
          >
            + ADD YOURSELF TO QUANTFLOW
          </button>
          <p className="mono text-xs mt-10" style={{ color: "#A8412C", letterSpacing: "0.05em" }}>
            BUILT BY ANAHAD GILL
          </p>
        </div>
      </section>
    </div>
  );
}