import { useState, useEffect, useCallback, useRef } from "react";

const SUBJECTS = [
  { id: "esi", label: "Economic & Social Issues", icon: "📊", color: "#0E7C6B" },
  { id: "fm", label: "Finance & Management", icon: "💰", color: "#B8860B" },
  { id: "ga", label: "General Awareness", icon: "🌍", color: "#2E5A88" },
  { id: "quant", label: "Quantitative Aptitude", icon: "🔢", color: "#8B3A62" },
  { id: "english", label: "English Language", icon: "📝", color: "#5B4A8A" },
  { id: "reasoning", label: "Reasoning", icon: "🧩", color: "#9B4D2B" },
];

const QUESTION_COUNTS = [10, 15, 20, 25, 30];

// Revision notes data
const REVISION_NOTES = {
  esi: [
    { title: "Monetary Policy", points: ["Repo Rate – rate at which RBI lends to commercial banks", "Reverse Repo – rate at which RBI borrows from banks", "CRR – Cash Reserve Ratio, % of NDTL kept with RBI", "SLR – Statutory Liquidity Ratio, % of NDTL in govt securities", "LAF – Liquidity Adjustment Facility (repo + reverse repo)", "MSF – Marginal Standing Facility, 0.25% above repo", "Bank Rate – long-term lending rate by RBI"] },
    { title: "Inflation Indices", points: ["CPI – Consumer Price Index, used for inflation targeting", "WPI – Wholesale Price Index, base year 2011-12", "GDP Deflator – broadest measure of inflation", "RBI targets CPI inflation at 4% (±2%)", "MPC – 6 members, 3 RBI + 3 external, decides repo rate"] },
    { title: "Financial Inclusion", points: ["PMJDY – Jan Dhan Yojana, zero balance accounts", "PMJJBY – Jeevan Jyoti Bima, ₹2L life cover at ₹436/yr", "PMSBY – Suraksha Bima, ₹2L accident cover at ₹20/yr", "APY – Atal Pension Yojana, ₹1K-5K pension", "MUDRA – Micro Units Development & Refinance Agency", "Shishu (<₹50K), Kishore (₹50K-5L), Tarun (₹5L-10L)"] },
    { title: "Banking Reforms", points: ["Basel III – min CAR 10.5% (RBI), 8% (global)", "CRAR = (Tier 1 + Tier 2 Capital) / RWA", "NPA – Non-Performing Asset, 90 days overdue", "IBC – Insolvency and Bankruptcy Code 2016", "NCLT – National Company Law Tribunal adjudicates IBC", "PCA – Prompt Corrective Action framework by RBI", "SARFAESI Act – secured creditor recovery without court"] },
    { title: "External Sector", points: ["BoP – Current Account + Capital Account + Errors", "CAD – Current Account Deficit = Trade + Invisibles", "FEMA 1999 replaced FERA 1973", "ECB – External Commercial Borrowings", "FDI vs FPI – FDI is 10%+ stake, FPI is <10%", "DTAA – Double Taxation Avoidance Agreement", "SDR – Special Drawing Rights (IMF basket currency)"] },
  ],
  fm: [
    { title: "RBI Structure & Functions", points: ["Established 1 April 1935, nationalized 1949", "Governor + 4 Deputy Governors", "Banker to Govt, Banker's Bank, Note Issuer", "Minimum Reserve System since 1957 (₹200cr)", "Section 24 – SLR, Section 42 – CRR", "Section 18 – Emergency lending (lender of last resort)", "RBI Act 1934 governs its functioning"] },
    { title: "Capital Markets", points: ["Primary Market – IPO, FPO, Rights Issue, OFS", "SEBI – regulator, established 1992 (Act)", "ASBA – Application Supported by Blocked Amount", "T+1 settlement cycle in Indian markets", "Circuit breakers: 10%, 15%, 20% on indices", "SME platform – BSE SME, NSE Emerge", "DVP – Delivery versus Payment"] },
    { title: "Management Concepts", points: ["SWOT – Strengths, Weaknesses, Opportunities, Threats", "PESTEL – Political, Economic, Social, Tech, Env, Legal", "Porter's 5 Forces – rivalry, buyers, suppliers, entrants, substitutes", "BCG Matrix – Star, Cash Cow, Question Mark, Dog", "Maslow's Hierarchy – Physiological→Safety→Social→Esteem→Self-actualization", "McGregor's Theory X (authoritarian) vs Y (participative)", "Herzberg – Hygiene factors vs Motivators"] },
    { title: "Government Securities", points: ["T-Bills – 91, 182, 364 days (zero coupon)", "Dated G-Secs – 5-40 year maturity", "SDL – State Development Loans", "STRIPS – Separate Trading of Registered Interest and Principal", "NDS-OM – Negotiated Dealing System - Order Matching", "Ways and Means Advances – RBI to Govt short-term", "Cash Management Bills – <91 days, ad hoc"] },
  ],
  ga: [
    { title: "Important RBI Committees", points: ["Narasimham Committee I (1991) & II (1998) – Banking reforms", "YV Reddy Committee – Fiscal responsibility", "Urjit Patel Committee – Inflation targeting framework", "PJ Nayak Committee – Governance of bank boards", "Damodaran Committee – Customer service in banks", "Nachiket Mor Committee – Financial inclusion", "SS Mundra Committee – Digital payments"] },
    { title: "International Organizations", points: ["IMF – 190 members, SDR basket (USD, EUR, CNY, JPY, GBP)", "World Bank – IBRD + IDA (together called World Bank)", "ADB – HQ Manila, 68 members", "NDB – BRICS bank, HQ Shanghai", "AIIB – HQ Beijing, 109 members", "BIS – Central bank for central banks, HQ Basel", "FSB – Financial Stability Board, G20 body"] },
    { title: "Constitutional Bodies", points: ["CAG – Comptroller & Auditor General (Art 148)", "UPSC – Union Public Service Commission (Art 315)", "Election Commission – Art 324", "Finance Commission – Art 280, every 5 years", "16th FC (2020-25) – Devolution 41% to states", "NITI Aayog replaced Planning Commission (2015)", "GST Council – Art 279A, chaired by FM"] },
  ],
  quant: [
    { title: "Key Formulas", points: ["SI = P×R×T/100", "CI = P(1+R/100)^T - P", "Profit% = (Profit/CP)×100", "Discount% = (Discount/MP)×100", "Speed = Distance/Time", "Average = Sum/Count", "Probability = Favorable/Total outcomes"] },
  ],
  english: [
    { title: "Common Error Types", points: ["Subject-Verb Agreement errors", "Tense consistency within passages", "Misplaced modifiers", "Dangling participles", "Parallelism in lists and comparisons", "Pronoun-antecedent agreement", "Articles (a/an/the) with countable/uncountable nouns"] },
  ],
  reasoning: [
    { title: "Key Patterns", points: ["Syllogism – All/Some/No + Venn diagrams", "Coding-Decoding – letter shift, number assignment", "Blood Relations – generation tree mapping", "Direction Sense – NESW grid tracking", "Seating Arrangement – linear & circular", "Inequality – coded (©=>, @=<) and direct", "Input-Output – step-by-step rearrangement"] },
  ],
};

