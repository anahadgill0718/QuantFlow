import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ---------- Design tokens ----------
const INK = "#12181F";
const INK_SOFT = "#1C242E";
const PAPER = "#F6F1E7";
const JADE = "#3FA796";
const BRICK = "#A83C32";
const BRASS = "#C9A24B";
const SLATE = "#8B97A3";
const PLUM = "#8B7BAE";
const TEAL = "#5B8C87";

const CATEGORY_COLORS = {
  Housing: BRASS,
  Groceries: JADE,
  Dining: BRICK,
  Transport: "#6E8FB0",
  Subscriptions: PLUM,
  Entertainment: TEAL,
  Savings: "#2F7D6E",
};

// ---------- Default budget limits (user-editable, saved to this browser) ----------
const DEFAULT_BUDGETS = {
  Housing: 650, Groceries: 220, Dining: 120, Transport: 90,
  Subscriptions: 45, Entertainment: 80, Savings: 200,
};

// ---------- Sample data (used only until the user adds real transactions) ----------
const SAMPLE_BLOCKS = [
  {
    income: [{ d: "01", m: "Part-time payroll", a: 640 }, { d: "15", m: "Part-time payroll", a: 640 }],
    expenses: [
      { d: "01", m: "Maple Court Rent", c: "Housing", a: 650 },
      { d: "03", m: "Trader Joe's", c: "Groceries", a: 61 },
      { d: "05", m: "Campus Shuttle Pass", c: "Transport", a: 45 },
      { d: "06", m: "Spotify", c: "Subscriptions", a: 12 },
      { d: "08", m: "Noodle House", c: "Dining", a: 22 },
      { d: "10", m: "Safeway", c: "Groceries", a: 58 },
      { d: "12", m: "AMC Tickets", c: "Entertainment", a: 34 },
      { d: "14", m: "Uber", c: "Transport", a: 18 },
      { d: "16", m: "Chipotle", c: "Dining", a: 14 },
      { d: "18", m: "iCloud+", c: "Subscriptions", a: 3 },
      { d: "20", m: "Safeway", c: "Groceries", a: 47 },
      { d: "22", m: "Bowling Night", c: "Entertainment", a: 26 },
      { d: "25", m: "Ramen Bar", c: "Dining", a: 19 },
      { d: "28", m: "Transfer to Savings", c: "Savings", a: 150 },
    ],
  },
  {
    income: [{ d: "01", m: "Part-time payroll", a: 640 }, { d: "15", m: "Part-time payroll", a: 640 }, { d: "20", m: "Freelance tutoring", a: 90 }],
    expenses: [
      { d: "01", m: "Maple Court Rent", c: "Housing", a: 650 },
      { d: "02", m: "Trader Joe's", c: "Groceries", a: 66 },
      { d: "04", m: "Campus Shuttle Pass", c: "Transport", a: 45 },
      { d: "06", m: "Spotify", c: "Subscriptions", a: 12 },
      { d: "07", m: "Pho 79", c: "Dining", a: 17 },
      { d: "09", m: "Costco Run", c: "Groceries", a: 74 },
      { d: "11", m: "Concert Tickets", c: "Entertainment", a: 55 },
      { d: "13", m: "Lyft", c: "Transport", a: 21 },
      { d: "16", m: "Chipotle", c: "Dining", a: 15 },
      { d: "18", m: "iCloud+", c: "Subscriptions", a: 3 },
      { d: "21", m: "Safeway", c: "Groceries", a: 52 },
      { d: "24", m: "Arcade Night", c: "Entertainment", a: 18 },
      { d: "26", m: "Thai Terrace", c: "Dining", a: 28 },
      { d: "29", m: "Transfer to Savings", c: "Savings", a: 180 },
    ],
  },
  {
    income: [{ d: "01", m: "Part-time payroll", a: 640 }, { d: "15", m: "Part-time payroll", a: 640 }],
    expenses: [
      { d: "01", m: "Maple Court Rent", c: "Housing", a: 650 },
      { d: "02", m: "Trader Joe's", c: "Groceries", a: 59 },
      { d: "03", m: "Campus Shuttle Pass", c: "Transport", a: 45 },
      { d: "06", m: "Spotify", c: "Subscriptions", a: 12 },
      { d: "07", m: "Noodle House", c: "Dining", a: 24 },
      { d: "10", m: "Safeway", c: "Groceries", a: 63 },
      { d: "12", m: "Movie Night", c: "Entertainment", a: 21 },
      { d: "14", m: "Uber", c: "Transport", a: 16 },
      { d: "17", m: "Ramen Bar", c: "Dining", a: 20 },
      { d: "18", m: "iCloud+", c: "Subscriptions", a: 3 },
      { d: "21", m: "Costco Run", c: "Groceries", a: 71 },
      { d: "23", m: "Mini Golf", c: "Entertainment", a: 30 },
      { d: "25", m: "Thai Terrace", c: "Dining", a: 26 },
      { d: "27", m: "Transfer to Savings", c: "Savings", a: 200 },
    ],
  },
];

