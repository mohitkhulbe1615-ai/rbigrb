import { useState, useEffect, useRef, useCallback } from "react";
import { FALLBACK_BANK } from "./questions_index.js";

// ═══════════════════════════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    bg: "#0A0F1C", bgCard: "rgba(255,255,255,0.03)", bgCardHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.06)", borderActive: "rgba(255,255,255,0.12)",
    text: "#E8ECF4", textSecondary: "#94A3B8", textMuted: "#64748B",
    accent: "#0E7C6B", accentGlow: "rgba(14,124,107,0.15)",
    correct: "#10B981", wrong: "#EF4444", skip: "#F59E0B",
    grain: 0.03,
  },
  light: {
    bg: "#F5F5F0", bgCard: "rgba(0,0,0,0.02)", bgCardHover: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.08)", borderActive: "rgba(0,0,0,0.15)",
    text: "#1A1A2E", textSecondary: "#4A5568", textMuted: "#718096",
    accent: "#0E7C6B", accentGlow: "rgba(14,124,107,0.08)",
    correct: "#059669", wrong: "#DC2626", skip: "#D97706",
    grain: 0.015,
  },
};

// ═══════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════
const SUBJECTS = [
  { id: "ga", label: "General Awareness", icon: "🌍", color: "#2E5A88", desc: "Banking, Static GK, Constitution, Orgs" },
  { id: "ca", label: "Current Affairs", icon: "📰", color: "#C0392B", desc: "Last 6 months — RBI, Budget, Economy, Events" },
  { id: "esi", label: "Economic & Social Issues", icon: "📊", color: "#0E7C6B", desc: "Indian Economy, Monetary Policy, Social Dev" },
  { id: "fm", label: "Finance & Management", icon: "💰", color: "#B8860B", desc: "Banking, Financial Markets, Management" },
  { id: "quant", label: "Quantitative Aptitude", icon: "🔢", color: "#8B3A62", desc: "DI, Arithmetic, Number Series" },
  { id: "english", label: "English Language", icon: "📝", color: "#5B4A8A", desc: "RC, Grammar, Vocabulary" },
  { id: "reasoning", label: "Reasoning Ability", icon: "🧩", color: "#9B4D2B", desc: "Puzzles, Syllogism, Coding-Decoding" },
];

const QCOUNTS = [10, 15, 20, 25, 30, 50, 80];

// ═══════════════════════════════════════════════════════════
// SYSTEM PROMPT FOR AI QUESTION GENERATION
// ═══════════════════════════════════════════════════════════
function buildPrompt(subject, count, usedQuestions) {
  const base = {
    ga: `Generate ${count} MCQs for RBI Grade B Phase 1 General Awareness section.
CRITICAL RULES:
- GA in RBI Grade B covers LAST 6 MONTHS of current affairs (Nov 2025 – Apr 2026), banking awareness, static GK
- Focus areas: RBI policies/circulars/notifications, banking industry updates, govt schemes launched/modified, international summits/agreements, awards & appointments, books & authors, sports events, defence exercises, economic indicators (GDP, inflation, fiscal deficit), Union Budget 2025-26 highlights, important committees, financial institution headquarters & heads
- Mix: ~50% current affairs (last 6 months), ~30% banking/financial awareness, ~20% static GK
- Difficulty: Moderate to Hard (RBI Grade B level, not SBI PO level)
- Style: Similar to actual RBI Grade B PYQs — specific, factual, no vague options
- AVOID generic trivia. Focus on banking/economy/governance current affairs`,

    esi: `Generate ${count} MCQs for RBI Grade B Phase 2 Economic & Social Issues (ESI).
CRITICAL RULES:
- Cover: National Income measurement (GDP, GNP, NNP, GVA), Poverty & Unemployment, Financial Inclusion (PMJDY, MUDRA, etc.), Indian Banking System, Monetary Policy (repo, reverse repo, CRR, SLR, LAF, MSF), Fiscal Policy (budget, taxation, FRBM), BOP & External Sector, Inflation targeting, Sustainable Development & SDGs, Social Sector (health, education, HDI), Digital Payments ecosystem, Agricultural sector reforms, Industrial policy, Environmental issues
- Include recent data: current repo rate, GDP growth rate, inflation figures, fiscal deficit targets
- RBI Grade B Mains level difficulty — analytical, not just recall
- Some questions should test understanding of concepts, not just definitions`,

    fm: `Generate ${count} MCQs for RBI Grade B Phase 2 Finance & Management.
CRITICAL RULES:
- Finance topics: RBI structure & functions (RBI Act 1934 sections), Banking Regulation Act 1949, SEBI & capital markets, G-Secs & money market instruments, T-Bills, NPA classification & resolution (IBC, SARFAESI), Basel III norms, NBFC regulations, FinTech & digital banking, Payment & Settlement systems (RTGS, NEFT, UPI), Financial derivatives, Credit rating, ALM, Priority Sector Lending, KYC/AML, Deposit insurance (DICGC)
- Management topics: Planning/Organizing/Staffing/Directing/Controlling, Motivation theories (Maslow, Herzberg, McGregor), Leadership styles, Communication, SWOT/PESTEL/BCG/Porter's Five Forces, MBO, Change Management, Corporate Governance, Ethics at workplace, CSR, Organizational Behavior, HRM concepts
- Include recent: FinTech regulations, CBDC developments, recent RBI circulars`,

    quant: `Generate ${count} MCQs for RBI Grade B Phase 1 Quantitative Aptitude.
CRITICAL RULES:
- Focus areas: Data Interpretation (bar/line/pie/table/caselet based — HIGH weightage), Number Series (wrong number, missing number), Simplification/Approximation, Quadratic Equations, Arithmetic (Profit-Loss, SI-CI, Time-Work, Time-Speed-Distance, Mixtures, Partnerships, Percentages, Ratio-Proportion, Ages, Averages, Mensuration)
- DI should be 30-40% of questions
- Difficulty: Higher than SBI PO, needs calculation-heavy problems
- Include data sets for DI questions (provide the data in the question text)`,

    english: `Generate ${count} MCQs for RBI Grade B Phase 1 English Language.
CRITICAL RULES:
- Focus areas: Reading Comprehension (economy/banking/policy themed passages), Error Spotting (grammar errors in sentences), Sentence Improvement, Fill in the blanks (vocabulary & grammar), Cloze Test, Para Jumbles, Sentence Connectors, Vocabulary (synonyms, antonyms, idioms)
- Difficulty: Graduate level, formal English, banking/economy context
- Error spotting should test: Subject-verb agreement, tense, articles, prepositions, modifiers
- Vocabulary should be advanced but practical (words seen in RBI reports/economic writing)`,

    reasoning: `Generate ${count} MCQs for RBI Grade B Phase 1 Reasoning Ability.
CRITICAL RULES:
- Focus areas: Puzzles & Seating Arrangement (linear, circular — HIGH weightage), Syllogism, Coding-Decoding, Blood Relations, Direction & Distance, Inequalities (coded), Input-Output, Data Sufficiency, Order & Ranking, Number/Alphabet based problems, Logical reasoning
- Puzzles should be 30-40% of questions, with proper clue-based scenarios
- Difficulty: Higher than IBPS PO, similar to RBI Grade B PYQ pattern
- For puzzles: provide complete scenario with 5-7 variables and conditions`,
  };

  let prompt = base[subject] || base.ga;
  
  if (usedQuestions && usedQuestions.length > 0) {
    prompt += `\n\nIMPORTANT — DO NOT REPEAT these previously asked questions:\n${usedQuestions}\n\nGenerate COMPLETELY DIFFERENT questions on different sub-topics.`;
  }

  prompt += `\n\nRespond with ONLY a JSON array. No markdown, no backticks, no other text.
Each element: {"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","topic":"sub-topic name"}`;

  return prompt;
}