// System prompt for generating questions
function buildSystemPrompt(subject, count) {
  const subjectLabel = SUBJECTS.find(s => s.id === subject)?.label || subject;
  return `You are an RBI Grade B exam question generator. Generate exactly ${count} multiple choice questions for the subject: ${subjectLabel}.

IMPORTANT RULES:
- Questions should match RBI Grade B Phase 1 exam difficulty
- Each question must have exactly 4 options (A, B, C, D)
- Include the correct answer and a brief explanation
- Cover diverse topics within the subject
- For General Awareness: focus on banking, RBI policies, current economic affairs, government schemes, international organizations
- For ESI: focus on Indian economy, social issues, poverty, financial inclusion, monetary policy
- For FM: focus on banking regulation, financial markets, management theories, RBI guidelines
- Questions should be factual and have ONE definitively correct answer

Respond ONLY with a JSON array, no other text, no markdown backticks. Each element:
{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"..."}`;
}

// Fallback questions if API fails
const FALLBACK_QUESTIONS = {
  esi: [
    {id:1,question:"What is the current inflation target set by the RBI under the Monetary Policy Framework?",options:{A:"2% ± 1%",B:"4% ± 2%",C:"6% ± 2%",D:"3% ± 1%"},correct:"B",explanation:"RBI targets CPI inflation at 4% with a tolerance band of ±2% (2%-6%)."},
    {id:2,question:"Which committee recommended the adoption of inflation targeting in India?",options:{A:"Narasimham Committee",B:"Urjit Patel Committee",C:"YV Reddy Committee",D:"Raghuram Rajan Committee"},correct:"B",explanation:"The Urjit Patel Committee (2014) recommended inflation targeting with CPI as the nominal anchor."},
    {id:3,question:"MUDRA loan category 'Kishore' covers loans up to what amount?",options:{A:"₹50,000",B:"₹2,00,000",C:"₹5,00,000",D:"₹10,00,000"},correct:"C",explanation:"Kishore covers loans from ₹50,001 to ₹5,00,000 under the MUDRA scheme."},
    {id:4,question:"What is the minimum Capital Adequacy Ratio (CAR) prescribed by RBI for Indian banks under Basel III?",options:{A:"8%",B:"9%",C:"10.5%",D:"12%"},correct:"C",explanation:"RBI mandates a minimum CAR of 10.5% for Indian banks, higher than the Basel III global minimum of 8%."},
    {id:5,question:"Which Act governs the resolution of insolvency in India?",options:{A:"SARFAESI Act 2002",B:"Recovery of Debts Act 1993",C:"Insolvency and Bankruptcy Code 2016",D:"Banking Regulation Act 1949"},correct:"C",explanation:"IBC 2016 provides a time-bound process for insolvency resolution of companies and individuals."},
    {id:6,question:"What does FEMA stand for?",options:{A:"Foreign Exchange Management Act",B:"Federal Economic Monetary Authority",C:"Financial Exchange Monitoring Act",D:"Foreign Economic Management Authority"},correct:"A",explanation:"FEMA (1999) replaced FERA and governs foreign exchange transactions in India."},
    {id:7,question:"Which of the following is NOT a component of the Current Account in Balance of Payments?",options:{A:"Trade in goods",B:"Trade in services",C:"Foreign Direct Investment",D:"Remittances"},correct:"C",explanation:"FDI falls under the Capital/Financial Account, not the Current Account."},
    {id:8,question:"Prompt Corrective Action (PCA) framework is triggered based on which parameters?",options:{A:"Capital, Asset Quality, Profitability",B:"Capital, Liquidity, Market Share",C:"Asset Quality, Deposits, Advances",D:"Profitability, NPA, Market Cap"},correct:"A",explanation:"PCA is triggered based on Capital (CRAR), Asset Quality (Net NPA), and Profitability (ROA)."},
    {id:9,question:"Under PMJJBY, what is the annual premium for a life insurance cover of ₹2 lakh?",options:{A:"₹330",B:"₹436",C:"₹500",D:"₹250"},correct:"B",explanation:"PMJJBY provides ₹2 lakh life cover for a premium of ₹436 per annum."},
    {id:10,question:"An asset is classified as NPA if it remains overdue for more than how many days?",options:{A:"30 days",B:"60 days",C:"90 days",D:"120 days"},correct:"C",explanation:"As per RBI guidelines, a loan account is classified as NPA if interest/principal remains overdue for more than 90 days."},
  ],
  fm: [
    {id:1,question:"When was the Reserve Bank of India established?",options:{A:"1 January 1935",B:"1 April 1935",C:"1 April 1949",D:"15 August 1947"},correct:"B",explanation:"RBI was established on 1 April 1935 under the RBI Act, 1934."},
    {id:2,question:"Which section of the RBI Act deals with CRR?",options:{A:"Section 18",B:"Section 24",C:"Section 42",D:"Section 35A"},correct:"C",explanation:"Section 42 of the RBI Act 1934 empowers RBI to prescribe CRR for scheduled commercial banks."},
    {id:3,question:"T+1 settlement cycle means trades are settled within:",options:{A:"Same day",B:"One business day",C:"Two business days",D:"Three business days"},correct:"B",explanation:"T+1 means settlement happens on the next business day after the trade date."},
    {id:4,question:"Which of the following is a zero-coupon instrument?",options:{A:"Government dated securities",B:"Treasury Bills",C:"State Development Loans",D:"Sovereign Gold Bonds"},correct:"B",explanation:"T-Bills are issued at a discount and redeemed at par, making them zero-coupon instruments."},
    {id:5,question:"Porter's Five Forces does NOT include which of the following?",options:{A:"Threat of new entrants",B:"Bargaining power of employees",C:"Bargaining power of suppliers",D:"Threat of substitutes"},correct:"B",explanation:"Porter's Five Forces: rivalry, new entrants, substitutes, buyer power, supplier power. Employee bargaining is not one of them."},
    {id:6,question:"In Maslow's hierarchy, which need comes after Safety needs?",options:{A:"Physiological",B:"Esteem",C:"Social/Belongingness",D:"Self-actualization"},correct:"C",explanation:"The order: Physiological → Safety → Social/Belongingness → Esteem → Self-actualization."},
    {id:7,question:"SEBI was established as a statutory body in which year?",options:{A:"1988",B:"1990",C:"1992",D:"1995"},correct:"C",explanation:"SEBI was given statutory powers through the SEBI Act, 1992."},
    {id:8,question:"What does ASBA stand for in the context of IPOs?",options:{A:"Automated System for Bank Applications",B:"Application Supported by Blocked Amount",C:"Asset Secured Banking Arrangement",D:"Allotment System for Bid Applications"},correct:"B",explanation:"ASBA allows the application money to remain in the investor's bank account until allotment."},
    {id:9,question:"McGregor's Theory Y assumes that employees are:",options:{A:"Lazy and need supervision",B:"Self-motivated and enjoy work",C:"Only motivated by money",D:"Resistant to change"},correct:"B",explanation:"Theory Y assumes employees are self-directed, creative, and intrinsically motivated."},
    {id:10,question:"Ways and Means Advances are provided by RBI to:",options:{A:"Commercial Banks",B:"State & Central Government",C:"NBFCs",D:"Foreign Banks"},correct:"B",explanation:"WMA is a temporary loan facility provided by RBI to the government to bridge temporary mismatches in receipts and payments."},
  ],
  ga: [
    {id:1,question:"The Narasimham Committee I (1991) was related to:",options:{A:"Taxation reform",B:"Banking sector reform",C:"Agricultural reform",D:"Industrial policy"},correct:"B",explanation:"Narasimham Committee I recommended banking reforms including reducing CRR/SLR, deregulation of interest rates, and entry of private banks."},
    {id:2,question:"Where is the headquarters of the Asian Infrastructure Investment Bank (AIIB)?",options:{A:"Manila",B:"Washington DC",C:"Beijing",D:"Shanghai"},correct:"C",explanation:"AIIB is headquartered in Beijing, China. (NDB is in Shanghai.)"},
    {id:3,question:"Article 280 of the Indian Constitution relates to:",options:{A:"Election Commission",B:"Finance Commission",C:"UPSC",D:"CAG"},correct:"B",explanation:"Article 280 provides for the constitution of a Finance Commission every five years."},
    {id:4,question:"The 16th Finance Commission recommends devolution of what percentage of central taxes to states?",options:{A:"32%",B:"38%",C:"41%",D:"50%"},correct:"C",explanation:"The 15th FC recommended 41% devolution. The 16th FC (for 2026-31) is being constituted."},
    {id:5,question:"Which body replaced the Planning Commission of India?",options:{A:"Finance Commission",B:"NITI Aayog",C:"National Development Council",D:"Economic Advisory Council"},correct:"B",explanation:"NITI Aayog (National Institution for Transforming India) replaced Planning Commission in 2015."},
    {id:6,question:"GST Council is constituted under which Article?",options:{A:"Art 246A",B:"Art 269A",C:"Art 279A",D:"Art 280"},correct:"C",explanation:"GST Council is a constitutional body under Article 279A, chaired by the Union Finance Minister."},
    {id:7,question:"Which committee recommended improvements in customer service in banks?",options:{A:"Damodaran Committee",B:"Nachiket Mor Committee",C:"PJ Nayak Committee",D:"SS Mundra Committee"},correct:"A",explanation:"The Damodaran Committee was set up to look into customer service in banks."},
    {id:8,question:"The SDR basket of IMF includes how many currencies?",options:{A:"3",B:"4",C:"5",D:"6"},correct:"C",explanation:"SDR basket: USD, EUR, CNY (added 2016), JPY, GBP – 5 currencies."},
    {id:9,question:"BIS (Bank for International Settlements) is headquartered in:",options:{A:"Geneva",B:"Basel",C:"Zurich",D:"Brussels"},correct:"B",explanation:"BIS, often called the central bank for central banks, is headquartered in Basel, Switzerland."},
    {id:10,question:"Who appoints the CAG of India?",options:{A:"Prime Minister",B:"President",C:"Chief Justice",D:"Parliament"},correct:"B",explanation:"CAG is appointed by the President of India under Article 148 of the Constitution."},
  ],
  quant: [
    {id:1,question:"A sum of ₹10,000 at 10% p.a. compound interest for 2 years gives an amount of:",options:{A:"₹12,000",B:"₹12,100",C:"₹11,000",D:"₹12,200"},correct:"B",explanation:"A = 10000(1+10/100)² = 10000 × 1.21 = ₹12,100."},
    {id:2,question:"If the CP of an article is ₹400 and SP is ₹500, the profit percentage is:",options:{A:"20%",B:"25%",C:"30%",D:"15%"},correct:"B",explanation:"Profit = 500-400 = 100. Profit% = (100/400)×100 = 25%."},
    {id:3,question:"A train 200m long crosses a pole in 10 seconds. Its speed is:",options:{A:"72 km/hr",B:"20 km/hr",C:"36 km/hr",D:"54 km/hr"},correct:"A",explanation:"Speed = 200/10 = 20 m/s = 20 × 18/5 = 72 km/hr."},
    {id:4,question:"The average of first 50 natural numbers is:",options:{A:"25",B:"25.5",C:"26",D:"24.5"},correct:"B",explanation:"Average = (n+1)/2 = 51/2 = 25.5."},
    {id:5,question:"If a:b = 2:3 and b:c = 4:5, then a:b:c is:",options:{A:"8:12:15",B:"2:3:5",C:"4:6:5",D:"8:12:10"},correct:"A",explanation:"Make b common: a:b = 8:12, b:c = 12:15. So a:b:c = 8:12:15."},
    {id:6,question:"Simple Interest on ₹5000 at 8% for 3 years:",options:{A:"₹1000",B:"₹1200",C:"₹1500",D:"₹800"},correct:"B",explanation:"SI = 5000×8×3/100 = ₹1,200."},
    {id:7,question:"Two pipes fill a tank in 12 and 15 hours. Together they fill in:",options:{A:"6 hrs",B:"6 hrs 40 min",C:"7 hrs",D:"5 hrs"},correct:"B",explanation:"Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6 hrs 40 min."},
    {id:8,question:"A shopkeeper marks goods 40% above CP and gives 20% discount. Profit%?",options:{A:"10%",B:"12%",C:"15%",D:"20%"},correct:"B",explanation:"Let CP=100, MP=140, SP=140×0.8=112. Profit=12%."},
    {id:9,question:"Probability of getting a sum of 7 when two dice are thrown:",options:{A:"1/6",B:"5/36",C:"6/36",D:"7/36"},correct:"C",explanation:"Combinations for 7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) = 6. P = 6/36 = 1/6."},
    {id:10,question:"LCM of 12, 18, 24 is:",options:{A:"36",B:"48",C:"72",D:"96"},correct:"C",explanation:"12=2²×3, 18=2×3², 24=2³×3. LCM = 2³×3² = 72."},
  ],
  english: [
    {id:1,question:"Choose the correct sentence:",options:{A:"Each of the boys have their own book",B:"Each of the boys has his own book",C:"Each of the boys have his own book",D:"Each of boys has their own book"},correct:"B",explanation:"'Each' is singular, so it takes 'has' and 'his' (singular pronoun)."},
    {id:2,question:"The synonym of 'Ebullient' is:",options:{A:"Depressed",B:"Enthusiastic",C:"Calm",D:"Indifferent"},correct:"B",explanation:"Ebullient means cheerful and full of energy — enthusiastic."},
    {id:3,question:"Choose the antonym of 'Benevolent':",options:{A:"Kind",B:"Generous",C:"Malevolent",D:"Charitable"},correct:"C",explanation:"Benevolent means well-meaning and kind; malevolent means having ill-will."},
    {id:4,question:"Identify the error: 'The committee have decided to postpone the meeting.'",options:{A:"The committee",B:"have decided",C:"to postpone",D:"the meeting"},correct:"B",explanation:"'Committee' as a body acts as singular — 'has decided' is correct."},
    {id:5,question:"'To burn the midnight oil' means:",options:{A:"To waste money",B:"To study/work late at night",C:"To cause a fire",D:"To sleep early"},correct:"B",explanation:"The idiom means to work or study late into the night."},
    {id:6,question:"Fill in: 'He is senior ___ me by three years.'",options:{A:"than",B:"to",C:"from",D:"of"},correct:"B",explanation:"Senior/junior/prior/posterior take 'to', not 'than'."},
    {id:7,question:"Which word is misspelt?",options:{A:"Occurrence",B:"Accomodation",C:"Embarrassment",D:"Maintenance"},correct:"B",explanation:"Correct spelling: Accommodation (double c, double m)."},
    {id:8,question:"One word for 'a person who speaks two languages':",options:{A:"Multilingual",B:"Bilingual",C:"Polyglot",D:"Linguist"},correct:"B",explanation:"Bilingual = two languages, polyglot = many languages."},
    {id:9,question:"Choose the correctly punctuated sentence:",options:{A:"Its a beautiful day, isnt it?",B:"It's a beautiful day, isn't it?",C:"Its a beautiful day, isn't it?",D:"It's a beautiful day, isnt it?"},correct:"B",explanation:"It's (it is) and isn't (is not) both need apostrophes."},
    {id:10,question:"The passive voice of 'She is writing a letter' is:",options:{A:"A letter is written by her",B:"A letter is being written by her",C:"A letter was being written by her",D:"A letter has been written by her"},correct:"B",explanation:"Present continuous passive: is/am/are + being + V3."},
  ],
  reasoning: [
    {id:1,question:"Statement: All dogs are cats. All cats are birds. Conclusion I: All dogs are birds. Conclusion II: All birds are dogs.",options:{A:"Only I follows",B:"Only II follows",C:"Both follow",D:"Neither follows"},correct:"A",explanation:"All dogs are cats, all cats are birds → All dogs are birds (I follows). But not all birds need be dogs (II doesn't follow)."},
    {id:2,question:"If CLOUD is coded as DMPVE, then BRAIN is coded as:",options:{A:"CSBJO",B:"CQZHM",C:"DSBJO",D:"CSBKO"},correct:"A",explanation:"Each letter shifted by +1: B→C, R→S, A→B, I→J, N→O = CSBJO."},
    {id:3,question:"Pointing to a man, a woman said 'His mother is the only daughter of my mother.' How is the woman related to the man?",options:{A:"Aunt",B:"Mother",C:"Sister",D:"Grandmother"},correct:"B",explanation:"Only daughter of my mother = myself. So 'his mother is me' — the woman is the man's mother."},
    {id:4,question:"A man walks 5km South, turns left and walks 3km, turns left again and walks 5km. Which direction is he from the start?",options:{A:"East",B:"West",C:"North",D:"South"},correct:"A",explanation:"South 5km → left (East) 3km → left (North) 5km. He's 3km East of start."},
    {id:5,question:"In a row of 40 students, M is 13th from the left and N is 18th from the right. How many students are between them?",options:{A:"9",B:"10",C:"11",D:"8"},correct:"B",explanation:"M is 13th from left, N is 18th from right (= 23rd from left). Students between = 23-13-1 = 9. Wait: 40-18+1=23. Between 13 and 23: 23-13-1 = 9."},
    {id:6,question:"If P>Q, Q>R, R>S, which is definitely true?",options:{A:"Q>S",B:"S>P",C:"R>P",D:"S>Q"},correct:"A",explanation:"P>Q>R>S, so Q>S is definitely true."},
    {id:7,question:"Find the missing number: 2, 6, 12, 20, 30, ?",options:{A:"40",B:"42",C:"44",D:"38"},correct:"B",explanation:"Differences: 4,6,8,10,12. Next = 30+12 = 42. (Pattern: n×(n+1): 1×2,2×3,3×4...)"},
    {id:8,question:"How many triangles are in a figure made of a square with both diagonals drawn?",options:{A:"4",B:"6",C:"8",D:"10"},correct:"C",explanation:"A square with both diagonals creates 4 small triangles + 4 larger triangles = 8 triangles total."},
    {id:9,question:"Which is the odd one out? Apple, Mango, Potato, Banana",options:{A:"Apple",B:"Mango",C:"Potato",D:"Banana"},correct:"C",explanation:"Potato is a vegetable/tuber; the rest are fruits."},
    {id:10,question:"STATEMENT: Some pens are pencils. All pencils are erasers. CONCLUSION I: Some pens are erasers. II: Some erasers are pens.",options:{A:"Only I follows",B:"Only II follows",C:"Both follow",D:"Neither follows"},correct:"C",explanation:"Some pens are pencils + all pencils are erasers → Some pens are erasers (I). Converse of I → Some erasers are pens (II). Both follow."},
  ],
};