// Returns the anchor month plus the two before it, e.g. ["Jun 2026", "Jul 2026", "Aug 2026"]
function getRollingMonths(anchor = new Date()) {
  const out = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    out.push(d.toLocaleString("default", { month: "short", year: "numeric" }));
  }
  return out;
}

// e.g. new Date(2026, 2, 17) -> "Mar 2026"
function monthLabelFor(date) {
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length && r.some((v) => v !== ""));
}

function buildSampleData(monthKeys) {
  const out = {};
  monthKeys.forEach((key, i) => {
    const block = SAMPLE_BLOCKS[i];
    out[key] = {
      income: block.income.map((r, j) => ({ ...r, id: `sample-${i}-inc-${j}` })),
      expenses: block.expenses.map((r, j) => ({ ...r, id: `sample-${i}-exp-${j}` })),
    };
  });
  return out;
}

const STORAGE_KEY = "financeDashboard_v1";

function loadInitialState(defaultMonthKeys) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.data) {
        return {
          ledgerData: saved.data,
          isSample: !!saved.isSample,
          budgets: saved.budgets || DEFAULT_BUDGETS,
        };
      }
    }
  } catch {
    // fall through to sample data
  }
  return { ledgerData: buildSampleData(defaultMonthKeys), isSample: true, budgets: DEFAULT_BUDGETS };
}

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function TornEdge({ flip }) {
  return (
    <div
      style={{
        height: 10,
        backgroundImage: `linear-gradient(${flip ? 45 : 135}deg, ${PAPER} 25%, transparent 25%), linear-gradient(${flip ? -45 : -135 + 180}deg, ${PAPER} 25%, transparent 25%)`,
        backgroundSize: "14px 14px",
        backgroundPosition: flip ? "0 100%" : "0 0",
        backgroundColor: "transparent",
      }}
    />
  );
}