// ═══════════════════════════════════════════════════════════
// COMPREHENSIVE REVISION NOTES (EXPANDED)
// ═══════════════════════════════════════════════════════════
const REVISION_NOTES = {
  ga: [
    { title: "RBI — Structure & Key Facts", points: [
      "Established: 1 April 1935, under RBI Act 1934",
      "Nationalized: 1 January 1949",
      "HQ: Mumbai (Mint Street → Shahid Bhagat Singh Marg)",
      "Current Governor: search for latest — changes periodically",
      "4 Deputy Governors at any time",
      "21 Regional offices across India",
      "RBI's financial year: April to March",
      "Official Seal: emblem of the East India Company's double mohur gold coin (Tiger & Palm tree)",
      "Section 22 — Sole authority to issue bank notes",
      "Section 42 — CRR, Section 24 — SLR",
    ]},
    { title: "Important Banking Terms", points: [
      "CASA Ratio — Current Account + Savings Account deposits as % of total deposits",
      "NIM — Net Interest Margin = (Interest Earned - Interest Expended) / Average Earning Assets",
      "GNPA — Gross NPA = Total NPAs / Gross Advances",
      "NNPA — Net NPA = (Gross NPA - Provisions) / (Gross Advances - Provisions)",
      "ROA — Return on Assets = Net Profit / Total Assets",
      "ROE — Return on Equity = Net Profit / Shareholders' Equity",
      "CRAR = (Tier 1 + Tier 2 Capital) / Risk Weighted Assets",
      "PCR — Provision Coverage Ratio = Total Provisions / Gross NPAs",
      "MCLR — Marginal Cost of Funds Based Lending Rate (replaced Base Rate in 2016)",
      "EBR — External Benchmark Rate (linked to repo rate, mandatory since Oct 2019)",
    ]},
    { title: "Important Committees", points: [
      "Narasimham Committee I (1991) — Banking reforms, reduce CRR/SLR, deregulate interest rates",
      "Narasimham Committee II (1998) — Strengthening banking system, merger of strong banks",
      "Urjit Patel Committee (2014) — Inflation targeting framework, recommended CPI as anchor",
      "PJ Nayak Committee (2014) — Governance of bank boards",
      "Damodaran Committee (2011) — Customer service in banks",
      "Nachiket Mor Committee (2014) — Financial inclusion, payments bank concept",
      "YH Malegam Committee (2010) — Microfinance institutions",
      "Bimal Jalan Committee (2019) — Economic Capital Framework of RBI",
      "KV Kamath Committee (2020) — COVID-19 loan restructuring parameters",
      "Internal Working Group (2020) — Ownership & corporate structure of private banks",
    ]},
    { title: "International Organizations", points: [
      "IMF — HQ Washington DC, 190 members, SDR basket (USD, EUR, CNY, JPY, GBP), MD: check latest",
      "World Bank Group — IBRD, IDA, IFC, MIGA, ICSID, HQ Washington DC",
      "ADB — HQ Manila, Philippines, 68 members, established 1966",
      "NDB (New Development Bank) — BRICS bank, HQ Shanghai, established 2014",
      "AIIB — HQ Beijing, 109 members, established 2016",
      "BIS — Bank for International Settlements, HQ Basel, Switzerland (central bank for central banks)",
      "FSB — Financial Stability Board, HQ Basel, G20 body monitoring global financial system",
      "FATF — Financial Action Task Force, HQ Paris, AML/CFT standards",
      "WTO — HQ Geneva, 164 members, DG: check latest",
      "UNCTAD — HQ Geneva, promotes developing country integration into world economy",
    ]},
    { title: "Constitutional & Statutory Bodies", points: [
      "CAG — Art 148, auditor of all govt accounts",
      "UPSC — Art 315, recruitment to central services",
      "Election Commission — Art 324, conducts elections",
      "Finance Commission — Art 280, centre-state revenue distribution, constituted every 5 years",
      "GST Council — Art 279A, chaired by Union FM",
      "NITI Aayog — Replaced Planning Commission (2015), think tank",
      "National Human Rights Commission — Protection of Human Rights Act 1993",
      "Lokpal — At centre, Lokayukta at state level",
      "CVC — Central Vigilance Commission, anti-corruption statutory body",
      "NCLT — National Company Law Tribunal, adjudicates IBC cases",
    ]},
    { title: "Static GK — India Quick Facts", points: [
      "Total States: 28, UTs: 8",
      "Largest state by area: Rajasthan, by population: UP",
      "Longest river: Ganga (in India), Brahmaputra (by discharge)",
      "India's rank in area: 7th, population: 1st (overtook China 2023)",
      "Tropic of Cancer passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram",
      "National Animal: Bengal Tiger, National Bird: Peacock",
      "India's first satellite: Aryabhata (1975), Space agency: ISRO (est. 1969)",
      "First bank in India: Bank of Hindustan (1770), first nationalized: Imperial Bank → SBI (1955)",
      "Parliament: Lok Sabha (543 elected) + Rajya Sabha (245)",
      "Supreme Court: CJI + 33 judges (max 34 including CJI)",
    ]},
    { title: "Awards & Sports — Key Facts", points: [
      "Bharat Ratna — Highest civilian award, no monetary grant",
      "Padma Awards — Padma Vibhushan > Padma Bhushan > Padma Shri",
      "Nobel Peace Prize 2024, Pulitzer, Man Booker — check latest winners",
      "Arjuna Award — outstanding sports performance, Dronacharya — coaching",
      "Khel Ratna (now Major Dhyan Chand Khel Ratna) — highest sporting honour",
      "Cricket World Cup 2023 — hosted by India, won by Australia",
      "Olympic 2024 Paris — India's medals: check latest",
      "FIFA — HQ Zurich, ICC — HQ Dubai, IOC — HQ Lausanne",
    ]},
  ],
  esi: [
    { title: "National Income Concepts", points: [
      "GDP = Total value of goods & services produced within country in a year",
      "GNP = GDP + Net Factor Income from Abroad (NFIA)",
      "NNP = GNP - Depreciation (also called National Income at factor cost)",
      "Per Capita Income = National Income / Population",
      "GVA (Gross Value Added) = GDP at basic prices (new method since 2015, base year 2011-12)",
      "GDP at Market Price = GVA + Net Taxes on Products",
      "Three methods: Production/Value Added, Income, Expenditure",
      "GDP Expenditure method: C + I + G + (X-M)",
      "CSO (now NSO — National Statistical Office) calculates GDP",
      "Advance Estimate → First Revised → Second Revised → Third Revised",
    ]},
    { title: "Monetary Policy Framework", points: [
      "RBI's primary objective: Price Stability (inflation targeting)",
      "CPI inflation target: 4% ± 2% (2% floor, 6% ceiling)",
      "MPC — 6 members: 3 from RBI (Governor as chair) + 3 external (appointed by GoI)",
      "MPC meets at least 4 times a year (bi-monthly), decision by majority vote",
      "Repo Rate — rate RBI lends to banks (main policy rate)",
      "Reverse Repo — rate RBI borrows from banks (now replaced by SDF)",
      "SDF (Standing Deposit Facility) — floor of LAF corridor (since Apr 2022)",
      "MSF — Marginal Standing Facility, ceiling of LAF corridor (repo + 0.25%)",
      "CRR — Cash Reserve Ratio, % of NDTL with RBI (no interest paid)",
      "SLR — Statutory Liquidity Ratio, % of NDTL in gold/govt securities",
      "Open Market Operations (OMO) — RBI buys/sells govt securities to manage liquidity",
      "LAF — Liquidity Adjustment Facility (repo + reverse repo window)",
    ]},
    { title: "Fiscal Policy & Budget", points: [
      "Fiscal Deficit = Total Expenditure - Total Receipts (excl. borrowings)",
      "Revenue Deficit = Revenue Expenditure - Revenue Receipts",
      "Primary Deficit = Fiscal Deficit - Interest Payments",
      "Effective Revenue Deficit = Revenue Deficit - Grants for creation of capital assets",
      "FRBM Act 2003 — Fiscal Responsibility & Budget Management",
      "FRBM target: Fiscal Deficit at 3% of GDP (often exceeded)",
      "Revenue Receipts: Tax (direct + indirect) + Non-tax (dividends, fees)",
      "Capital Receipts: Borrowings, disinvestment, loan recovery",
      "Revenue Expenditure: Salaries, interest payments, subsidies, pensions",
      "Capital Expenditure: Infra, asset creation, loans to states",
      "Union Budget presented on 1 February each year",
      "GST — implemented 1 July 2017, subsumed 17 taxes, 4 slabs (5/12/18/28%)",
    ]},
    { title: "Balance of Payments & External Sector", points: [
      "BoP = Current Account + Capital Account + Errors & Omissions",
      "Current Account: Trade balance + Services + Primary Income + Secondary Income (remittances)",
      "Capital Account: FDI, FPI, ECBs, NRI deposits, Govt aid",
      "FDI — 10%+ equity stake, long-term, more stable",
      "FPI — <10% stake, portfolio investment, volatile ('hot money')",
      "CAD — Current Account Deficit: imports > exports",
      "India's CAD usually 1-3% of GDP",
      "FEMA 1999 — governs forex transactions, replaced FERA 1973",
      "RBI manages forex reserves (Forex + Gold + SDRs + Reserve Position in IMF)",
      "ECBs — External Commercial Borrowings, regulated by RBI under FEMA",
      "DTAA — Double Taxation Avoidance Agreement",
      "REER — Real Effective Exchange Rate (trade-weighted, inflation-adjusted)",
    ]},
    { title: "Financial Inclusion & Govt Schemes", points: [
      "PMJDY — Pradhan Mantri Jan Dhan Yojana (Aug 2014), zero balance accounts, RuPay card, ₹10K overdraft",
      "PMJJBY — Jeevan Jyoti Bima Yojana, ₹2L life cover, premium ₹436/yr, age 18-50",
      "PMSBY — Suraksha Bima Yojana, ₹2L accidental death, premium ₹20/yr, age 18-70",
      "APY — Atal Pension Yojana, guaranteed pension ₹1K-5K/month post-60, for unorganized sector",
      "MUDRA — Micro Units Development & Refinance Agency",
      "  Shishu: up to ₹50,000 | Kishore: ₹50K-5L | Tarun: ₹5L-10L (updated to ₹20L)",
      "Stand-Up India — SC/ST/Women entrepreneurs, loans ₹10L-1Cr",
      "PM-SVANidhi — Street vendor micro-credit scheme (₹10K → ₹20K → ₹50K)",
      "PMAY — Housing for All, urban & rural (Gramin)",
      "PM-KISAN — ₹6,000/year to farmer families in 3 installments",
      "DBT — Direct Benefit Transfer via Aadhaar-linked accounts",
    ]},
    { title: "Poverty, Unemployment & Social Development", points: [
      "Tendulkar Committee (2009) — Poverty line: ₹816/month (rural), ₹1000/month (urban)",
      "Rangarajan Committee (2014) — ₹972 (rural), ₹1407 (urban) per capita/month",
      "Multidimensional Poverty Index (MPI) — NITI Aayog + UNDP/OPHI",
      "India reduced poverty significantly: ~13.5 crore people escaped MPI poverty (2015-21)",
      "MGNREGA — 100 days guaranteed employment, rural, unskilled manual work",
      "Unemployment rate — PLFS (Periodic Labour Force Survey) by NSO",
      "Types: Structural, Frictional, Cyclical, Disguised (agriculture), Seasonal",
      "HDI — UNDP, measures health (life expectancy), education, income",
      "India's HDI ranking: ~134 out of 193 (check latest UNDP report)",
      "Gini Coefficient — 0 (perfect equality) to 1 (perfect inequality)",
      "SDGs — 17 Sustainable Development Goals, target 2030, adopted 2015",
    ]},
    { title: "Banking System & NPAs", points: [
      "Scheduled Commercial Banks: Public (12), Private (21), Foreign, SFBs (12), Payment Banks",
      "NPA classification: Substandard (<12 months), Doubtful (>12 months), Loss",
      "90-day overdue norm for NPA classification",
      "IBC 2016 — time-bound resolution (330 days max), NCLT adjudicates",
      "SARFAESI Act 2002 — secured creditors can take possession of assets without court",
      "DRT Act 1993 — Debt Recovery Tribunals for banks",
      "PCA Framework — Prompt Corrective Action based on Capital, Asset Quality, Profitability",
      "ARC — Asset Reconstruction Company (buys NPAs at discount)",
      "NARCL — National ARC (bad bank), IDRCL — India Debt Resolution Company",
      "Write-off ≠ Waiver — bank removes from books but recovery continues",
    ]},
    { title: "Digital Payments & FinTech", points: [
      "UPI — Unified Payments Interface, real-time, interoperable, NPCI operated",
      "UPI Lite — small-value offline transactions (up to ₹500 per txn)",
      "IMPS — Immediate Payment Service, 24x7, up to ₹5L",
      "RTGS — Real Time Gross Settlement, minimum ₹2L, 24x7 since Dec 2020",
      "NEFT — National Electronic Funds Transfer, 24x7 since Dec 2019, no minimum",
      "CBDC — Central Bank Digital Currency (e-Rupee), RBI's digital fiat currency",
      "  e₹-W (wholesale) launched Nov 2022, e₹-R (retail) Dec 2022",
      "NPCI — National Payments Corporation of India (UPI, RuPay, BBPS, NACH, etc.)",
      "Account Aggregator Framework — consent-based financial data sharing (RBI regulated)",
      "Regulatory Sandbox — RBI framework for testing FinTech innovations",
      "Digital Lending Guidelines (2022) — all disbursals/repayments through bank accounts",
    ]},
  ],
  fm: [
    { title: "RBI — Functions & Regulatory Framework", points: [
      "Monetary Authority — formulates & implements monetary policy",
      "Issuer of Currency — Section 22, RBI Act 1934 (except ₹1 coin/note by GoI)",
      "Banker to Government — maintains govt accounts, handles debt management",
      "Banker's Bank — maintains CRR, provides lender of last resort facility",
      "Regulator of Banking — Banking Regulation Act 1949",
      "Foreign Exchange Management — under FEMA 1999",
      "Developmental Role — financial inclusion, priority sector lending",
      "Payment & Settlement Systems — Payment & Settlement Systems Act 2007",
      "Section 17 — Business which RBI may transact",
      "Section 18 — Emergency loans (lender of last resort)",
      "Section 35A — Directions to banks (BR Act)",
      "Section 36 — Power to inspect books of banking companies",
    ]},
    { title: "Basel Norms", points: [
      "Basel Committee on Banking Supervision (BCBS) — under BIS, Basel",
      "Basel I (1988) — Minimum 8% CAR, focused on credit risk only",
      "Basel II (2004) — 3 Pillars: Minimum Capital, Supervisory Review, Market Discipline",
      "Basel III (2010, post-GFC) — Enhanced capital & liquidity requirements:",
      "  Min CET1: 4.5%, Tier 1: 6%, Total CAR: 8% (global)",
      "  RBI: Min CET1 5.5%, Tier 1 7%, Total CAR 9% + CCB 2.5% = 11.5%",
      "  Capital Conservation Buffer (CCB): 2.5%",
      "  Countercyclical Buffer: 0-2.5% (at discretion of national regulators)",
      "  D-SIB surcharge: additional capital for systemically important banks",
      "LCR — Liquidity Coverage Ratio: High Quality Liquid Assets / Net Cash Outflows ≥ 100%",
      "NSFR — Net Stable Funding Ratio: Available Stable Funding / Required Stable Funding ≥ 100%",
      "Leverage Ratio: Tier 1 Capital / Total Exposure ≥ 3% (RBI: 4%)",
    ]},
    { title: "Capital & Money Markets", points: [
      "Money Market — short-term (<1 year): Call Money, T-Bills, CP, CD, Repo, CBLO/TREPS",
      "Call Money — overnight interbank lending (only banks & PDs participate)",
      "Notice Money — 2-14 days interbank",
      "T-Bills — 91, 182, 364 days, zero coupon, auctioned by RBI",
      "Commercial Paper (CP) — unsecured promissory note, min ₹5L, 7-365 days",
      "Certificate of Deposit (CD) — by banks, min ₹1L, 7 days to 1 year",
      "TREPS — Triparty Repo, CCIL facilitated, replaced CBLO",
      "Capital Market — long-term: equity, debt, derivatives",
      "Primary Market: IPO, FPO, Rights Issue, OFS, Private Placement",
      "Secondary Market: BSE (1875, oldest in Asia), NSE (1992)",
      "SEBI — Regulator, est. 1988 (statutory body 1992)",
      "T+1 settlement cycle (India moved to T+1 in Jan 2023)",
      "Circuit Breakers: 10%, 15%, 20% on Sensex/Nifty",
    ]},
    { title: "Government Securities & Debt Instruments", points: [
      "G-Secs — sovereign debt issued by GoI, backed by govt guarantee",
      "Dated Securities — medium/long-term (5-40 years), semi-annual coupon",
      "T-Bills — short-term, zero coupon: 91-day, 182-day, 364-day",
      "SDL — State Development Loans, issued by state govts, auctioned by RBI",
      "Cash Management Bills (CMBs) — <91 days, ad hoc, for temporary cash mismatches",
      "Floating Rate Bonds — coupon linked to T-Bill/repo rate",
      "Sovereign Gold Bonds (SGB) — 2.5% fixed interest + gold price appreciation, 8-yr tenure",
      "STRIPS — Separate Trading of Registered Interest and Principal of Securities",
      "NDS-OM — Negotiated Dealing System - Order Matching (electronic platform for G-Secs)",
      "Ways and Means Advances — RBI's short-term credit to Centre/States",
      "Yield Curve — normally upward sloping; inverted yield curve signals recession",
      "Dirty Price vs Clean Price — Dirty = Clean + Accrued Interest",
    ]},
    { title: "Priority Sector Lending & NBFC Regulations", points: [
      "PSL target: 40% of ANBC (Adjusted Net Bank Credit) for domestic banks",
      "75% for RRBs and SFBs",
      "Categories: Agriculture (18%), Micro Enterprises (7.5%), Weaker Sections (12%), Education, Housing, Export credit, Renewable Energy, Others",
      "PSLC — Priority Sector Lending Certificates (tradable on e-Kuber platform)",
      "NBFC registration with RBI mandatory if assets ≥ ₹500 crore (or deposit-taking)",
      "Scale-Based Regulation: NBFC-BL (Base Layer), NBFC-ML (Middle), NBFC-UL (Upper), NBFC-TL (Top)",
      "NBFC-UL treated almost like banks — higher governance, capital requirements",
      "HFC regulated by NHB, Microfinance by RBI (post harmonized framework 2022)",
      "Core Investment Company (CIC) — NBFC holding ≥90% assets as investments in group companies",
    ]},
    { title: "Management Theories — Motivation", points: [
      "Maslow's Hierarchy: Physiological → Safety → Social → Esteem → Self-actualization",
      "Herzberg's Two-Factor: Hygiene factors (salary, conditions) prevent dissatisfaction; Motivators (achievement, recognition) drive satisfaction",
      "McGregor's Theory X (people are lazy, need control) vs Theory Y (people are self-motivated)",
      "Vroom's Expectancy Theory: Motivation = Expectancy × Instrumentality × Valence",
      "McClelland's Needs: Achievement (nAch), Affiliation (nAff), Power (nPow)",
      "Adam's Equity Theory: People compare input/output ratio with others",
      "Skinner's Reinforcement Theory: Positive/negative reinforcement, punishment, extinction",
      "Ouchi's Theory Z: Japanese-style mgmt — lifetime employment, collective decision-making",
      "ERG Theory (Alderfer): Existence, Relatedness, Growth — modification of Maslow",
    ]},
    { title: "Management Theories — Leadership & Strategy", points: [
      "Autocratic — leader makes all decisions, tight control",
      "Democratic/Participative — team involvement in decisions",
      "Laissez-faire — minimal leader interference, full delegation",
      "Transformational — inspires change, vision-driven (vs Transactional — rewards/punishments)",
      "Situational Leadership (Hersey-Blanchard): style depends on follower maturity",
      "Contingency Theory (Fiedler): effectiveness depends on situation-leader match",
      "SWOT Analysis — Strengths, Weaknesses (internal), Opportunities, Threats (external)",
      "PESTEL — Political, Economic, Social, Technological, Environmental, Legal",
      "Porter's Five Forces — Industry rivalry, Buyer power, Supplier power, Threat of new entrants, Substitutes",
      "BCG Matrix — Stars (high growth, high share), Cash Cows (low growth, high share), Question Marks (high growth, low share), Dogs (low growth, low share)",
      "MBO (Drucker) — Management by Objectives, participative goal-setting",
      "14 Principles of Management — Henri Fayol (Division of work, Authority, Discipline, Unity of command, etc.)",
    ]},
    { title: "Corporate Governance & Ethics", points: [
      "Corporate Governance — system of rules, practices directing/controlling companies",
      "Board Independence — at least 1/3 independent directors (listed cos)",
      "Audit Committee — mandatory, majority independent, financial literacy",
      "CSR — Section 135, Companies Act 2013: ≥2% of avg net profit (last 3 yrs) if NW ≥500cr or TO ≥1000cr or Profit ≥5cr",
      "Insider Trading — SEBI (PIT) Regulations, prohibition on trading with UPSI",
      "Whistle-blower mechanism — mandatory for listed companies",
      "OECD Principles of Corporate Governance — global benchmark",
      "Kotak Committee (2017) — SEBI committee on corporate governance reforms",
      "ESG — Environmental, Social, Governance factors in investing",
      "BRSR — Business Responsibility and Sustainability Reporting (mandatory for top 1000 listed cos)",
    ]},
  ],
  quant: [
    { title: "Speed Math & Shortcuts", points: [
      "% shortcuts: 10% = ÷10, 5% = half of 10%, 15% = 10% + 5%",
      "Successive discounts: Two discounts a% and b% = (a+b-ab/100)%",
      "Compound Interest shortcut: For 2 years, CI-SI = P(R/100)²",
      "Rule of 72: Doubling time = 72/Rate",
      "Ratio change: If ratio a:b changes by adding x to both → new ratio closer to 1:1",
      "Average: If one number removed, new avg = (Sum - removed)/(n-1)",
      "Time-Work: If A does in x days, B in y days, together = xy/(x+y) days",
      "Boats & Streams: Downstream = u+v, Upstream = u-v, Still water speed = (D+U)/2",
      "Train crossing: Same direction → relative speed = difference; Opposite → sum",
      "Mixture alligation: (Cheaper qty)/(Dearer qty) = (Dearer price - Mean)/(Mean - Cheaper price)",
    ]},
    { title: "Data Interpretation — Key Types", points: [
      "Bar Graph — read exact values, compare across categories",
      "Line Graph — identify trends, rate of change, steepest slope",
      "Pie Chart — convert % to actual values using total, compare sectors",
      "Table — multi-variable data, calculate ratios, growth rates",
      "Caselet DI — data given in paragraph form, need to extract & organize",
      "Missing DI — some values missing, derive using relationships",
      "Common calculations: Growth % = ((New-Old)/Old)×100",
      "CAGR = (Final/Initial)^(1/n) - 1",
      "Ratio analysis, % contribution, average of columns/rows",
      "Practice tip: Round numbers for approximation to save time",
    ]},
    { title: "Number Series Patterns", points: [
      "Arithmetic: constant difference (e.g., +5, +5, +5)",
      "Geometric: constant ratio (e.g., ×2, ×2, ×2)",
      "Difference of differences: 2nd level differences are constant",
      "Squares/Cubes: 1,4,9,16,25... or 1,8,27,64...",
      "Alternating operations: +2, ×3, +2, ×3...",
      "Prime number based: 2,3,5,7,11,13...",
      "Wrong number: Find the pattern, identify which breaks it",
      "Fibonacci-type: each term = sum of previous two",
      "n² ± n patterns: 2,6,12,20,30... (n(n+1))",
      "Two-tier series: Differences themselves follow a pattern",
    ]},
    { title: "Key Formulas", points: [
      "SI = PRT/100, Amount = P + SI",
      "CI = P(1+R/100)^T - P, Amount = P(1+R/100)^T",
      "Profit% = (Profit/CP)×100, Loss% = (Loss/CP)×100",
      "SP = CP × (100+Profit%)/100 or CP × (100-Loss%)/100",
      "Discount% = (Discount/MP)×100, SP = MP × (100-D%)/100",
      "Speed = Distance/Time, 1 km/hr = 5/18 m/s",
      "Avg Speed (same distance) = 2S₁S₂/(S₁+S₂)",
      "Probability = Favorable outcomes / Total outcomes",
      "Permutation: nPr = n!/(n-r)!, Combination: nCr = n!/(r!(n-r)!)",
      "Area: Circle=πr², Triangle=½bh, Cylinder vol=πr²h, Sphere vol=4/3πr³",
    ]},
  ],
  english: [
    { title: "Grammar Rules — Error Spotting", points: [
      "Subject-Verb Agreement: Singular subject → singular verb ('The list of items IS long')",
      "'Each/Every/Either/Neither' take singular verbs",
      "'A number of' → plural verb; 'The number of' → singular verb",
      "Collective nouns (team, committee): usually singular ('The committee HAS decided')",
      "Neither...nor / Either...or — verb agrees with nearest subject",
      "Tense consistency: Don't mix past and present within same clause",
      "Preposition rules: 'Senior/Junior/Prior/Prefer' take 'TO', not 'THAN'",
      "'Discuss' takes direct object (no 'about'): 'discuss the matter' NOT 'discuss about'",
      "'Comprise' = include (no 'of'): 'The team comprises 5 members'",
      "Dangling modifiers: Modifier must refer to adjacent subject",
    ]},
    { title: "Vocabulary — High-Frequency Words", points: [
      "Ebullient (enthusiastic) ↔ Morose (gloomy)",
      "Prudent (wise, careful) ↔ Reckless (careless)",
      "Benevolent (kind) ↔ Malevolent (wishing harm)",
      "Exacerbate (worsen) ↔ Ameliorate (improve)",
      "Ephemeral (short-lived) ↔ Perpetual (everlasting)",
      "Cogent (convincing) ↔ Specious (misleadingly attractive)",
      "Pragmatic (practical) ↔ Idealistic (impractical)",
      "Acquiesce (accept reluctantly) ↔ Resist (oppose)",
      "Ubiquitous (found everywhere) ↔ Rare (scarce)",
      "Recalcitrant (stubbornly disobedient) ↔ Compliant (obedient)",
      "Equivocal (ambiguous) ↔ Unequivocal (clear, unambiguous)",
      "Abate (reduce) ↔ Intensify (increase)",
    ]},
    { title: "Idioms & Phrases", points: [
      "Burn the midnight oil — work/study late into the night",
      "A bone of contention — a subject of dispute",
      "Beat around the bush — avoid the main topic",
      "Bite the bullet — endure a painful situation bravely",
      "Break the ice — initiate conversation in awkward setting",
      "Cry wolf — raise false alarms",
      "Hit the nail on the head — describe exactly what is right",
      "In the same boat — in the same difficult situation",
      "Spill the beans — reveal a secret",
      "Turn a blind eye — ignore deliberately",
      "Under the weather — feeling ill",
      "A far cry from — very different from",
    ]},
    { title: "Reading Comprehension Strategy", points: [
      "Read the questions FIRST to know what to look for",
      "Skim the passage for main idea (first & last paragraphs)",
      "Vocabulary-in-context: pick meaning that fits the passage, not dictionary definition",
      "Inference questions: answer must be supported by passage, not your opinion",
      "Tone/Attitude: look for adjectives and adverbs — critical, optimistic, neutral, etc.",
      "Title questions: choose option that covers ENTIRE passage, not just one paragraph",
      "Author's purpose: inform, persuade, critique, describe, narrate",
      "RBI Grade B RC passages often come from: The Economist, RBI bulletins, IMF working papers",
      "Practice tip: Read financial newspapers daily (Hindu Business Line, Mint, Economic Times)",
    ]},
  ],
  reasoning: [
    { title: "Syllogism — Rules & Shortcuts", points: [
      "All A are B + All B are C → All A are C (valid)",
      "All A are B + Some B are C → Some A are C (INVALID — common mistake!)",
      "Some A are B → Some B are A (converse is valid)",
      "No A are B → No B are A (converse valid)",
      "Some A are not B → converse NOT valid",
      "All A are B → Some A are B (valid implication)",
      "Possibility cases: 'Some A are B is a possibility' — true unless explicitly denied",
      "Complementary pairs: Either conclusion I or II follows (when they're complementary)",
      "Use Venn diagrams for complex 3-4 statement syllogisms",
      "Negative conclusions: 'No' and 'Some not' require careful checking",
    ]},
    { title: "Seating Arrangement — Approach", points: [
      "Linear: Fix one person first (usually from definite clue), build from there",
      "Circular: Fix one person, determine directions (facing center/outward)",
      "Read ALL clues before starting, mark definite ones with ✓",
      "Start with most definitive clues (exact position, immediate neighbors)",
      "Use 'not' clues to eliminate possibilities",
      "Double-variable: Track 2+ attributes (person-profession-position)",
      "Rectangular: Note corner vs middle positions, facing directions",
      "Common mistake: Confusing 'left' and 'right' in circular (from person's perspective vs observer)",
      "Floor/Building arrangement: Bottom=1, track floor + attribute",
      "Practice tip: Draw neat diagrams, label clearly, work systematically",
    ]},
    { title: "Coding-Decoding Patterns", points: [
      "Letter shift: Each letter moved by fixed positions (A+2=C, B+2=D)",
      "Reverse alphabet: A=Z, B=Y, C=X (position 27-n)",
      "Position values: A=1, B=2... Z=26; operations on these numbers",
      "Word reversal + shift: reverse word then shift letters",
      "Vowel/consonant coding: different rules for vowels vs consonants",
      "Number coding: letters replaced by numbers based on position/pattern",
      "Conditional coding: different codes based on position in word",
      "Sentence coding: Deduce word-to-code mapping from multiple sentences",
      "New pattern: Mathematical operations on letter positions (×2, +3, etc.)",
    ]},
    { title: "Blood Relations & Directions", points: [
      "Father's/Mother's father = Grandfather",
      "Father's/Mother's brother = Uncle; sister = Aunt",
      "Brother's/Sister's son = Nephew; daughter = Niece",
      "Parent's sibling's child = Cousin (gender-neutral)",
      "Key: Draw family tree downward (generation-wise), mark M/F",
      "Coded blood relations: @=#=*=$ symbols for relationships",
      "Direction basics: North↑ South↓ East→ West←",
      "After turning: 'left' of North = West, 'right' of North = East",
      "Shadow at sunrise: West (behind, facing East), Shadow at sunset: East",
      "Pythagoras for diagonal distance: √(a² + b²)",
    ]},
    { title: "Inequality & Input-Output", points: [
      "Coded inequality: @=>, #=<, $=≥, %=≤, &=≠ (varies by exam)",
      "Transitive: A > B, B > C → A > C (valid)",
      "A ≥ B, B > C → A > C (valid, takes stronger sign)",
      "A > B, B ≤ C → no definite relation between A and C",
      "Either/Or: When two conclusions are complementary, either must be true",
      "Input-Output: Track step-by-step transformation pattern",
      "Common I-O patterns: Sorting (ascending/descending), alternating arrangement",
      "Look for: smallest/largest number moved, alphabetical word sorting",
      "Each step makes ONE change — identify what changes position-wise",
      "Find the rule from given steps, then apply to new input",
    ]},
  ],
};