// ─── STYLES ───
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0A0F1C",
    color: "#E8ECF4",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: "none", zIndex: 0,
  },
  container: {
    maxWidth: 900, margin: "0 auto", padding: "24px 16px", position: "relative", zIndex: 1,
  },
  header: {
    textAlign: "center", marginBottom: 40, paddingTop: 20,
  },
  badge: {
    display: "inline-block", padding: "6px 16px", borderRadius: 20,
    background: "rgba(14,124,107,0.15)", border: "1px solid rgba(14,124,107,0.3)",
    color: "#4FD1B5", fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", marginBottom: 12,
  },
  title: {
    fontSize: 32, fontWeight: 800, margin: "8px 0",
    background: "linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  // Cards
  card: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 24, marginBottom: 16,
    backdropFilter: "blur(10px)",
  },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#CBD5E1" },
  // Subject grid
  subjectGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12,
  },
  subjectBtn: (selected, color) => ({
    padding: "16px 20px", borderRadius: 12, border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`,
    background: selected ? `${color}15` : "rgba(255,255,255,0.02)",
    cursor: "pointer", textAlign: "left", transition: "all 0.2s",
    transform: selected ? "scale(1.02)" : "scale(1)",
  }),
  subjectLabel: { fontSize: 14, fontWeight: 600, color: "#E2E8F0" },
  subjectSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  // Count selector
  countRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
  countBtn: (sel) => ({
    padding: "8px 20px", borderRadius: 8,
    background: sel ? "#0E7C6B" : "rgba(255,255,255,0.05)",
    border: sel ? "1px solid #0E7C6B" : "1px solid rgba(255,255,255,0.08)",
    color: sel ? "#FFF" : "#94A3B8", fontWeight: 600, cursor: "pointer",
    fontSize: 14, transition: "all 0.2s",
  }),
  // Start button
  startBtn: (dis) => ({
    width: "100%", padding: "16px", borderRadius: 12,
    background: dis ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #0E7C6B 0%, #0A5C50 100%)",
    border: "none", color: dis ? "#475569" : "#FFF",
    fontSize: 16, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer",
    transition: "all 0.3s", letterSpacing: 0.5, marginTop: 16,
  }),
  // Quiz
  timerBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  timer: (warn) => ({
    fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
    color: warn ? "#EF4444" : "#4FD1B5",
    textShadow: warn ? "0 0 20px rgba(239,68,68,0.4)" : "none",
  }),
  progressOuter: {
    height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3,
    marginBottom: 24, overflow: "hidden",
  },
  progressInner: (pct, color) => ({
    height: "100%", width: `${pct}%`, background: color || "#0E7C6B",
    borderRadius: 3, transition: "width 0.3s",
  }),
  qNumber: { fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, marginBottom: 8 },
  qText: { fontSize: 18, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.5, marginBottom: 24 },
  optionBtn: (state) => {
    const base = {
      width: "100%", padding: "16px 20px", borderRadius: 12, textAlign: "left",
      cursor: state === "disabled" ? "default" : "pointer", fontSize: 15,
      fontWeight: 500, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
      marginBottom: 8,
    };
    if (state === "correct") return { ...base, background: "rgba(16,185,129,0.12)", border: "1.5px solid #10B981", color: "#A7F3D0" };
    if (state === "wrong") return { ...base, background: "rgba(239,68,68,0.12)", border: "1.5px solid #EF4444", color: "#FCA5A5" };
    if (state === "selected") return { ...base, background: "rgba(14,124,107,0.15)", border: "1.5px solid #0E7C6B", color: "#E2E8F0" };
    return { ...base, background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", color: "#CBD5E1" };
  },
  optionKey: (state) => ({
    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
    background: state === "correct" ? "#10B981" : state === "wrong" ? "#EF4444" : "rgba(255,255,255,0.06)",
    color: (state === "correct" || state === "wrong") ? "#FFF" : "#94A3B8",
  }),
  explanation: {
    marginTop: 12, padding: 16, borderRadius: 12,
    background: "rgba(14,124,107,0.08)", border: "1px solid rgba(14,124,107,0.2)",
    fontSize: 13, color: "#94A3B8", lineHeight: 1.6,
  },
  navRow: { display: "flex", gap: 12, marginTop: 24 },
  navBtn: (primary) => ({
    flex: 1, padding: "14px", borderRadius: 12, border: "none",
    background: primary ? "#0E7C6B" : "rgba(255,255,255,0.06)",
    color: primary ? "#FFF" : "#94A3B8", fontWeight: 600, cursor: "pointer",
    fontSize: 14, transition: "all 0.2s",
  }),
  // Results
  scoreCircle: (pct) => ({
    width: 160, height: 160, borderRadius: "50%", margin: "0 auto 24px",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: `conic-gradient(${pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444'} ${pct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
    position: "relative",
  }),
  scoreInner: {
    width: 130, height: 130, borderRadius: "50%", background: "#0A0F1C",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  },
  scorePct: { fontSize: 36, fontWeight: 800, color: "#FFF" },
  scoreLabel: { fontSize: 11, color: "#64748B", marginTop: 2 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 },
  statBox: (color) => ({
    padding: 16, borderRadius: 12, background: `${color}10`,
    border: `1px solid ${color}30`, textAlign: "center",
  }),
  statNum: (color) => ({ fontSize: 24, fontWeight: 800, color }),
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  // Tabs
  tabRow: { display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 },
  tab: (active) => ({
    flex: 1, padding: "10px 16px", borderRadius: 10, border: "none",
    background: active ? "rgba(14,124,107,0.2)" : "transparent",
    color: active ? "#4FD1B5" : "#64748B",
    fontWeight: 600, cursor: "pointer", fontSize: 13, transition: "all 0.2s",
  }),
  // Revision
  revCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, marginBottom: 12, overflow: "hidden",
  },
  revHeader: (open) => ({
    padding: "14px 20px", cursor: "pointer", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    background: open ? "rgba(14,124,107,0.06)" : "transparent",
    transition: "background 0.2s",
  }),
  revTitle: { fontSize: 14, fontWeight: 700, color: "#E2E8F0" },
  revBody: { padding: "0 20px 16px", fontSize: 13, color: "#94A3B8", lineHeight: 1.8 },
  revBullet: {
    padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    display: "flex", alignItems: "flex-start", gap: 8,
  },
  dot: (color) => ({
    width: 6, height: 6, borderRadius: "50%", background: color || "#0E7C6B",
    marginTop: 7, flexShrink: 0,
  }),
};