function Sparkline({ values, color, width = 72, height = 28 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  const lastX = (values.length - 1) * step;
  const lastY = height - ((values[values.length - 1] - min) / range) * height;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.85" />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}

function BackgroundArt() {
  const ticks = [180, 340, 500, 660, 820, 980, 1140, 1300, 1460];
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, background: "linear-gradient(160deg, #0A0F16 0%, #12181F 45%, #0E1A17 100%)" }}
    >
      {/* faint graph-paper grid, quant's native habitat */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,151,163,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,151,163,0.07) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* soft asymmetric glows */}
      <div
        className="absolute rounded-full"
        style={{ width: 640, height: 640, top: -180, right: -160, background: "radial-gradient(circle, rgba(201,162,75,0.16), transparent 70%)", filter: "blur(6px)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: 520, height: 520, bottom: -140, left: -140, background: "radial-gradient(circle, rgba(63,167,150,0.14), transparent 70%)", filter: "blur(6px)" }}
      />
      {/* signature: an upward flow line with candlestick ticks, literally "QuantFlow" */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <style>{`
          @keyframes qfDraw { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
          .qf-flow-path { stroke-dasharray: 2000; animation: qfDraw 2.4s ease-out forwards; }
          @media (prefers-reduced-motion: reduce) { .qf-flow-path { animation: none; stroke-dashoffset: 0; } }
        `}</style>
        <defs>
          <linearGradient id="qfFlow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#3FA796" />
            <stop offset="100%" stopColor="#C9A24B" />
          </linearGradient>
        </defs>
        <path
          className="qf-flow-path"
          d="M -50 760 C 260 720, 480 560, 720 500 S 1120 300, 1650 120"
          fill="none"
          stroke="url(#qfFlow)"
          strokeWidth="2"
          opacity="0.3"
        />
        {ticks.map((x, i) => {
          const y = 740 - i * 68;
          const up = i % 3 !== 1;
          return (
            <g key={x} opacity="0.22">
              <line x1={x} y1={y - 26} x2={x} y2={y + 26} stroke={up ? JADE : BRICK} strokeWidth="1.5" />
              <rect x={x - 5} y={up ? y - 12 : y - 4} width="10" height="16" fill={up ? JADE : BRICK} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function FinanceDashboard() {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const MONTHS = useMemo(() => getRollingMonths(anchorDate), [anchorDate]);
  const [monthIdx, setMonthIdx] = useState(2);
  const [ledgerData, setLedgerData] = useState(() => loadInitialState(MONTHS).ledgerData);
  const [isSample, setIsSample] = useState(() => loadInitialState(MONTHS).isSample);
  const [budgets, setBudgets] = useState(() => loadInitialState(MONTHS).budgets);
  const CATEGORIES = useMemo(() => Object.keys(budgets), [budgets]);
  const [editingCat, setEditingCat] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editingTxId, setEditingTxId] = useState(null);
  const [editTxForm, setEditTxForm] = useState({ merchant: "", amount: "", category: "" });
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [form, setForm] = useState({
    merchant: "",
    category: CATEGORIES[0],
    amount: "",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  });
  const [justAdded, setJustAdded] = useState(false);
  const [formError, setFormError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToast = (message, undo) => {
    setToast({ message, undo });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const month = MONTHS[monthIdx];
  const data = ledgerData[month] || { income: [], expenses: [] };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: ledgerData, isSample, budgets }));
    } catch {
      // localStorage unavailable — data just won't persist between sessions
    }
  }, [ledgerData, isSample, budgets]);

  const totals = useMemo(() => {
    const income = data.income.reduce((s, r) => s + r.a, 0);
    const expenses = data.expenses.reduce((s, r) => s + r.a, 0);
    const net = income - expenses;
    const savingsRate = income ? Math.round((net / income) * 100) : 0;
    return { income, expenses, net, savingsRate };
  }, [data]);

  const byCategory = useMemo(() => {
    const map = {};
    data.expenses.forEach((r) => { map[r.c] = (map[r.c] || 0) + r.a; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data]);

  const trend = useMemo(() => {
    return MONTHS.map((m) => {
      const monthData = ledgerData[m] || { income: [], expenses: [] };
      const inc = monthData.income.reduce((s, r) => s + r.a, 0);
      const exp = monthData.expenses.reduce((s, r) => s + r.a, 0);
      return { month: m.split(" ")[0], Income: inc, Expenses: exp };
    });
  }, [ledgerData, MONTHS]);

  const ledger = useMemo(() => {
    const rows = [
      ...data.income.map((r) => ({ ...r, type: "in" })),
      ...data.expenses.map((r) => ({ ...r, type: "out" })),
    ];
    return rows.sort((a, b) => a.d.localeCompare(b.d));
  }, [data]);

  const filteredLedger = useMemo(() => {
    if (!searchQuery.trim()) return ledger;
    const q = searchQuery.trim().toLowerCase();
    return ledger.filter((r) => r.m.toLowerCase().includes(q) || (r.c || "").toLowerCase().includes(q));
  }, [ledger, searchQuery]);

  const handleDateChange = (newDateStr) => {
    setForm((f) => ({ ...f, date: newDateStr }));
    const picked = new Date(newDateStr + "T00:00:00");
    const pickedLabel = monthLabelFor(picked);

    const existingIdx = MONTHS.indexOf(pickedLabel);
    if (existingIdx !== -1) {
      setMonthIdx(existingIdx);
    } else {
      // Shift the visible 3-month window so it ends on the picked month
      setAnchorDate(new Date(picked.getFullYear(), picked.getMonth(), 1));
      setMonthIdx(2);
    }
  };

  const quant = useMemo(() => {
    const incomeSeries = trend.map((t) => t.Income);
    const expenseSeries = trend.map((t) => t.Expenses);
    const savingsSeries = MONTHS.map((m) => {
      const md = ledgerData[m] || { expenses: [] };
      return md.expenses.filter((r) => r.c === "Savings").reduce((s, r) => s + r.a, 0);
    });

    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const stdev = (arr) => {
      const m = avg(arr);
      return Math.sqrt(avg(arr.map((v) => (v - m) ** 2)));
    };

    const prevExpense = monthIdx > 0 ? expenseSeries[monthIdx - 1] : null;
    const prevIncome = monthIdx > 0 ? incomeSeries[monthIdx - 1] : null;
    const pctDelta = (curr, prev) => (prev ? Math.round(((curr - prev) / prev) * 100) : null);

    const today = new Date();
    const isCurrentMonth = month === monthLabelFor(today);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
    const elapsedFraction = daysElapsed / daysInMonth;
    const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
    const projected = isCurrentMonth && daysElapsed > 0 ? (totals.expenses / daysElapsed) * daysInMonth : totals.expenses;
    const projPct = totalBudget ? Math.round(((projected - totalBudget) / totalBudget) * 100) : 0;

    return {
      incomeSeries,
      expenseSeries,
      savingsSeries,
      avgExpense: avg(expenseSeries),
      volatility: stdev(expenseSeries),
      expenseDelta: pctDelta(totals.expenses, prevExpense),
      incomeDelta: pctDelta(totals.income, prevIncome),
      isCurrentMonth,
      elapsedFraction,
      totalBudget,
      projected,
      projPct,
    };
  }, [trend, MONTHS, ledgerData, monthIdx, totals, month, budgets]);

  const insight = useMemo(() => {
    if (byCategory.length === 0) return null;
    const top = [...byCategory].sort((a, b) => b.value - a.value)[0];
    const prevMonth = monthIdx > 0 ? MONTHS[monthIdx - 1] : null;
    const prevData = prevMonth ? ledgerData[prevMonth] : null;
    const prevExpenses = prevData ? prevData.expenses.reduce((s, r) => s + r.a, 0) : 0;

    if (prevMonth && prevExpenses > 0) {
      const diffPct = Math.round(((totals.expenses - prevExpenses) / prevExpenses) * 100);
      if (diffPct > 4) {
        return `Spending is up ${diffPct}% from ${prevMonth.split(" ")[0]}, driven mostly by ${top.name}.`;
      }
      if (diffPct < -4) {
        return `Nice — spending is down ${Math.abs(diffPct)}% from ${prevMonth.split(" ")[0]}.`;
      }
      return `Spending is holding steady with ${prevMonth.split(" ")[0]}. ${top.name} remains the biggest category.`;
    }
    return `${top.name} is your biggest expense this month at ${fmt(top.value)}.`;
  }, [byCategory, totals, monthIdx, MONTHS, ledgerData]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount.replace(/,/g, ""));
    if (!form.merchant.trim()) {
      setFormError("Enter a merchant or source.");
      return;
    }
    if (!amt || amt <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }
    setFormError(null);

    const dayOfMonth = String(new Date(form.date + "T00:00:00").getDate()).padStart(2, "0");
    const entry = { id: newId(), d: dayOfMonth, m: form.merchant.trim(), a: Math.round(amt * 100) / 100 };

    setLedgerData((prev) => {
      // First real transaction clears the sample data so it doesn't confuse the numbers
      const base = isSample
        ? MONTHS.reduce((acc, key) => ({ ...acc, [key]: { income: [], expenses: [] } }), {})
        : prev;

      const current = base[month] || { income: [], expenses: [] };
      const next = { ...base, [month]: { income: [...current.income], expenses: [...current.expenses] } };
      if (form.type === "income") {
        next[month].income.push(entry);
      } else {
        next[month].expenses.push({ ...entry, c: form.category });
      }
      return next;
    });

    if (isSample) setIsSample(false);

    setForm((f) => ({ merchant: "", category: CATEGORIES[0], amount: "", type: "expense", date: f.date }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleLoadSample = () => {
    setAnchorDate(new Date());
    setMonthIdx(2);
    setLedgerData(buildSampleData(getRollingMonths(new Date())));
    setIsSample(true);
  };

  const startEditingBudget = (cat) => {
    setEditingCat(cat);
    setEditValue(String(budgets[cat]));
  };

  const saveBudgetEdit = (cat) => {
    const val = parseFloat(editValue.replace(/,/g, ""));
    if (!isNaN(val) && val >= 0) {
      setBudgets((prev) => ({ ...prev, [cat]: Math.round(val * 100) / 100 }));
    }
    setEditingCat(null);
  };

  const handleDeleteTransaction = (id, type) => {
    setLedgerData((prev) => {
      const cur = prev[month] || { income: [], expenses: [] };
      const key = type === "in" ? "income" : "expenses";
      const removed = cur[key].find((r) => r.id === id);
      const nextArr = cur[key].filter((r) => r.id !== id);
      const next = { ...prev, [month]: { ...cur, [key]: nextArr } };
      if (removed) {
        showToast(`Deleted "${removed.m}"`, () => {
          setLedgerData((p2) => {
            const cur2 = p2[month] || { income: [], expenses: [] };
            return { ...p2, [month]: { ...cur2, [key]: [...cur2[key], removed] } };
          });
        });
      }
      return next;
    });
  };

  const startEditingTx = (r) => {
    setEditingTxId(r.id);
    setEditTxForm({ merchant: r.m, amount: String(r.a), category: r.c || CATEGORIES[0] });
  };

  const saveTxEdit = (id, type) => {
    const amt = parseFloat(editTxForm.amount.replace(/,/g, ""));
    if (!editTxForm.merchant.trim() || isNaN(amt) || amt <= 0) {
      setEditingTxId(null);
      return;
    }
    setLedgerData((prev) => {
      const cur = prev[month] || { income: [], expenses: [] };
      const key = type === "in" ? "income" : "expenses";
      const updated = cur[key].map((r) =>
        r.id === id
          ? { ...r, m: editTxForm.merchant.trim(), a: Math.round(amt * 100) / 100, ...(type === "out" ? { c: editTxForm.category } : {}) }
          : r
      );
      return { ...prev, [month]: { ...cur, [key]: updated } };
    });
    setEditingTxId(null);
  };

  const handleExportCSV = () => {
    const rows = [["Month", "Date", "Type", "Category", "Merchant", "Amount"]];
    Object.keys(ledgerData).sort().forEach((m) => {
      const md = ledgerData[m];
      (md.income || []).forEach((r) => rows.push([m, r.d, "Income", "", r.m, r.a]));
      (md.expenses || []).forEach((r) => rows.push([m, r.d, "Expense", r.c || "", r.m, r.a]));
    });
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    const limit = parseFloat(newCatLimit.replace(/,/g, ""));
    if (!name || budgets[name] !== undefined || isNaN(limit) || limit < 0) return;
    setBudgets((prev) => ({ ...prev, [name]: Math.round(limit * 100) / 100 }));
    setNewCatName("");
    setNewCatLimit("");
  };

  const handleRemoveCategory = (cat) => {
    if (CATEGORIES.length <= 1) return;
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const handleImportCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(String(e.target.result));
        const body = rows.slice(1); // skip header
        if (body.length === 0) {
          showToast("No rows found in that file.");
          return;
        }
        let imported = 0;
        setLedgerData((prev) => {
          const base = isSample ? {} : { ...prev };
          body.forEach(([m, d, type, cat, merchant, amount]) => {
            if (!m || !merchant) return;
            const amt = parseFloat(amount);
            if (isNaN(amt)) return;
            const existing = base[m] || { income: [], expenses: [] };
            base[m] = { income: [...existing.income], expenses: [...existing.expenses] };
            const entry = { id: newId(), d: d || "01", m: merchant, a: amt };
            if (type === "Income") base[m].income.push(entry);
            else base[m].expenses.push({ ...entry, c: cat || CATEGORIES[0] });
            imported++;
          });
          return base;
        });
        if (isSample) setIsSample(false);
        showToast(`Imported ${imported} transaction${imported === 1 ? "" : "s"}.`);
      } catch {
        showToast("Import failed — check the CSV format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: "100vh", color: PAPER, position: "relative" }} className="font-sans">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 flex items-center gap-3 text-sm"
          style={{ zIndex: 50, background: "rgba(18,24,31,0.95)", border: "1px solid #2A3440", color: PAPER, backdropFilter: "blur(10px)" }}
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              onClick={() => { toast.undo(); setToast(null); }}
              className="font-mono text-xs uppercase tracking-wide"
              style={{ color: BRASS }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      <style>{`
        @keyframes qfFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .qf-card { animation: qfFadeUp 0.5s ease-out both; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .qf-card:hover { transform: translateY(-2px); border-color: rgba(201,162,75,0.35) !important; box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
        @keyframes qfTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .qf-ticker-track { animation: qfTicker 28s linear infinite; }
        @keyframes qfPulseRing { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
        .qf-pulse-ring { animation: qfPulseRing 1.6s cubic-bezier(0,0,0.2,1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .qf-card { animation: none; }
          .qf-card:hover { transform: none; }
          .qf-ticker-track { animation: none; }
          .qf-pulse-ring { animation: none; }
        }
      `}</style>
      <BackgroundArt />
      <div className="max-w-6xl mx-auto px-6 py-10" style={{ position: "relative", zIndex: 1 }}>

        {/* Quant ticker strip */}
        {byCategory.length > 0 && (
          <div
            className="mb-6 rounded-md overflow-hidden"
            style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440" }}
          >
            <div className="flex whitespace-nowrap py-2 qf-ticker-track" style={{ width: "200%" }}>
              {[...byCategory, ...byCategory].map((c, i) => {
                const pct = totals.expenses ? Math.round((c.value / totals.expenses) * 100) : 0;
                const prevMonth = monthIdx > 0 ? MONTHS[monthIdx - 1] : null;
                const prevVal = prevMonth
                  ? (ledgerData[prevMonth]?.expenses || []).filter((r) => r.c === c.name).reduce((s, r) => s + r.a, 0)
                  : 0;
                const delta = prevVal ? Math.round(((c.value - prevVal) / prevVal) * 100) : null;
                const up = delta !== null && delta > 0;
                const down = delta !== null && delta < 0;
                return (
                  <span key={i} className="font-mono text-xs px-5 flex items-center gap-1.5" style={{ color: SLATE }}>
                    <span style={{ color: CATEGORY_COLORS[c.name] || SLATE }}>●</span>
                    <span style={{ color: PAPER }}>{c.name.toUpperCase()}</span>
                    <span>{pct}%</span>
                    {delta !== null && (
                      <span style={{ color: up ? BRICK : down ? JADE : SLATE }}>
                        {up ? "▲" : down ? "▼" : "–"} {Math.abs(delta)}%
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl" style={{ color: PAPER }}>QuantFlow</h1>
            <div className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: SLATE }}>Smart Budget & Expense Analytics</div>
          </div>
          <div className="flex gap-1 rounded-full p-1" style={{ background: "rgba(28,36,46,0.6)", backdropFilter: "blur(8px)" }}>
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setMonthIdx(i)}
                className="px-4 py-1.5 rounded-full text-sm font-mono transition"
                style={{
                  background: i === monthIdx ? BRASS : "transparent",
                  color: i === monthIdx ? INK : SLATE,
                }}
              >
                {m.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="qf-pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: JADE }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: JADE }} />
            </span>
            <span className="font-mono text-xs tracking-wider" style={{ color: SLATE }}>LIVE PACING MODEL — RECALCULATING EACH ENTRY</span>
          </div>
          <div className="flex items-center gap-2">
            <label
              className="font-mono text-xs px-3 py-1.5 rounded-md cursor-pointer"
              style={{ background: "rgba(28,36,46,0.6)", color: SLATE, border: "1px solid #2A3440" }}
            >
              ⇧ IMPORT CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleImportCSV(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={handleExportCSV}
              className="font-mono text-xs px-3 py-1.5 rounded-md"
              style={{ background: "rgba(28,36,46,0.6)", color: SLATE, border: "1px solid #2A3440" }}
            >
              ⇩ EXPORT CSV
            </button>
          </div>
        </div>

        {isSample && (
          <div
            className="rounded-lg px-4 py-3 mb-4 text-sm flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "#2A2417", border: "1px solid #4A3F26", color: BRASS }}
          >
            <span>You're viewing sample data — add a transaction below and it'll replace these numbers.</span>
          </div>
        )}

        {insight && (
          <div
            className="qf-card rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-3"
            style={{ background: "rgba(63,167,150,0.08)", border: "1px solid rgba(63,167,150,0.3)", color: JADE, animationDelay: "40ms" }}
          >
            <span aria-hidden="true">✦</span>
            <span style={{ color: PAPER }}>{insight}</span>
          </div>
        )}

        {/* Hero balance */}
        <div
          className="qf-card rounded-2xl p-8 mb-8"
          style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440", animationDelay: "80ms" }}
        >
          <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: SLATE }}>Net for {month}</div>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="font-mono text-5xl md:text-6xl" style={{ color: totals.net >= 0 ? JADE : BRICK }}>
              {totals.net >= 0 ? "+" : "−"}{fmt(Math.abs(totals.net))}
            </div>
            <div className="text-sm pb-2" style={{ color: SLATE }}>
              {totals.savingsRate}% of income kept
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Income", value: totals.income, color: JADE, delta: quant.incomeDelta, spark: quant.incomeSeries },
            { label: "Expenses", value: totals.expenses, color: BRICK, delta: quant.expenseDelta, spark: quant.expenseSeries, invert: true },
            { label: "Saved this month", value: byCategory.find((c) => c.name === "Savings")?.value || 0, color: BRASS, spark: quant.savingsSeries },
            { label: "Savings rate", value: null, display: `${totals.savingsRate}%`, color: TEAL },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className="qf-card rounded-xl p-5"
              style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440", animationDelay: `${120 + i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wider" style={{ color: SLATE }}>{kpi.label}</div>
                {kpi.delta !== null && kpi.delta !== undefined && (
                  <span
                    className="font-mono text-xs"
                    style={{ color: (kpi.invert ? kpi.delta > 0 : kpi.delta < 0) ? BRICK : kpi.delta === 0 ? SLATE : JADE }}
                  >
                    {kpi.delta > 0 ? "▲" : kpi.delta < 0 ? "▼" : "–"} {Math.abs(kpi.delta)}%
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="font-mono text-2xl" style={{ color: kpi.color }}>
                  {kpi.display ?? fmt(kpi.value)}
                </div>
                {kpi.spark && <Sparkline values={kpi.spark} color={kpi.color} />}
              </div>
            </div>
          ))}
        </div>

        {/* Quant stats strip */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-10 px-1">
          <div className="font-mono text-xs" style={{ color: SLATE }}>
            AVG MONTHLY SPEND <span style={{ color: PAPER }}>{fmt(quant.avgExpense)}</span>
          </div>
          <div className="font-mono text-xs" style={{ color: SLATE }}>
            3M VOLATILITY (σ) <span style={{ color: PAPER }}>{fmt(quant.volatility)}</span>
          </div>
          <div className="font-mono text-xs" style={{ color: SLATE }}>
            EFFICIENCY <span style={{ color: totals.savingsRate >= 15 ? JADE : totals.savingsRate >= 0 ? BRASS : BRICK }}>
              {totals.savingsRate >= 15 ? "STRONG" : totals.savingsRate >= 0 ? "STABLE" : "AT RISK"}
            </span>
          </div>
          {quant.isCurrentMonth && (
            <div className="font-mono text-xs" style={{ color: SLATE }}>
              PROJECTED MONTH-END <span style={{ color: quant.projPct > 5 ? BRICK : quant.projPct < -5 ? JADE : BRASS }}>
                {fmt(quant.projected)} ({quant.projPct > 0 ? "+" : ""}{quant.projPct}% vs budget)
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left column: charts */}
          <div className="md:col-span-3 space-y-8">

            <div className="qf-card rounded-xl p-6" style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440", animationDelay: "280ms" }}>
              <h2 className="font-serif text-xl mb-4" style={{ color: PAPER }}>Where it went — {month}</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={220} style={{ maxWidth: 220 }}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {byCategory.map((entry) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || SLATE} stroke={INK_SOFT} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: INK, border: "1px solid #2A3440", color: PAPER }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 w-full space-y-2">
                  {byCategory.sort((a,b)=>b.value-a.value).map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: CATEGORY_COLORS[c.name] || SLATE }} />
                        <span style={{ color: SLATE }}>{c.name}</span>
                      </div>
                      <span className="font-mono" style={{ color: PAPER }}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="qf-card rounded-xl p-6" style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440", animationDelay: "320ms" }}>
              <h2 className="font-serif text-xl mb-4" style={{ color: PAPER }}>Income vs. expenses, 3-month trend</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trend} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3440" vertical={false} />
                  <XAxis dataKey="month" stroke={SLATE} fontSize={12} />
                  <YAxis stroke={SLATE} fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: INK, border: "1px solid #2A3440", color: PAPER }} />
                  <Legend />
                  <Bar dataKey="Income" fill={JADE} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill={BRICK} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="qf-card rounded-xl p-6" style={{ background: "rgba(28,36,46,0.55)", backdropFilter: "blur(10px)", border: "1px solid #2A3440", animationDelay: "360ms" }}>
              <h2 className="font-serif text-xl mb-4" style={{ color: PAPER }}>Budget vs. actual — {month}</h2>
              <div className="space-y-4">
                {Object.entries(budgets).map(([cat, budget]) => {
                  const actual = byCategory.find((c) => c.name === cat)?.value || 0;
                  const pct = Math.min(100, Math.round((actual / budget) * 100));
                  const over = actual > budget;
                  const paceRatio = budget ? (actual / budget) / (quant.elapsedFraction || 1) : 0;
                  const signal = paceRatio >= 1.15 ? "OVER" : paceRatio >= 0.9 ? "WATCH" : "ON PACE";
                  const signalColor = signal === "OVER" ? BRICK : signal === "WATCH" ? BRASS : JADE;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span style={{ color: PAPER }}>{cat}</span>
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                            style={{ color: signalColor, border: `1px solid ${signalColor}`, letterSpacing: "0.05em" }}
                          >
                            {signal}
                          </span>
                          {CATEGORIES.length > 1 && (
                            <button
                              onClick={() => handleRemoveCategory(cat)}
                              title="Remove category"
                              className="text-xs"
                              style={{ color: SLATE }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {editingCat === cat ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs" style={{ color: SLATE }}>{fmt(actual)} /</span>
                            <input
                              autoFocus
                              type="text"
                              inputMode="decimal"
                              value={editValue}
                              onChange={(e) => {
                                if (/^[0-9,]*\.?[0-9]*$/.test(e.target.value)) setEditValue(e.target.value);
                              }}
                              onKeyDown={(e) => e.key === "Enter" && saveBudgetEdit(cat)}
                              onBlur={() => saveBudgetEdit(cat)}
                              className="font-mono text-xs w-16 px-1 py-0.5 rounded outline-none"
                              style={{ background: "#0E1620", color: PAPER, border: `1px solid ${BRASS}` }}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingBudget(cat)}
                            className="font-mono text-xs hover:underline"
                            style={{ color: over ? BRICK : SLATE }}
                            title="Click to edit limit"
                          >
                            {fmt(actual)} / {fmt(budget)} ✎
                          </button>
                        )}
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#2A3440" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: over ? BRICK : CATEGORY_COLORS[cat] || BRASS }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddCategory} className="flex items-center gap-2 mt-5 pt-4 border-t" style={{ borderColor: "#2A3440" }}>
                <input
                  type="text"
                  placeholder="New category"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 text-sm font-mono px-2 py-1.5 rounded outline-none"
                  style={{ background: "rgba(14,22,32,0.6)", color: PAPER, border: "1px solid #2A3440" }}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Limit"
                  value={newCatLimit}
                  onChange={(e) => {
                    if (/^[0-9,]*\.?[0-9]*$/.test(e.target.value)) setNewCatLimit(e.target.value);
                  }}
                  className="w-20 text-sm font-mono px-2 py-1.5 rounded outline-none"
                  style={{ background: "rgba(14,22,32,0.6)", color: PAPER, border: "1px solid #2A3440" }}
                />
                <button
                  type="submit"
                  className="text-xs font-mono px-3 py-1.5 rounded uppercase tracking-wide"
                  style={{ background: BRASS, color: INK }}
                >
                  + Add
                </button>
              </form>
            </div>
          </div>

          {/* Right column: receipt-style ledger */}
          <div className="md:col-span-2 qf-card" style={{ animationDelay: "200ms" }}>
            <div className="rounded-t-md overflow-hidden" style={{ background: PAPER }}>
              <TornEdge />
            </div>
            <div className="px-6 py-6" style={{ background: PAPER, color: INK }}>
              <div className="text-center font-mono text-xs tracking-widest mb-1" style={{ color: "#6B6255" }}>
                * * * QUANTFLOW * * *
              </div>
              <div className="text-center font-serif text-lg mb-4">{month}</div>

              <form onSubmit={handleAddTransaction} className="mb-5 pb-5 border-b border-dashed" style={{ borderColor: "#B9AF9E" }}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
                    className="text-xs py-1.5 rounded font-mono uppercase tracking-wide"
                    style={{
                      background: form.type === "expense" ? "#7A2E24" : "transparent",
                      color: form.type === "expense" ? PAPER : "#7A2E24",
                      border: "1px solid #7A2E24",
                    }}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "income" }))}
                    className="text-xs py-1.5 rounded font-mono uppercase tracking-wide"
                    style={{
                      background: form.type === "income" ? "#1E6B5C" : "transparent",
                      color: form.type === "income" ? PAPER : "#1E6B5C",
                      border: "1px solid #1E6B5C",
                    }}
                  >
                    Income
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Merchant or source"
                  value={form.merchant}
                  onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                  className="w-full text-sm font-mono mb-2 px-2 py-1.5 rounded outline-none"
                  style={{ background: "#EDE6D6", color: INK, border: "1px solid #B9AF9E" }}
                />

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-sm font-mono mb-2 px-2 py-1.5 rounded outline-none"
                  style={{ background: "#EDE6D6", color: INK, border: "1px solid #B9AF9E" }}
                />

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Allow digits, one comma-separated thousands format, and one decimal point
                      if (/^[0-9,]*\.?[0-9]*$/.test(raw)) {
                        setForm((f) => ({ ...f, amount: raw }));
                      }
                    }}
                    className="text-sm font-mono px-2 py-1.5 rounded outline-none"
                    style={{ background: "#EDE6D6", color: INK, border: "1px solid #B9AF9E" }}
                  />
                  {form.type === "expense" ? (
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="text-sm font-mono px-2 py-1.5 rounded outline-none"
                      style={{ background: "#EDE6D6", color: INK, border: "1px solid #B9AF9E" }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center text-xs" style={{ color: "#8A8072" }}>logged as income</div>
                  )}
                </div>

                {formError && (
                  <div className="text-xs mb-2" style={{ color: "#7A2E24" }}>{formError}</div>
                )}

                <button
                  type="submit"
                  className="w-full text-sm font-mono py-2 rounded uppercase tracking-wide"
                  style={{ background: INK, color: PAPER }}
                >
                  {justAdded ? "Added ✓" : `+ Add to ${month}`}
                </button>
              </form>

              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-mono mb-3 px-2 py-1.5 rounded outline-none"
                style={{ background: "#EDE6D6", color: INK, border: "1px solid #B9AF9E" }}
              />

              <div className="space-y-2 font-mono text-xs">
                {filteredLedger.length === 0 && (
                  <div className="text-center py-2" style={{ color: "#8A8072" }}>No matching transactions.</div>
                )}
                {filteredLedger.map((r) => (
                  <div key={r.id}>
                    {editingTxId === r.id ? (
                      <div className="py-1 space-y-1.5" style={{ background: "#EDE6D6" }}>
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={editTxForm.merchant}
                            onChange={(e) => setEditTxForm((f) => ({ ...f, merchant: e.target.value }))}
                            className="flex-1 text-xs font-mono px-1.5 py-1 rounded outline-none"
                            style={{ background: "#fff", color: INK, border: "1px solid #B9AF9E" }}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editTxForm.amount}
                            onChange={(e) => {
                              if (/^[0-9,]*\.?[0-9]*$/.test(e.target.value)) setEditTxForm((f) => ({ ...f, amount: e.target.value }));
                            }}
                            className="w-16 text-xs font-mono px-1.5 py-1 rounded outline-none"
                            style={{ background: "#fff", color: INK, border: "1px solid #B9AF9E" }}
                          />
                        </div>
                        {r.type === "out" && (
                          <select
                            value={editTxForm.category}
                            onChange={(e) => setEditTxForm((f) => ({ ...f, category: e.target.value }))}
                            className="w-full text-xs font-mono px-1.5 py-1 rounded outline-none"
                            style={{ background: "#fff", color: INK, border: "1px solid #B9AF9E" }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-3 justify-end">
                          <button type="button" onClick={() => setEditingTxId(null)} style={{ color: "#8A8072" }}>Cancel</button>
                          <button type="button" onClick={() => saveTxEdit(r.id, r.type)} style={{ color: "#1E6B5C" }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span style={{ color: "#8A8072", width: 34 }}>{r.d}</span>
                        <span className="flex-1 truncate">{r.m}</span>
                        <span className="flex-1 border-b border-dotted" style={{ borderColor: "#B9AF9E" }} />
                        <span style={{ color: r.type === "in" ? "#1E6B5C" : "#7A2E24" }}>
                          {r.type === "in" ? "+" : "−"}{fmt(r.a).replace("$", "")}
                        </span>
                        <button onClick={() => startEditingTx(r)} style={{ color: "#8A8072" }} title="Edit">✎</button>
                        <button onClick={() => handleDeleteTransaction(r.id, r.type)} style={{ color: "#8A8072" }} title="Delete">×</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed mt-4 pt-3 flex justify-between font-mono text-xs" style={{ borderColor: "#B9AF9E" }}>
                <span>TOTAL IN</span><span>{fmt(totals.income)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs mt-1">
                <span>TOTAL OUT</span><span>{fmt(totals.expenses)}</span>
              </div>
              {!isSample && (
                <button
                  onClick={handleLoadSample}
                  className="w-full text-center text-xs mt-4 underline"
                  style={{ color: "#8A8072" }}
                >
                  Reset to sample data
                </button>
              )}
            </div>
            <div className="rounded-b-md overflow-hidden" style={{ background: PAPER }}>
              <TornEdge flip />
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-10" style={{ color: "#3F4A56" }}>
          {isSample ? "Sample data" : "Your data, saved locally in this browser"} · built with React &amp; Recharts
        </div>
        <div className="text-center text-xs mt-2" style={{ color: "#3F4A56" }}>
          Created by Anahad Gill
        </div>
      </div>
    </div>
  );
}