// ═══════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════
const LS_WRONG = "rbi_wrong_answers";
const LS_USED = "rbi_used_questions";
const LS_THEME = "rbi_theme";
const LS_STATS = "rbi_test_stats";

function loadWrongAnswers() { try { return JSON.parse(localStorage.getItem(LS_WRONG) || "[]"); } catch { return []; } }
function saveWrongAnswers(data) { try { localStorage.setItem(LS_WRONG, JSON.stringify(data)); } catch {} }
function loadUsedQuestions() { try { return JSON.parse(localStorage.getItem(LS_USED) || "{}"); } catch { return {}; } }
function saveUsedQuestions(data) { try { localStorage.setItem(LS_USED, JSON.stringify(data)); } catch {} }
function loadTheme() { try { return localStorage.getItem(LS_THEME) || "dark"; } catch { return "dark"; } }
function saveTheme(t) { try { localStorage.setItem(LS_THEME, t); } catch {} }
function loadStats() { try { return JSON.parse(localStorage.getItem(LS_STATS) || "[]"); } catch { return []; } }
function saveStats(data) { try { localStorage.setItem(LS_STATS, JSON.stringify(data.slice(-50))); } catch {} }

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const SCREEN = { HOME: 0, QUIZ: 1, RESULT: 2, REVISION: 3, WRONG: 4, MOCK_HOME: 5, MOCK_QUIZ: 6, MOCK_RESULT: 7 };

