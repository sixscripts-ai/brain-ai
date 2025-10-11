// ICT Database - Real data from ict_core.csv
export const ictConcepts = [
  {
    id: 1,
    concept: "Order Block (OB)",
    definition: "Institutional price zone of last opposing candle before a directional move",
    keyCharacteristics: "Last candle before move; Zone of heavy institutional order flow",
    typicalConfirmation: "OB in line with higher‑timeframe bias",
    tradingRule: "Enter at OB after sweep",
    commonMistake: "Mistaking any support/resistance as OB",
    relatedConcepts: ["Liquidity Sweep", "Fair Value Gap"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Pullback to OB after liquidity sweep → breakout of OB's high/low",
    priceActionModel: "Foundation of the Market Structure model; used in OB‑pullback set‑ups"
  },
  {
    id: 2,
    concept: "Fair Value Gap (FVG)",
    definition: "Price imbalance/inefficiency that seeks rebalancing",
    keyCharacteristics: "Three‑candle gap; No trading in gap area",
    typicalConfirmation: "FVG aligned with OB",
    tradingRule: "Target retracement 62‑79%",
    commonMistake: "Over‑trading gaps",
    relatedConcepts: ["Order Block", "Liquidity Void"],
    category: "Imbalance",
    complexityLevel: 2,
    entryTechnique: "Enter at edge of gap after it's filled (2nd candle low for bullish, high for bearish)",
    priceActionModel: "Core of the Imbalance model; combined with OB for high‑prob entries"
  },
  {
    id: 3,
    concept: "Liquidity Pool",
    definition: "Cluster of stop‑losses or large orders institutions target",
    keyCharacteristics: "High‑volume nodes; Often near prior swing highs/lows",
    typicalConfirmation: "Liquidity pool near OB or FVG",
    tradingRule: "Place stop beyond pool",
    commonMistake: "Ignoring pool placement",
    relatedConcepts: ["Order Block", "Liquidity Sweep"],
    category: "Liquidity",
    complexityLevel: 3,
    entryTechnique: "Enter after sweep when price retests pool and shows reversal candle",
    priceActionModel: "Drives Liquidity Sweep patterns"
  },
  {
    id: 4,
    concept: "Premium/Discount (PD) Array",
    definition: "Value‑based pricing zones (0‑30% discount, 70‑100% premium)",
    keyCharacteristics: "Defines ideal entry zones",
    typicalConfirmation: "Entry within correct PD range",
    tradingRule: "Use PD for risk sizing",
    commonMistake: "Entering outside PD",
    relatedConcepts: ["Order Block", "Fair Value Gap"],
    category: "Market Structure",
    complexityLevel: 2,
    entryTechnique: "Enter within discount for longs, premium for shorts",
    priceActionModel: "Value-based entry framework"
  },
  {
    id: 5,
    concept: "Market Structure",
    definition: "Higher highs/lows, Break‑of‑Structure (BOS), Change‑of‑Character (CHoCH)",
    keyCharacteristics: "Determines bias",
    typicalConfirmation: "Break of structure confirms bias",
    tradingRule: "Align trades with new structure",
    commonMistake: "Misreading structure",
    relatedConcepts: ["AMD Model", "PO3 Model"],
    category: "Market Structure",
    complexityLevel: 4,
    entryTechnique: "Pullback after BOS → entry using OB/FVG for confluence",
    priceActionModel: "Core of all ICT analysis – the backbone"
  },
  {
    id: 6,
    concept: "Kill Zone",
    definition: "High‑probability trading windows (London, NY, Asian sessions)",
    keyCharacteristics: "Specific time windows",
    typicalConfirmation: "Trade only in kill zone",
    tradingRule: "Wait for kill zone",
    commonMistake: "Trading outside window",
    relatedConcepts: ["Macro Times"],
    category: "Time Analysis",
    complexityLevel: 2,
    entryTechnique: "Trade only inside kill zones; combine with OB/FVG confluence",
    priceActionModel: "Time‑filter applied to every set‑up"
  },
  {
    id: 7,
    concept: "Silver Bullet",
    definition: "20‑minute precision window for high‑probability trades",
    keyCharacteristics: "Specific minutes in session",
    typicalConfirmation: "Align entry with silver‑bullet window",
    tradingRule: "Tight timing",
    commonMistake: "Mis‑timed entry",
    relatedConcepts: ["Kill Zone"],
    category: "Time Analysis",
    complexityLevel: 4,
    entryTechnique: "Enter on retest after sweep within 20‑min window; stop just beyond sweep",
    priceActionModel: "Very tight timing – must be watching chart"
  },
  {
    id: 8,
    concept: "AMD Model",
    definition: "Accumulation → Manipulation → Distribution phases",
    keyCharacteristics: "Three phases",
    typicalConfirmation: "Identify phase before entry",
    tradingRule: "Trade within the identified phase",
    commonMistake: "Ignoring phase",
    relatedConcepts: ["PO3 Model", "Judas Swing"],
    category: "Trading Model",
    complexityLevel: 4,
    entryTechnique: "Enter during manipulation with OB/FVG confluence; exit in distribution",
    priceActionModel: "Provides timing context for entries/exits"
  },
  {
    id: 9,
    concept: "PO3 Model",
    definition: "Consolidation → Manipulation → Trend cycle (repeats each session)",
    keyCharacteristics: "Three phases",
    typicalConfirmation: "Look for consolidation break",
    tradingRule: "Enter on trend continuation",
    commonMistake: "Overlooking manipulation",
    relatedConcepts: ["AMD Model"],
    category: "Trading Model",
    complexityLevel: 4,
    entryTechnique: "Enter at breakout of manipulation into trend; confirm with OB/FVG",
    priceActionModel: "Core cycle framework for ICT analysis"
  },
  {
    id: 10,
    concept: "Judas Swing",
    definition: "False move in the first 30‑60 min of a session to trap retail traders",
    keyCharacteristics: "Early‑session reversal",
    typicalConfirmation: "Wait for second swing",
    tradingRule: "Avoid early trade",
    commonMistake: "Jumping in too early",
    relatedConcepts: ["PO3 Model"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Enter on reversal after false move completion",
    priceActionModel: "Session opening manipulation pattern"
  },
  {
    id: 11,
    concept: "Breaker Block",
    definition: "Failed OB that changes polarity",
    keyCharacteristics: "OB fails to hold",
    typicalConfirmation: "Watch for reversal after failure",
    tradingRule: "Exit on failure",
    commonMistake: "Treating as normal OB",
    relatedConcepts: ["Order Block"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Short after bullish BB fails; long after bearish BB fails; entry at retest of broken level",
    priceActionModel: "Breaker in the ICT Market Structure model – signals reversal"
  },
  {
    id: 12,
    concept: "Mitigation Block",
    definition: "Partially filled OB that still matters",
    keyCharacteristics: "Partial fill; Still a zone of interest",
    typicalConfirmation: "Keep as support/resistance",
    tradingRule: "Use for stop placement",
    commonMistake: "Ignoring mitigation",
    relatedConcepts: ["Order Block"],
    category: "Price Action",
    complexityLevel: 2,
    entryTechnique: "Enter on bounce off mitigation block with confirmation (bullish engulfing for long)",
    priceActionModel: "Part of the Order Block Lifecycle"
  },
  {
    id: 13,
    concept: "Propulsion Block",
    definition: "Last OB before an explosive move",
    keyCharacteristics: "Highest OB before trend acceleration",
    typicalConfirmation: "Enter on break of block",
    tradingRule: "Use for breakout entries",
    commonMistake: "Missing propulsion block",
    relatedConcepts: ["Order Block"],
    category: "Price Action",
    complexityLevel: 4,
    entryTechnique: "Enter on break of propulsion block with tight stop below (long) / above (short)",
    priceActionModel: "Launch pad in the ICT Displacement model"
  },
  {
    id: 14,
    concept: "Rejection Block",
    definition: "OB with strong initial price rejection",
    keyCharacteristics: "Sharp price rejection candle",
    typicalConfirmation: "Use as reversal signal",
    tradingRule: "Enter after rejection",
    commonMistake: "Misreading rejection",
    relatedConcepts: ["Order Block"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Enter after rejection candle closes, targeting next structure level",
    priceActionModel: "Micro‑reversal within larger ICT structure"
  },
  {
    id: 15,
    concept: "Swing Failure Pattern (SFP)",
    definition: "Brief violation of a level that fails and reverses",
    keyCharacteristics: "Small move into next zone then reverse",
    typicalConfirmation: "Look for SFP after OB/FVG",
    tradingRule: "Trade reversal",
    commonMistake: "Over‑confident SFP",
    relatedConcepts: ["Order Block", "Fair Value Gap"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Enter on reversal candle after SFP; use breached swing as stop",
    priceActionModel: "Failure pattern for quick reversals"
  },
  {
    id: 16,
    concept: "Liquidity Sweep",
    definition: "False break to trigger stops before a reversal",
    keyCharacteristics: "Sharp move then rapid reversal",
    typicalConfirmation: "Enter after sweep completion",
    tradingRule: "Use sweep as entry trigger",
    commonMistake: "Ignoring sweep",
    relatedConcepts: ["Liquidity Pool"],
    category: "Liquidity",
    complexityLevel: 3,
    entryTechnique: "Enter on reversal after sweep; stop placed beyond sweep's high/low",
    priceActionModel: "Stop‑hunt element confirming institutional liquidity"
  },
  {
    id: 17,
    concept: "Smart Money Concepts (SMC)",
    definition: "Trading with institutional flow rather than retail noise",
    keyCharacteristics: "Focus on OB, FVG, sweeps, liquidity pools",
    typicalConfirmation: "Apply all SMC concepts together",
    tradingRule: "Follow SMC methodology",
    commonMistake: "Trading retail‑centric",
    relatedConcepts: ["All concepts above"],
    category: "Methodology",
    complexityLevel: 5,
    entryTechnique: "Follow the specific entry technique tied to the confluence (pullback, breakout, sweep, etc.)",
    priceActionModel: "Integrates all ICT models into a cohesive system"
  },
  {
    id: 18,
    concept: "Institutional Order Flow",
    definition: "Reading large‑order footprints via OBs, FVGs, sweeps",
    keyCharacteristics: "Footprint data; Volume spikes",
    typicalConfirmation: "Confirm with OB/FVG alignment",
    tradingRule: "Enter on institutional signals",
    commonMistake: "Misreading flow",
    relatedConcepts: ["Smart Money Concepts"],
    category: "Order Flow",
    complexityLevel: 4,
    entryTechnique: "Enter when price respects an OB that aligns with order‑flow evidence",
    priceActionModel: "Underlying layer for all ICT models – confirmation tier"
  },
  {
    id: 19,
    concept: "Displacement",
    definition: "Strong impulsive move indicating institutional activity",
    keyCharacteristics: "Sudden large price move",
    typicalConfirmation: "Use as trend‑confirmation signal",
    tradingRule: "Enter on displacement",
    commonMistake: "Missing displacement",
    relatedConcepts: ["Order Block"],
    category: "Price Action",
    complexityLevel: 3,
    entryTechnique: "Enter on first pullback after displacement, using OB/FVG as S/R",
    priceActionModel: "Launch component of PO3/AMD cycle"
  },
  {
    id: 20,
    concept: "Liquidity Void",
    definition: "Area of no trading activity (large gaps)",
    keyCharacteristics: "Large chart gaps",
    typicalConfirmation: "Treat as potential reversal area",
    tradingRule: "Place stop beyond void",
    commonMistake: "Ignoring void",
    relatedConcepts: ["Fair Value Gap"],
    category: "Imbalance",
    complexityLevel: 2,
    entryTechnique: "Place stops beyond void; consider entering on opposite side after bounce",
    priceActionModel: "Liquidity Void in the ICT Imbalance framework"
  },
  {
    id: 21,
    concept: "Volume Imbalance",
    definition: "Disproportionate buy/sell volume creating inefficiency",
    keyCharacteristics: "Large buy or sell volume spikes",
    typicalConfirmation: "Look for imbalance with OB/FVG",
    tradingRule: "Use imbalance as entry trigger",
    commonMistake: "Ignoring imbalance",
    relatedConcepts: ["Fair Value Gap", "Order Block"],
    category: "Volume Analysis",
    complexityLevel: 3,
    entryTechnique: "Enter on reversal after imbalance is absorbed",
    priceActionModel: "Micro‑structure element for fine‑tuned entries"
  }
];

// Trading Models from database schema
export const tradingModels = [
  {
    id: 1,
    name: "AMD Model",
    category: "Institutional Flow",
    definition: "Accumulation → Manipulation → Distribution phases",
    successRate: 72,
    riskRewardRatio: 2.8,
    complexityLevel: 4
  },
  {
    id: 2,
    name: "PO3 Model", 
    category: "Session Analysis",
    definition: "Consolidation → Manipulation → Trend cycle",
    successRate: 68,
    riskRewardRatio: 2.5,
    complexityLevel: 4
  },
  {
    id: 3,
    name: "Order Block Strategy",
    category: "Price Action",
    definition: "Trading institutional order zones",
    successRate: 75,
    riskRewardRatio: 3.2,
    complexityLevel: 3
  },
  {
    id: 4,
    name: "Fair Value Gap Strategy",
    category: "Imbalance Trading",
    definition: "Trading price inefficiencies",
    successRate: 65,
    riskRewardRatio: 2.1,
    complexityLevel: 2
  },
  {
    id: 5,
    name: "Liquidity Sweep Strategy",
    category: "Liquidity Trading",
    definition: "Trading false breakouts and stop hunts",
    successRate: 78,
    riskRewardRatio: 3.5,
    complexityLevel: 4
  }
];

// Entry Techniques
export const entryTechniques = [
  {
    id: 1,
    name: "Pullback Entry",
    category: "Retracement",
    definition: "Entry on pullback to institutional zone",
    successRate: 73,
    avgRiskReward: 2.8,
    complexityLevel: 3
  },
  {
    id: 2,
    name: "Breakout Entry",
    category: "Momentum",
    definition: "Entry on break of key level",
    successRate: 69,
    avgRiskReward: 2.4,
    complexityLevel: 2
  },
  {
    id: 3,
    name: "Sweep Entry",
    category: "Liquidity",
    definition: "Entry after liquidity sweep completion",
    successRate: 76,
    avgRiskReward: 3.1,
    complexityLevel: 4
  }
];

// Time Windows (Kill Zones)
export const timeWindows = [
  {
    id: 1,
    name: "London Open",
    session: "London",
    startTime: "07:00",
    endTime: "09:00",
    timezone: "GMT",
    successRate: 78,
    probabilityRating: 5
  },
  {
    id: 2,
    name: "New York Open",
    session: "New York", 
    startTime: "13:00",
    endTime: "15:00",
    timezone: "GMT",
    successRate: 82,
    probabilityRating: 5
  },
  {
    id: 3,
    name: "Asian Session",
    session: "Asian",
    startTime: "00:00", 
    endTime: "02:00",
    timezone: "GMT",
    successRate: 65,
    probabilityRating: 3
  },
  {
    id: 4,
    name: "Silver Bullet",
    session: "Precision",
    startTime: "07:00",
    endTime: "07:20", 
    timezone: "GMT",
    successRate: 85,
    probabilityRating: 5
  }
];

// Real Database Statistics
export const databaseStats = {
  totalConcepts: ictConcepts.length,
  totalModels: tradingModels.length,
  totalTechniques: entryTechniques.length,
  totalTimeWindows: timeWindows.length,
  avgSuccessRate: Math.round(tradingModels.reduce((sum, model) => sum + model.successRate, 0) / tradingModels.length),
  avgRiskReward: (tradingModels.reduce((sum, model) => sum + model.riskRewardRatio, 0) / tradingModels.length).toFixed(1),
  conceptCategories: [...new Set(ictConcepts.map(c => c.category))].length,
  complexityLevels: [...new Set(ictConcepts.map(c => c.complexityLevel))].length
};

// Category breakdown
export const categoryBreakdown = ictConcepts.reduce((acc, concept) => {
  acc[concept.category] = (acc[concept.category] || 0) + 1;
  return acc;
}, {});

// Complexity distribution
export const complexityDistribution = ictConcepts.reduce((acc, concept) => {
  const level = `Level ${concept.complexityLevel}`;
  acc[level] = (acc[level] || 0) + 1;
  return acc;
}, {});