// ─── SCREENS ───
const SCREEN = { HOME: 0, QUIZ: 1, RESULT: 2, REVISION: 3 };

export default function RBIGradeBDashboard() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [subject, setSubject] = useState(null);
  const [qCount, setQCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultTab, setResultTab] = useState("summary");
  const [openNotes, setOpenNotes] = useState({});
  const [revSubject, setRevSubject] = useState("esi");
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (screen === SCREEN.QUIZ && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setScreen(SCREEN.RESULT);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen, timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: buildSystemPrompt(subject, qCount) }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((i) => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestions(parsed.slice(0, qCount));
        setTimeLeft(qCount * 60); // 1 min per question
        setCurrentQ(0);
        setAnswers({});
        setShowExplanation(false);
        setScreen(SCREEN.QUIZ);
      } else throw new Error("Invalid response");
    } catch (e) {
      // Use fallback questions
      const fallback = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS.esi;
      const shuffled = [...fallback].sort(() => Math.random() - 0.5).slice(0, Math.min(qCount, fallback.length));
      shuffled.forEach((q, i) => q.id = i + 1);
      setQuestions(shuffled);
      setTimeLeft(shuffled.length * 60);
      setCurrentQ(0);
      setAnswers({});
      setShowExplanation(false);
      setScreen(SCREEN.QUIZ);
    }
    setLoading(false);
  };

  const handleAnswer = (qId, option) => {
    if (answers[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      clearInterval(timerRef.current);
      setScreen(SCREEN.RESULT);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setShowExplanation(!!answers[questions[currentQ - 1]?.id]);
      setCurrentQ((c) => c - 1);
    }
  };

  const getScore = () => {
    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q) => {
      if (!answers[q.id]) skipped++;
      else if (answers[q.id] === q.correct) correct++;
      else wrong++;
    });
    return { correct, wrong, skipped, total: questions.length, pct: Math.round((correct / questions.length) * 100) };
  };

  const getOptionState = (q, key) => {
    if (!answers[q.id]) return "default";
    if (key === q.correct) return "correct";
    if (answers[q.id] === key && key !== q.correct) return "wrong";
    return "disabled";
  };

  const subjectColor = SUBJECTS.find((s) => s.id === subject)?.color || "#0E7C6B";

  // ─── HOME SCREEN ───
  if (screen === SCREEN.HOME) {
    return (
      <div style={styles.app}>
        <div style={styles.grain} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Practice Mode</div>
            <h1 style={styles.title}>RBI Grade B</h1>
            <p style={styles.subtitle}>Exam Practice Dashboard — 30 Day Prep</p>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button style={{ ...styles.navBtn(true), flex: "none", padding: "10px 24px" }} onClick={() => setScreen(SCREEN.HOME)}>
              📝 Practice
            </button>
            <button style={{ ...styles.navBtn(false), flex: "none", padding: "10px 24px" }} onClick={() => setScreen(SCREEN.REVISION)}>
              📚 Revision Notes
            </button>
          </div>

          {/* Subject Selection */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Choose Subject</div>
            <div style={styles.subjectGrid}>
              {SUBJECTS.map((s) => (
                <div key={s.id} style={styles.subjectBtn(subject === s.id, s.color)} onClick={() => setSubject(s.id)}>
                  <div style={styles.subjectLabel}>{s.icon} {s.label}</div>
                  <div style={styles.subjectSub}>{(FALLBACK_QUESTIONS[s.id]?.length || 10)}+ questions available</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Number of Questions</div>
            <div style={styles.countRow}>
              {QUESTION_COUNTS.map((n) => (
                <button key={n} style={styles.countBtn(qCount === n)} onClick={() => setQCount(n)}>
                  {n}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#64748B", marginTop: 12 }}>
              ⏱ Time: {qCount} minutes ({qCount} questions × 1 min each)
            </p>
          </div>

          {/* Start */}
          <button
            style={styles.startBtn(!subject || loading)}
            disabled={!subject || loading}
            onClick={fetchQuestions}
          >
            {loading ? "⏳ Generating Fresh Questions..." : "🚀 Start Practice Test"}
          </button>
          {error && <p style={{ color: "#F59E0B", fontSize: 13, marginTop: 8, textAlign: "center" }}>{error}</p>}
        </div>
      </div>
    );
  }

  // ─── QUIZ SCREEN ───
  if (screen === SCREEN.QUIZ && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const answered = Object.keys(answers).length;
    const isWarn = timeLeft < 60;

    return (
      <div style={styles.app}>
        <div style={styles.grain} />
        <div style={styles.container}>
          {/* Timer Bar */}
          <div style={styles.timerBar}>
            <div>
              <span style={{ fontSize: 12, color: "#64748B" }}>
                {SUBJECTS.find((s) => s.id === subject)?.icon} {SUBJECTS.find((s) => s.id === subject)?.label}
              </span>
            </div>
            <div style={styles.timer(isWarn)}>{formatTime(timeLeft)}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              {answered}/{questions.length} answered
            </div>
          </div>

          {/* Progress */}
          <div style={styles.progressOuter}>
            <div style={styles.progressInner(progress, subjectColor)} />
          </div>

          {/* Question Card */}
          <div style={styles.card}>
            <div style={styles.qNumber}>QUESTION {currentQ + 1} OF {questions.length}</div>
            <div style={styles.qText}>{q.question}</div>

            {/* Options */}
            {["A", "B", "C", "D"].map((key) => {
              const state = showExplanation ? getOptionState(q, key) : (answers[q.id] === key ? "selected" : "default");
              return (
                <div
                  key={key}
                  style={styles.optionBtn(state)}
                  onClick={() => handleAnswer(q.id, key)}
                >
                  <div style={styles.optionKey(state)}>{key}</div>
                  <div>{q.options[key]}</div>
                </div>
              );
            })}

            {/* Explanation */}
            {showExplanation && answers[q.id] && (
              <div style={styles.explanation}>
                <strong style={{ color: "#4FD1B5" }}>
                  {answers[q.id] === q.correct ? "✅ Correct!" : `❌ Wrong — Correct: ${q.correct}`}
                </strong>
                <br />
                {q.explanation}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={styles.navRow}>
            <button style={styles.navBtn(false)} onClick={prevQuestion} disabled={currentQ === 0}>
              ← Previous
            </button>
            {answers[q.id] ? (
              <button style={styles.navBtn(true)} onClick={nextQuestion}>
                {currentQ === questions.length - 1 ? "Finish Test →" : "Next →"}
              </button>
            ) : (
              <button style={{ ...styles.navBtn(false), color: "#F59E0B" }} onClick={nextQuestion}>
                Skip →
              </button>
            )}
          </div>

          {/* Question dots */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16, justifyContent: "center" }}>
            {questions.map((qq, i) => (
              <div
                key={i}
                onClick={() => { setCurrentQ(i); setShowExplanation(!!answers[qq.id]); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 11,
                  fontWeight: 700, cursor: "pointer",
                  background: i === currentQ ? subjectColor :
                    answers[qq.id] === qq.correct ? "rgba(16,185,129,0.2)" :
                    answers[qq.id] ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                  border: i === currentQ ? `2px solid ${subjectColor}` : "1px solid rgba(255,255,255,0.08)",
                  color: i === currentQ ? "#FFF" : "#64748B",
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (screen === SCREEN.RESULT) {
    const { correct, wrong, skipped, total, pct } = getScore();
    const grade = pct >= 80 ? "Excellent 🏆" : pct >= 60 ? "Good 👍" : pct >= 40 ? "Needs Work 📖" : "Keep Practicing 💪";

    return (
      <div style={styles.app}>
        <div style={styles.grain} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Test Complete</div>
            <h1 style={{ ...styles.title, fontSize: 26 }}>{grade}</h1>
          </div>

          {/* Score Circle */}
          <div style={styles.scoreCircle(pct)}>
            <div style={styles.scoreInner}>
              <div style={styles.scorePct}>{pct}%</div>
              <div style={styles.scoreLabel}>SCORE</div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statGrid}>
            <div style={styles.statBox("#10B981")}>
              <div style={styles.statNum("#10B981")}>{correct}</div>
              <div style={styles.statLabel}>Correct</div>
            </div>
            <div style={styles.statBox("#EF4444")}>
              <div style={styles.statNum("#EF4444")}>{wrong}</div>
              <div style={styles.statLabel}>Wrong</div>
            </div>
            <div style={styles.statBox("#F59E0B")}>
              <div style={styles.statNum("#F59E0B")}>{skipped}</div>
              <div style={styles.statLabel}>Skipped</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabRow}>
            <button style={styles.tab(resultTab === "summary")} onClick={() => setResultTab("summary")}>Summary</button>
            <button style={styles.tab(resultTab === "review")} onClick={() => setResultTab("review")}>Review All</button>
          </div>

          {resultTab === "summary" && (
            <div style={styles.card}>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8 }}>
                <p>📊 <strong>Subject:</strong> {SUBJECTS.find(s => s.id === subject)?.label}</p>
                <p>📝 <strong>Questions:</strong> {total}</p>
                <p>⏱ <strong>Time Used:</strong> {formatTime((total * 60) - timeLeft)} / {formatTime(total * 60)}</p>
                <p>🎯 <strong>Accuracy:</strong> {total - skipped > 0 ? Math.round((correct / (total - skipped)) * 100) : 0}% (attempted only)</p>
                {pct < 60 && (
                  <p style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    💡 <strong>Tip:</strong> Head to Revision Notes and review this subject's key concepts before retaking.
                  </p>
                )}
              </div>
            </div>
          )}

          {resultTab === "review" && questions.map((q, i) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${!userAns ? '#F59E0B' : isCorrect ? '#10B981' : '#EF4444'}` }}>
                <div style={styles.qNumber}>Q{i + 1} {!userAns ? "⏭ SKIPPED" : isCorrect ? "✅ CORRECT" : "❌ WRONG"}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>{q.question}</div>
                {["A", "B", "C", "D"].map(k => (
                  <div key={k} style={{
                    padding: "8px 12px", marginBottom: 4, borderRadius: 8, fontSize: 13,
                    background: k === q.correct ? "rgba(16,185,129,0.1)" : userAns === k ? "rgba(239,68,68,0.1)" : "transparent",
                    color: k === q.correct ? "#A7F3D0" : userAns === k ? "#FCA5A5" : "#64748B",
                    fontWeight: k === q.correct || userAns === k ? 600 : 400,
                  }}>
                    {k}. {q.options[k]} {k === q.correct ? " ✓" : ""} {userAns === k && k !== q.correct ? " ✗" : ""}
                  </div>
                ))}
                <div style={{ ...styles.explanation, marginTop: 8 }}>{q.explanation}</div>
              </div>
            );
          })}

          {/* Actions */}
          <div style={styles.navRow}>
            <button style={styles.navBtn(false)} onClick={() => setScreen(SCREEN.HOME)}>← New Test</button>
            <button style={styles.navBtn(true)} onClick={fetchQuestions}>🔄 Retake</button>
            <button style={styles.navBtn(false)} onClick={() => setScreen(SCREEN.REVISION)}>📚 Revise</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVISION SCREEN ───
  if (screen === SCREEN.REVISION) {
    const notes = REVISION_NOTES[revSubject] || [];
    const currentSubjectData = SUBJECTS.find(s => s.id === revSubject);

    return (
      <div style={styles.app}>
        <div style={styles.grain} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Revision Mode</div>
            <h1 style={{ ...styles.title, fontSize: 26 }}>Quick Revision Notes</h1>
            <p style={styles.subtitle}>Tap to expand • Key facts for rapid review</p>
          </div>

          {/* Back + Practice */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button style={{ ...styles.navBtn(true), flex: "none", padding: "10px 24px" }} onClick={() => setScreen(SCREEN.HOME)}>
              📝 Practice
            </button>
            <button style={{ ...styles.navBtn(false), flex: "none", padding: "10px 24px", background: "rgba(14,124,107,0.15)", color: "#4FD1B5" }}>
              📚 Revision Notes
            </button>
          </div>

          {/* Subject tabs for revision */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => { setRevSubject(s.id); setOpenNotes({}); }}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${revSubject === s.id ? s.color : 'rgba(255,255,255,0.08)'}`,
                  background: revSubject === s.id ? `${s.color}20` : "rgba(255,255,255,0.03)",
                  color: revSubject === s.id ? "#E2E8F0" : "#64748B",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {s.icon} {s.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Notes */}
          {notes.map((note, i) => (
            <div key={i} style={styles.revCard}>
              <div
                style={styles.revHeader(openNotes[i])}
                onClick={() => setOpenNotes(prev => ({ ...prev, [i]: !prev[i] }))}
              >
                <span style={styles.revTitle}>{note.title}</span>
                <span style={{ color: "#64748B", fontSize: 18, transition: "transform 0.2s", transform: openNotes[i] ? "rotate(180deg)" : "none" }}>▾</span>
              </div>
              {openNotes[i] && (
                <div style={styles.revBody}>
                  {note.points.map((p, j) => (
                    <div key={j} style={styles.revBullet}>
                      <div style={styles.dot(currentSubjectData?.color)} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {notes.length === 0 && (
            <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: 14, color: "#64748B" }}>More revision notes coming soon for this subject! 🚧</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