// ═══════════════════════════════════════════════════════════
// RBI GRADE B PHASE 1 MOCK TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════
// Phase 1: 200 questions, 120 minutes
// Sections: GA(80), Quant(30), English(30), Reasoning(60)
// Marking: +1 correct, -0.25 wrong
const MOCK_CONFIG = {
  totalTime: 120 * 60, // 120 minutes in seconds
  marking: { correct: 1, wrong: -0.25 },
  sections: [
    { id: "ga", label: "General Awareness", count: 80, bank: "ga" },
    { id: "quant", label: "Quantitative Aptitude", count: 30, bank: "quant" },
    { id: "english", label: "English Language", count: 30, bank: "english" },
    { id: "reasoning", label: "Reasoning Ability", count: 60, bank: "reasoning" },
  ],
  totalQuestions: 200,
};

function generateMockTest(testNumber) {
  const seed = testNumber * 7919; // Different seed per test for reproducibility
  const seededRandom = (arr, n, offset) => {
    const shuffled = [...arr];
    // Fisher-Yates with deterministic seed
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.abs(((seed + offset + i) * 2654435761) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  };

  let allQuestions = [];
  let qId = 1;
  MOCK_CONFIG.sections.forEach((sec, si) => {
    const bank = FALLBACK_BANK[sec.bank] || [];
    const picked = seededRandom(bank, Math.min(sec.count, bank.length), si * 1000);
    picked.forEach(q => {
      allQuestions.push({ ...q, id: qId++, section: sec.id, sectionLabel: sec.label });
    });
  });
  return allQuestions;
}

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [subject, setSubject] = useState(null);
  const [qCount, setQCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExp, setShowExp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState(loadWrongAnswers);
  const [usedQuestions, setUsedQuestions] = useState(loadUsedQuestions);
  const [resultTab, setResultTab] = useState("summary");
  const [openNotes, setOpenNotes] = useState({});
  const [revSubject, setRevSubject] = useState("esi");
  const [wrongFilter, setWrongFilter] = useState("all");
  const [caLatestOnly, setCaLatestOnly] = useState(false);
  const timerRef = useRef(null);

  const T = THEMES[theme];
  const toggleTheme = () => { const n = theme === "dark" ? "light" : "dark"; setTheme(n); saveTheme(n); };

  // Timer
  useEffect(() => {
    if ((screen === SCREEN.QUIZ || screen === SCREEN.MOCK_QUIZ) && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            if (screen === SCREEN.MOCK_QUIZ) setScreen(SCREEN.MOCK_RESULT);
            else setScreen(SCREEN.RESULT);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen, timeLeft]);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const startQuiz = (qs) => {
    setQuestions(qs);
    setTimeLeft(qs.length * 60);
    setCurrentQ(0);
    setAnswers({});
    setShowExp(false);
    setScreen(SCREEN.QUIZ);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const subjectUsed = usedQuestions[subject] || [];
    const usedText = subjectUsed.length > 0 ? subjectUsed.slice(-30).join("\n") : "";

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: buildPrompt(subject, qCount, usedText) }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").filter(Boolean).join("") || "";
      // Try to extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const qs = parsed.slice(0, qCount).map((q,i) => ({ ...q, id: i+1 }));
          // Track used questions
          const newUsed = [...subjectUsed, ...qs.map(q => q.question)];
          const updated = { ...usedQuestions, [subject]: newUsed.slice(-60) };
          saveUsedQuestions(updated);
          startQuiz(qs);
          setLoading(false);
          return;
        }
      }
      throw new Error("Parse failed");
    } catch {
      // Fallback with shuffling and anti-repeat
      useFallback();
    }
    setLoading(false);
  };

  const useFallback = () => {
    let bank = FALLBACK_BANK[subject] || FALLBACK_BANK.esi;
    // If Current Affairs and "Latest Only" is on, filter to latest batch only
    if (subject === "ca" && caLatestOnly) {
      // Find the highest batch number in the bank
      const maxBatch = Math.max(...bank.map(q => q.batch || 1));
      bank = bank.filter(q => (q.batch || 1) === maxBatch);
    }
    const used = usedQuestions[subject] || [];
    // Prefer unused questions
    const unused = bank.filter(q => !used.includes(q.question));
    const pool = unused.length >= qCount ? unused : [...unused, ...bank.filter(q => used.includes(q.question))];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(qCount, pool.length));
    shuffled.forEach((q, i) => q.id = i + 1);
    // Track
    const newUsed = [...used, ...shuffled.map(q => q.question)];
    const updated = { ...usedQuestions, [subject]: newUsed.slice(-60) };
    setUsedQuestions(updated);
    saveUsedQuestions(updated);
    startQuiz(shuffled);
  };

  const handleAnswer = (qId, opt) => {
    if (answers[qId]) return;
    setAnswers(p => ({ ...p, [qId]: opt }));
    setShowExp(true);
  };

  const nextQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
    else { clearInterval(timerRef.current); finishTest(); }
  };

  const prevQ = () => {
    if (currentQ > 0) { setShowExp(!!answers[questions[currentQ-1]?.id]); setCurrentQ(c => c - 1); }
  };

  const finishTest = () => {
    // Save wrong answers
    const newWrong = [];
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id] !== q.correct) {
        newWrong.push({
          question: q.question, options: q.options, correct: q.correct,
          userAnswer: answers[q.id], explanation: q.explanation,
          topic: q.topic || "General", subject,
          date: new Date().toISOString().split("T")[0],
        });
      }
    });
    if (newWrong.length > 0) {
      const updated = [...wrongAnswers, ...newWrong].slice(-200); // keep last 200
      setWrongAnswers(updated);
      saveWrongAnswers(updated);
    }
    // Save test stats
    const score = getScore();
    const stats = loadStats();
    stats.push({ subject, date: new Date().toISOString(), ...score });
    saveStats(stats);
    setScreen(SCREEN.RESULT);
  };

  const finishMockTest = () => {
    // Save wrong answers from mock test
    const newWrong = [];
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id] !== q.correct) {
        newWrong.push({
          question: q.question, options: q.options, correct: q.correct,
          userAnswer: answers[q.id], explanation: q.explanation,
          topic: q.topic || "General", subject: q.section || "ga",
          date: new Date().toISOString().split("T")[0],
        });
      }
    });
    if (newWrong.length > 0) {
      const updated = [...wrongAnswers, ...newWrong].slice(-500);
      setWrongAnswers(updated);
      saveWrongAnswers(updated);
    }
    setScreen(SCREEN.MOCK_RESULT);
  };

  const getScore = () => {
    let correct=0, wrong=0, skipped=0;
    questions.forEach(q => {
      if (!answers[q.id]) skipped++;
      else if (answers[q.id]===q.correct) correct++;
      else wrong++;
    });
    const marks = correct * 1 + wrong * (-0.25);
    const maxMarks = questions.length;
    return { correct, wrong, skipped, total: questions.length, pct: Math.round((correct/questions.length)*100), marks, maxMarks, negMarks: wrong * 0.25 };
  };

  const getOptState = (q, key) => {
    if (!answers[q.id]) return "def";
    if (key===q.correct) return "correct";
    if (answers[q.id]===key && key!==q.correct) return "wrong";
    return "dis";
  };

  const subColor = SUBJECTS.find(s=>s.id===subject)?.color || T.accent;

  // ─── STYLES ───
  const s = {
    app: { minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'DM Sans',sans-serif", position:"relative" },
    container: { maxWidth:920, margin:"0 auto", padding:"20px 16px" },
    header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, paddingTop:12 },
    headerLeft: { },
    badge: { display:"inline-block", padding:"5px 14px", borderRadius:16, background:T.accentGlow, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", marginBottom:8 },
    title: { fontSize:28, fontWeight:800, color:T.text, letterSpacing:-0.5 },
    subtitle: { fontSize:13, color:T.textMuted, marginTop:2 },
    themeBtn: { background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", cursor:"pointer", fontSize:18, color:T.text },
    // Nav
    nav: { display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" },
    navBtn: (active) => ({ padding:"10px 20px", borderRadius:10, border:`1px solid ${active?T.accent:T.border}`, background:active?T.accentGlow:"transparent", color:active?T.accent:T.textMuted, fontWeight:600, cursor:"pointer", fontSize:13 }),
    // Card
    card: { background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:16, padding:24, marginBottom:16 },
    cardTitle: { fontSize:15, fontWeight:700, marginBottom:16, color:T.textSecondary, textTransform:"uppercase", letterSpacing:0.8, fontSize:12 },
    // Subject grid
    sGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 },
    sBtn: (sel,col) => ({ padding:"14px 18px", borderRadius:12, border:`1.5px solid ${sel?col:T.border}`, background:sel?`${col}12`:T.bgCard, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }),
    sLabel: { fontSize:14, fontWeight:700, color:T.text },
    sDesc: { fontSize:11, color:T.textMuted, marginTop:3 },
    // Count
    cRow: { display:"flex", gap:8, flexWrap:"wrap", marginTop:6 },
    cBtn: (sel) => ({ padding:"8px 20px", borderRadius:8, background:sel?T.accent:T.bgCard, border:`1px solid ${sel?T.accent:T.border}`, color:sel?"#FFF":T.textMuted, fontWeight:700, cursor:"pointer", fontSize:14 }),
    // Start
    startBtn: (dis) => ({ width:"100%", padding:"16px", borderRadius:12, background:dis?T.bgCard:`linear-gradient(135deg,${T.accent},${T.accent}CC)`, border:"none", color:dis?T.textMuted:"#FFF", fontSize:16, fontWeight:700, cursor:dis?"not-allowed":"pointer", marginTop:16, letterSpacing:0.5 }),
    // Quiz
    timerBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
    timer: (warn) => ({ fontSize:26, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:warn?T.wrong:T.accent }),
    progOuter: { height:5, background:T.bgCard, borderRadius:3, marginBottom:20, overflow:"hidden" },
    progInner: (pct,col) => ({ height:"100%", width:`${pct}%`, background:col||T.accent, borderRadius:3, transition:"width 0.3s" }),
    qNum: { fontSize:11, color:T.textMuted, fontWeight:700, letterSpacing:1, marginBottom:6 },
    qText: { fontSize:15, fontWeight:500, color:T.text, lineHeight:1.65, marginBottom:20, whiteSpace:"pre-wrap" },
    optBtn: (st) => {
      const base = { width:"100%", padding:"14px 18px", borderRadius:12, textAlign:"left", cursor:st==="dis"?"default":"pointer", fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:12, marginBottom:7, transition:"all 0.15s" };
      if (st==="correct") return { ...base, background:`${T.correct}15`, border:`1.5px solid ${T.correct}`, color:T.correct };
      if (st==="wrong") return { ...base, background:`${T.wrong}15`, border:`1.5px solid ${T.wrong}`, color:T.wrong };
      if (st==="sel") return { ...base, background:T.accentGlow, border:`1.5px solid ${T.accent}`, color:T.text };
      return { ...base, background:T.bgCard, border:`1.5px solid ${T.border}`, color:T.textSecondary };
    },
    optKey: (st) => ({ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0,
      background:st==="correct"?T.correct:st==="wrong"?T.wrong:T.bgCardHover, color:(st==="correct"||st==="wrong")?"#FFF":T.textMuted }),
    expBox: { marginTop:10, padding:14, borderRadius:12, background:`${T.accent}10`, border:`1px solid ${T.accent}30`, fontSize:13, color:T.textSecondary, lineHeight:1.6 },
    navRow: { display:"flex", gap:10, marginTop:20 },
    btnPri: { flex:1, padding:"13px", borderRadius:12, border:"none", background:T.accent, color:"#FFF", fontWeight:600, cursor:"pointer", fontSize:14 },
    btnSec: { flex:1, padding:"13px", borderRadius:12, border:`1px solid ${T.border}`, background:"transparent", color:T.textSecondary, fontWeight:600, cursor:"pointer", fontSize:14 },
    // Score
    scoreRing: (pct) => ({ width:150, height:150, borderRadius:"50%", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center",
      background:`conic-gradient(${pct>=70?T.correct:pct>=40?T.skip:T.wrong} ${pct*3.6}deg, ${T.bgCard} 0deg)` }),
    scoreInner: { width:122, height:122, borderRadius:"50%", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" },
    scorePct: { fontSize:34, fontWeight:800, color:T.text },
    scoreLabel: { fontSize:10, color:T.textMuted, marginTop:2 },
    statGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 },
    statBox: (c) => ({ padding:14, borderRadius:12, background:`${c}10`, border:`1px solid ${c}25`, textAlign:"center" }),
    statNum: (c) => ({ fontSize:22, fontWeight:800, color:c }),
    statLbl: { fontSize:10, color:T.textMuted, marginTop:3 },
    // Tabs
    tabRow: { display:"flex", gap:3, marginBottom:16, background:T.bgCard, borderRadius:10, padding:3 },
    tab: (a) => ({ flex:1, padding:"9px 14px", borderRadius:8, border:"none", background:a?T.accentGlow:"transparent", color:a?T.accent:T.textMuted, fontWeight:600, cursor:"pointer", fontSize:12 }),
    // Revision
    revCard: { background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:12, marginBottom:10, overflow:"hidden" },
    revHdr: (o) => ({ padding:"13px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", background:o?T.accentGlow:"transparent" }),
    revTitle: { fontSize:14, fontWeight:700, color:T.text },
    revBody: { padding:"0 18px 14px" },
    revPt: { padding:"5px 0", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:T.textSecondary, lineHeight:1.7 },
    dot: (c) => ({ width:5, height:5, borderRadius:"50%", background:c||T.accent, marginTop:8, flexShrink:0 }),
    // Wrong answers
    wrongCard: (col) => ({ ...this?.card, background:T.bgCard, border:`1px solid ${T.border}`, borderLeft:`3px solid ${col||T.wrong}`, borderRadius:12, padding:18, marginBottom:12 }),
    // Question dots
    qDot: (i, isActive, isCorrect, isWrong, isAnswered) => ({
      width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, cursor:"pointer",
      background: isActive ? subColor : isCorrect ? `${T.correct}20` : isWrong ? `${T.wrong}20` : isAnswered ? T.accentGlow : T.bgCard,
      border: isActive ? `2px solid ${subColor}` : `1px solid ${T.border}`,
      color: isActive ? "#FFF" : T.textMuted,
    }),
  };

  // ─── SCREENS ───
  
  // HOME
  if (screen === SCREEN.HOME) {
    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.badge}>Practice Dashboard</div>
              <h1 style={s.title}>RBI Grade B</h1>
              <p style={s.subtitle}>Phase 1 & 2 — Exam Practice</p>
            </div>
            <button style={s.themeBtn} onClick={toggleTheme} title="Toggle theme">{theme==="dark"?"☀️":"🌙"}</button>
          </div>

          <div style={s.nav}>
            <button style={s.navBtn(true)}>📝 Practice</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.MOCK_HOME)}>🎯 Full Mock Test</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.REVISION)}>📚 Revision Notes</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.WRONG)}>
              ❌ Wrong Answers {wrongAnswers.length > 0 && `(${wrongAnswers.length})`}
            </button>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Choose Subject</div>
            <div style={s.sGrid}>
              {SUBJECTS.map(sub=>(
                <div key={sub.id} style={s.sBtn(subject===sub.id,sub.color)} onClick={()=>setSubject(sub.id)}>
                  <div style={s.sLabel}>{sub.icon} {sub.label}</div>
                  <div style={s.sDesc}>{sub.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Number of Questions</div>
            <div style={s.cRow}>
              {QCOUNTS.map(n=>(
                <button key={n} style={s.cBtn(qCount===n)} onClick={()=>setQCount(n)}>{n}</button>
              ))}
            </div>
            <p style={{fontSize:12,color:T.textMuted,marginTop:10}}>⏱ {qCount} minutes • 1 min/question • -0.25 negative marking</p>
          </div>

          {/* Latest Only toggle — only for Current Affairs */}
          {subject === "ca" && (
            <div style={{...s.card,display:"flex",justifyContent:"space-between",alignItems:"center",padding:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>📌 Show Latest Batch Only</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>
                  {caLatestOnly
                    ? `Only latest batch (${(FALLBACK_BANK.ca||[]).filter(q=>(q.batch||1)===Math.max(...(FALLBACK_BANK.ca||[]).map(x=>x.batch||1))).length} questions)`
                    : `All current affairs (${(FALLBACK_BANK.ca||[]).length} questions)`}
                </div>
              </div>
              <div onClick={()=>setCaLatestOnly(!caLatestOnly)} style={{
                width:48,height:26,borderRadius:13,cursor:"pointer",transition:"all 0.2s",
                background:caLatestOnly?T.accent:"rgba(255,255,255,0.1)",
                border:`1px solid ${caLatestOnly?T.accent:T.border}`,
                position:"relative",display:"flex",alignItems:"center",padding:2,
              }}>
                <div style={{
                  width:20,height:20,borderRadius:10,background:"#FFF",
                  transition:"transform 0.2s",
                  transform:caLatestOnly?"translateX(22px)":"translateX(0px)",
                }}/>
              </div>
            </div>
          )}

          <button style={s.startBtn(!subject||loading)} disabled={!subject||loading} onClick={fetchQuestions}>
            {loading ? "⏳ Generating Questions..." : "🚀 Start Practice Test"}
          </button>
        </div>
      </div>
    );
  }

  // QUIZ
  if (screen === SCREEN.QUIZ && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ+1)/questions.length)*100;
    const answered = Object.keys(answers).length;

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.timerBar}>
            <span style={{fontSize:12,color:T.textMuted}}>{SUBJECTS.find(x=>x.id===subject)?.icon} {SUBJECTS.find(x=>x.id===subject)?.label}</span>
            <div style={s.timer(timeLeft<60)}>{fmt(timeLeft)}</div>
            <span style={{fontSize:12,color:T.textMuted}}>{answered}/{questions.length} done</span>
          </div>
          <div style={s.progOuter}><div style={s.progInner(progress,subColor)}/></div>

          <div style={s.card}>
            <div style={s.qNum}>QUESTION {currentQ+1} OF {questions.length} {q.topic && `• ${q.topic}`}</div>
            <div style={s.qText}>{q.question}</div>
            {["a","b","c","d","e"].map(k => {
              const st = showExp ? getOptState(q,k) : (answers[q.id]===k?"sel":"def");
              return (
                <div key={k} style={s.optBtn(st)} onClick={()=>handleAnswer(q.id,k)}>
                  <div style={s.optKey(st)}>{k}</div>
                  <div style={{flex:1}}>{q.options[k]}</div>
                </div>
              );
            })}
            {showExp && answers[q.id] && (
              <div style={s.expBox}>
                <strong style={{color:answers[q.id]===q.correct?T.correct:T.wrong}}>
                  {answers[q.id]===q.correct ? "✅ Correct!" : `❌ Wrong — Correct: ${q.correct}`}
                </strong><br/>{q.explanation}
              </div>
            )}
          </div>

          <div style={s.navRow}>
            <button style={s.btnSec} onClick={prevQ} disabled={currentQ===0}>← Prev</button>
            {answers[q.id] ? (
              <button style={s.btnPri} onClick={nextQ}>{currentQ===questions.length-1?"Finish →":"Next →"}</button>
            ) : (
              <button style={{...s.btnSec,color:T.skip}} onClick={nextQ}>Skip →</button>
            )}
          </div>

          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:14,justifyContent:"center"}}>
            {questions.map((qq,i)=>(
              <div key={i}
                onClick={()=>{setCurrentQ(i);setShowExp(!!answers[qq.id]);}}
                style={s.qDot(i,i===currentQ,answers[qq.id]===qq.correct,answers[qq.id]&&answers[qq.id]!==qq.correct,!!answers[qq.id])}
              >{i+1}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  if (screen === SCREEN.RESULT) {
    const {correct,wrong,skipped,total,pct,marks,maxMarks,negMarks} = getScore();
    const grade = pct>=80?"Excellent 🏆":pct>=60?"Good 👍":pct>=40?"Needs Work 📖":"Keep Practicing 💪";

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={{textAlign:"center",marginBottom:24,paddingTop:20}}>
            <div style={s.badge}>Test Complete</div>
            <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginTop:8}}>{grade}</h2>
          </div>

          <div style={s.scoreRing(pct)}>
            <div style={s.scoreInner}>
              <div style={s.scorePct}>{pct}%</div>
              <div style={s.scoreLabel}>SCORE</div>
            </div>
          </div>

          <div style={s.statGrid}>
            <div style={s.statBox(T.correct)}><div style={s.statNum(T.correct)}>{correct}</div><div style={s.statLbl}>Correct</div></div>
            <div style={s.statBox(T.wrong)}><div style={s.statNum(T.wrong)}>{wrong}</div><div style={s.statLbl}>Wrong</div></div>
            <div style={s.statBox(T.skip)}><div style={s.statNum(T.skip)}>{skipped}</div><div style={s.statLbl}>Skipped</div></div>
          </div>

          <div style={s.tabRow}>
            <button style={s.tab(resultTab==="summary")} onClick={()=>setResultTab("summary")}>Summary</button>
            <button style={s.tab(resultTab==="review")} onClick={()=>setResultTab("review")}>Review All</button>
          </div>

          {resultTab==="summary" && (
            <div style={s.card}>
              <div style={{fontSize:13,color:T.textSecondary,lineHeight:1.9}}>
                <p>📊 <strong>Subject:</strong> {SUBJECTS.find(x=>x.id===subject)?.label}</p>
                <p>📝 <strong>Questions:</strong> {total}</p>
                <p>⏱ <strong>Time Used:</strong> {fmt((total*60)-timeLeft)} / {fmt(total*60)}</p>
                <p>🎯 <strong>Accuracy:</strong> {total-skipped>0?Math.round((correct/(total-skipped))*100):0}% (attempted)</p>
                <p>📊 <strong>Marks:</strong> {marks.toFixed(2)} / {maxMarks} (+{correct} correct, -{negMarks.toFixed(2)} negative)</p>
                {wrong > 0 && <p style={{marginTop:8,padding:10,borderRadius:8,background:`${T.wrong}08`,border:`1px solid ${T.wrong}20`}}>
                  ❌ {wrong} wrong answer{wrong>1?"s":""} saved to your Wrong Answers section for revision.
                </p>}
              </div>
            </div>
          )}

          {resultTab==="review" && questions.map((q,i)=>{
            const ua=answers[q.id]; const ic=ua===q.correct;
            return (
              <div key={i} style={{...s.card,borderLeft:`3px solid ${!ua?T.skip:ic?T.correct:T.wrong}`}}>
                <div style={s.qNum}>Q{i+1} {!ua?"⏭ SKIPPED":ic?"✅ CORRECT":"❌ WRONG"} {q.topic&&`• ${q.topic}`}</div>
                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:10}}>{q.question}</div>
                {["a","b","c","d","e"].map(k=>(
                  <div key={k} style={{padding:"6px 10px",marginBottom:3,borderRadius:8,fontSize:13,
                    background:k===q.correct?`${T.correct}10`:ua===k?`${T.wrong}10`:"transparent",
                    color:k===q.correct?T.correct:ua===k?T.wrong:T.textMuted,
                    fontWeight:k===q.correct||ua===k?600:400}}>
                    {k}. {q.options[k]} {k===q.correct?" ✓":""}{ua===k&&k!==q.correct?" ✗":""}
                  </div>
                ))}
                <div style={s.expBox}>{q.explanation}</div>
              </div>
            );
          })}

          <div style={s.navRow}>
            <button style={s.btnSec} onClick={()=>setScreen(SCREEN.HOME)}>← New Test</button>
            <button style={s.btnPri} onClick={fetchQuestions}>🔄 Retake</button>
            <button style={s.btnSec} onClick={()=>setScreen(SCREEN.WRONG)}>❌ Wrong Answers</button>
          </div>
        </div>
      </div>
    );
  }

  // REVISION
  if (screen === SCREEN.REVISION) {
    const notes = REVISION_NOTES[revSubject] || [];
    const curSub = SUBJECTS.find(x=>x.id===revSubject);

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.header}>
            <div>
              <div style={s.badge}>Revision Mode</div>
              <h1 style={{...s.title,fontSize:24}}>Quick Revision Notes</h1>
              <p style={s.subtitle}>Tap topics to expand — key facts for rapid review</p>
            </div>
            <button style={s.themeBtn} onClick={toggleTheme}>{theme==="dark"?"☀️":"🌙"}</button>
          </div>

          <div style={s.nav}>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.HOME)}>📝 Practice</button>
            <button style={s.navBtn(true)}>📚 Revision Notes</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.WRONG)}>❌ Wrong Answers {wrongAnswers.length>0&&`(${wrongAnswers.length})`}</button>
          </div>

          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
            {SUBJECTS.map(sub=>(
              <button key={sub.id} onClick={()=>{setRevSubject(sub.id);setOpenNotes({});}}
                style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${revSubject===sub.id?sub.color:T.border}`,
                  background:revSubject===sub.id?`${sub.color}15`:T.bgCard,color:revSubject===sub.id?T.text:T.textMuted,
                  fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>

          <div style={{marginBottom:12,fontSize:13,color:T.textMuted}}>
            {notes.length} topics • {notes.reduce((a,n)=>a+n.points.length,0)} revision points
          </div>

          {notes.map((note,i)=>(
            <div key={i} style={s.revCard}>
              <div style={s.revHdr(openNotes[i])} onClick={()=>setOpenNotes(p=>({...p,[i]:!p[i]}))}>
                <span style={s.revTitle}>{note.title}</span>
                <span style={{color:T.textMuted,fontSize:16,transition:"transform 0.2s",transform:openNotes[i]?"rotate(180deg)":"none"}}>▾</span>
              </div>
              {openNotes[i] && (
                <div style={s.revBody}>
                  {note.points.map((p,j)=>(
                    <div key={j} style={s.revPt}>
                      <div style={s.dot(curSub?.color)}/>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // WRONG ANSWERS
  if (screen === SCREEN.WRONG) {
    const subjects = [...new Set(wrongAnswers.map(w=>w.subject))];
    const topics = [...new Set(wrongAnswers.filter(w=>wrongFilter==="all"||w.subject===wrongFilter).map(w=>w.topic))];
    const filtered = wrongAnswers.filter(w=>(wrongFilter==="all"||w.subject===wrongFilter));
    // Group by topic
    const grouped = {};
    filtered.forEach(w => { if (!grouped[w.topic]) grouped[w.topic]=[]; grouped[w.topic].push(w); });

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.header}>
            <div>
              <div style={s.badge}>Wrong Answers</div>
              <h1 style={{...s.title,fontSize:24}}>Revision from Mistakes</h1>
              <p style={s.subtitle}>{wrongAnswers.length} questions saved • grouped by topic</p>
            </div>
            <button style={s.themeBtn} onClick={toggleTheme}>{theme==="dark"?"☀️":"🌙"}</button>
          </div>

          <div style={s.nav}>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.HOME)}>📝 Practice</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.REVISION)}>📚 Revision Notes</button>
            <button style={s.navBtn(true)}>❌ Wrong Answers ({wrongAnswers.length})</button>
          </div>

          {/* Filter */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
            <button onClick={()=>setWrongFilter("all")}
              style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${wrongFilter==="all"?T.accent:T.border}`,
                background:wrongFilter==="all"?T.accentGlow:T.bgCard,color:wrongFilter==="all"?T.accent:T.textMuted,
                fontSize:12,fontWeight:600,cursor:"pointer"}}>All ({wrongAnswers.length})</button>
            {subjects.map(sid=>{
              const sub=SUBJECTS.find(x=>x.id===sid);
              const cnt=wrongAnswers.filter(w=>w.subject===sid).length;
              return (
                <button key={sid} onClick={()=>setWrongFilter(sid)}
                  style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${wrongFilter===sid?sub?.color||T.accent:T.border}`,
                    background:wrongFilter===sid?`${sub?.color||T.accent}15`:T.bgCard,
                    color:wrongFilter===sid?T.text:T.textMuted,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {sub?.icon} {sub?.label.split(" ")[0]} ({cnt})
                </button>
              );
            })}
          </div>

          {wrongAnswers.length === 0 ? (
            <div style={{...s.card,textAlign:"center",padding:40}}>
              <p style={{fontSize:32,marginBottom:12}}>🎉</p>
              <p style={{fontSize:14,color:T.textMuted}}>No wrong answers yet! Take a practice test to start tracking.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([topic, items]) => (
              <div key={topic} style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:8,textTransform:"uppercase",letterSpacing:0.8}}>
                  {topic} ({items.length})
                </div>
                {items.map((w,i)=>(
                  <div key={i} style={{...s.card,borderLeft:`3px solid ${T.wrong}`,padding:16,marginBottom:8}}>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:6}}>{SUBJECTS.find(x=>x.id===w.subject)?.label} • {w.date}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:10}}>{w.question}</div>
                    {["a","b","c","d","e"].map(k=>(
                      <div key={k} style={{padding:"5px 8px",marginBottom:2,borderRadius:6,fontSize:12,
                        background:k===w.correct?`${T.correct}10`:w.userAnswer===k?`${T.wrong}10`:"transparent",
                        color:k===w.correct?T.correct:w.userAnswer===k?T.wrong:T.textMuted,
                        fontWeight:k===w.correct||w.userAnswer===k?600:400}}>
                        {k}. {w.options[k]} {k===w.correct?" ✓":""}{w.userAnswer===k&&k!==w.correct?" (your answer)":""}
                      </div>
                    ))}
                    <div style={{...s.expBox,marginTop:8,fontSize:12}}>{w.explanation}</div>
                  </div>
                ))}
              </div>
            ))
          )}

          {wrongAnswers.length > 0 && (
            <button style={{...s.btnSec,marginTop:12,color:T.wrong}} onClick={()=>{
              if (confirm("Clear all wrong answers? This cannot be undone.")) { setWrongAnswers([]); saveWrongAnswers([]); }
            }}>🗑 Clear All Wrong Answers</button>
          )}
        </div>
      </div>
    );
  }

  // ─── MOCK TEST HOME ───
  if (screen === SCREEN.MOCK_HOME) {
    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.header}>
            <div>
              <div style={s.badge}>Full Mock Test</div>
              <h1 style={{...s.title,fontSize:24}}>RBI Grade B — Phase 1</h1>
              <p style={s.subtitle}>200 Questions • 120 Minutes • +1/-0.25 Marking</p>
            </div>
            <button style={s.themeBtn} onClick={toggleTheme}>{theme==="dark"?"☀️":"🌙"}</button>
          </div>
          <div style={s.nav}>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.HOME)}>📝 Practice</button>
            <button style={s.navBtn(true)}>🎯 Full Mock Test</button>
            <button style={s.navBtn(false)} onClick={()=>setScreen(SCREEN.REVISION)}>📚 Revision Notes</button>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>Phase 1 Pattern</div>
            <div style={{fontSize:13,color:T.textSecondary,lineHeight:1.8}}>
              <p>📊 General Awareness — 80 Questions (80 marks)</p>
              <p>🔢 Quantitative Aptitude — 30 Questions (30 marks)</p>
              <p>📝 English Language — 30 Questions (30 marks)</p>
              <p>🧩 Reasoning Ability — 60 Questions (60 marks)</p>
              <p style={{marginTop:8,color:T.accent}}>Total: 200 Questions • 200 Marks • 120 Minutes</p>
              <p style={{fontSize:11,color:T.textMuted,marginTop:4}}>Marking: +1 for correct, -0.25 for wrong, 0 for unattempted</p>
            </div>
          </div>
          <div style={s.cardTitle}>Select Mock Test</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {[1,2,3,4,5,6,7,8,9,10].map(n=>(
              <div key={n} style={{...s.card,cursor:"pointer",textAlign:"center",padding:20}} onClick={()=>{
                const qs = generateMockTest(n);
                setQuestions(qs);
                setTimeLeft(MOCK_CONFIG.totalTime);
                setCurrentQ(0);
                setAnswers({});
                setShowExp(false);
                setSubject("mock_"+n);
                setScreen(SCREEN.MOCK_QUIZ);
              }}>
                <div style={{fontSize:28,marginBottom:8}}>📋</div>
                <div style={{fontSize:16,fontWeight:700,color:T.text}}>Mock Test {n}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>200 Qs • 2 hrs</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── MOCK TEST QUIZ ───
  if (screen === SCREEN.MOCK_QUIZ && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ+1)/questions.length)*100;
    const answered = Object.keys(answers).length;
    const sectionCounts = {};
    MOCK_CONFIG.sections.forEach(sec => {
      const secQs = questions.filter(qq => qq.section === sec.id);
      const secAnswered = secQs.filter(qq => answers[qq.id]).length;
      sectionCounts[sec.id] = { total: secQs.length, answered: secAnswered };
    });

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={s.timerBar}>
            <span style={{fontSize:11,color:T.textMuted}}>{q.sectionLabel} • Q{currentQ+1}/{questions.length}</span>
            <div style={s.timer(timeLeft<300)}>{fmt(timeLeft)}</div>
            <span style={{fontSize:11,color:T.textMuted}}>{answered}/{questions.length} done</span>
          </div>
          <div style={s.progOuter}><div style={s.progInner(progress,T.accent)}/></div>

          {/* Section tabs */}
          <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
            {MOCK_CONFIG.sections.map(sec=>{
              const isActive = q.section === sec.id;
              const sc = sectionCounts[sec.id];
              const firstIdx = questions.findIndex(qq=>qq.section===sec.id);
              return (
                <button key={sec.id} onClick={()=>{setCurrentQ(firstIdx);setShowExp(false);}}
                  style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${isActive?T.accent:T.border}`,
                    background:isActive?T.accentGlow:"transparent",color:isActive?T.accent:T.textMuted,
                    fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {sec.label.split(" ")[0]} ({sc.answered}/{sc.total})
                </button>
              );
            })}
          </div>

          <div style={s.card}>
            <div style={s.qNum}>{q.sectionLabel} • QUESTION {currentQ+1} OF {questions.length} {q.topic&&`• ${q.topic}`}</div>
            <div style={s.qText}>{q.question}</div>
            {["a","b","c","d","e"].map(k => {
              const isSelected = answers[q.id]===k;
              return (
                <div key={k} style={s.optBtn(isSelected?"sel":"def")} onClick={()=>{
                  setAnswers(p=>({...p,[q.id]:p[q.id]===k?undefined:k})); // toggle selection
                }}>
                  <div style={s.optKey(isSelected?"sel":"def")}>{k}</div>
                  <div style={{flex:1}}>{q.options[k]}</div>
                </div>
              );
            })}
          </div>

          <div style={s.navRow}>
            <button style={s.btnSec} onClick={()=>{if(currentQ>0){setCurrentQ(c=>c-1);setShowExp(false);}}} disabled={currentQ===0}>← Prev</button>
            <button style={{...s.btnSec,color:T.skip}} onClick={()=>{
              if(answers[q.id]) setAnswers(p=>{const n={...p};delete n[q.id];return n;});
            }}>Clear</button>
            <button style={s.btnPri} onClick={()=>{
              if(currentQ<questions.length-1){setCurrentQ(c=>c+1);setShowExp(false);}
              else if(confirm("Submit the test? You still have time remaining.")){clearInterval(timerRef.current);finishMockTest();}
            }}>{currentQ===questions.length-1?"Submit →":"Next →"}</button>
          </div>

          {/* Submit button */}
          <button style={{...s.startBtn(false),marginTop:12,background:T.wrong}} onClick={()=>{
            if(confirm(`Submit test? ${answered}/${questions.length} answered. ${questions.length-answered} unattempted.`)){
              clearInterval(timerRef.current);finishMockTest();
            }
          }}>🏁 Submit Test</button>
        </div>
      </div>
    );
  }

  // ─── MOCK TEST RESULT ───
  if (screen === SCREEN.MOCK_RESULT) {
    const mk = MOCK_CONFIG.marking;
    let totalMarks=0, totalCorrect=0, totalWrong=0, totalSkipped=0;
    const sectionResults = {};

    MOCK_CONFIG.sections.forEach(sec => {
      const secQs = questions.filter(q=>q.section===sec.id);
      let correct=0, wrong=0, skipped=0, marks=0;
      secQs.forEach(q=>{
        if(!answers[q.id]) skipped++;
        else if(answers[q.id]===q.correct){correct++;marks+=mk.correct;}
        else{wrong++;marks+=mk.wrong;}
      });
      sectionResults[sec.id]={correct,wrong,skipped,total:secQs.length,marks,maxMarks:secQs.length*mk.correct};
      totalMarks+=marks;totalCorrect+=correct;totalWrong+=wrong;totalSkipped+=skipped;
    });

    const totalMax = questions.length * mk.correct;
    const pct = Math.round((totalMarks/totalMax)*100);
    const negMarks = totalWrong * Math.abs(mk.wrong);
    const grade = pct>=70?"Excellent 🏆":pct>=50?"Good 👍":pct>=35?"Average 📖":"Needs Improvement 💪";

    return (
      <div style={s.app}>
        <div style={s.container}>
          <div style={{textAlign:"center",marginBottom:20,paddingTop:16}}>
            <div style={s.badge}>Mock Test Complete</div>
            <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginTop:8}}>{grade}</h2>
          </div>

          {/* Score */}
          <div style={{...s.card,textAlign:"center",padding:24}}>
            <div style={{fontSize:48,fontWeight:800,color:totalMarks>=totalMax*0.5?T.correct:totalMarks>=totalMax*0.35?T.skip:T.wrong}}>
              {totalMarks.toFixed(2)}
            </div>
            <div style={{fontSize:13,color:T.textMuted}}>out of {totalMax} marks</div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
              <div><span style={{fontSize:18,fontWeight:700,color:T.correct}}>{totalCorrect}</span><br/><span style={{fontSize:10,color:T.textMuted}}>Correct (+{totalCorrect*mk.correct})</span></div>
              <div><span style={{fontSize:18,fontWeight:700,color:T.wrong}}>{totalWrong}</span><br/><span style={{fontSize:10,color:T.textMuted}}>Wrong (-{negMarks.toFixed(2)})</span></div>
              <div><span style={{fontSize:18,fontWeight:700,color:T.skip}}>{totalSkipped}</span><br/><span style={{fontSize:10,color:T.textMuted}}>Skipped (0)</span></div>
            </div>
            <div style={{marginTop:12,fontSize:12,color:T.textMuted}}>
              ⏱ Time Used: {fmt((MOCK_CONFIG.totalTime)-timeLeft)} / {fmt(MOCK_CONFIG.totalTime)}
              &nbsp;• Accuracy: {totalCorrect+totalWrong>0?Math.round((totalCorrect/(totalCorrect+totalWrong))*100):0}%
            </div>
          </div>

          {/* Section-wise Breakdown */}
          <div style={s.cardTitle}>Section-wise Breakdown</div>
          {MOCK_CONFIG.sections.map(sec=>{
            const r=sectionResults[sec.id];
            const secPct=r.total>0?Math.round((r.marks/r.maxMarks)*100):0;
            return (
              <div key={sec.id} style={{...s.card,padding:16,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:14,fontWeight:700,color:T.text}}>{sec.label}</span>
                  <span style={{fontSize:16,fontWeight:800,color:secPct>=50?T.correct:secPct>=35?T.skip:T.wrong}}>
                    {r.marks.toFixed(2)}/{r.maxMarks}
                  </span>
                </div>
                <div style={s.progOuter}><div style={s.progInner(Math.max(0,secPct),secPct>=50?T.correct:secPct>=35?T.skip:T.wrong)}/></div>
                <div style={{display:"flex",gap:16,marginTop:8,fontSize:11,color:T.textMuted}}>
                  <span>✅ {r.correct} correct</span>
                  <span>❌ {r.wrong} wrong (-{(r.wrong*Math.abs(mk.wrong)).toFixed(2)})</span>
                  <span>⏭ {r.skipped} skipped</span>
                  <span>🎯 {r.correct+r.wrong>0?Math.round((r.correct/(r.correct+r.wrong))*100):0}% accuracy</span>
                </div>
              </div>
            );
          })}

          {/* Review */}
          <div style={s.cardTitle}>Review Answers</div>
          {MOCK_CONFIG.sections.map(sec=>(
            <details key={sec.id} style={{marginBottom:12}}>
              <summary style={{cursor:"pointer",fontSize:14,fontWeight:600,color:T.accent,padding:"8px 0"}}>{sec.label} ({sectionResults[sec.id].correct}/{sectionResults[sec.id].total} correct)</summary>
              {questions.filter(q=>q.section===sec.id).map((q,i)=>{
                const ua=answers[q.id]; const ic=ua===q.correct;
                return (
                  <div key={i} style={{...s.card,borderLeft:`3px solid ${!ua?T.skip:ic?T.correct:T.wrong}`,padding:14,marginBottom:6}}>
                    <div style={{fontSize:10,color:T.textMuted}}>Q{q.id} {!ua?"⏭ SKIPPED":ic?"✅ +1":` ❌ -0.25`}</div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:8}}>{q.question}</div>
                    {["a","b","c","d","e"].map(k=>(
                      <div key={k} style={{padding:"4px 8px",marginBottom:2,borderRadius:6,fontSize:12,
                        background:k===q.correct?`${T.correct}10`:ua===k&&k!==q.correct?`${T.wrong}10`:"transparent",
                        color:k===q.correct?T.correct:ua===k?T.wrong:T.textMuted,
                        fontWeight:k===q.correct||ua===k?600:400}}>
                        {k}. {q.options[k]} {k===q.correct?" ✓":""}{ua===k&&k!==q.correct?" ✗":""}
                      </div>
                    ))}
                    <div style={{...s.expBox,marginTop:6,fontSize:11}}>{q.explanation}</div>
                  </div>
                );
              })}
            </details>
          ))}

          <div style={s.navRow}>
            <button style={s.btnSec} onClick={()=>setScreen(SCREEN.MOCK_HOME)}>← More Tests</button>
            <button style={s.btnPri} onClick={()=>setScreen(SCREEN.HOME)}>🏠 Home</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
