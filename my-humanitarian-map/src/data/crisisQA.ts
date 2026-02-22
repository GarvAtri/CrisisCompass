// CrisisCompass Knowledge Base - Pre-defined Q&A pairs for common crisis questions
// This avoids using Gemini tokens for frequently asked questions

export interface CrisisQA {
  question: string;
  answer: string;
  category: 'funding' | 'countries' | 'trends' | 'analysis' | 'general' | 'map';
  keywords: string[];
}

export const crisisKnowledgeBase: CrisisQA[] = [
  // Funding Questions
  {
    question: "Which countries have the worst health funding gaps?",
    answer: "The countries with the worst health funding gaps are:\n\n1. Haiti - Only 1.8% health coverage with $4.2B funding gap\n2. South Sudan - 5.4% health coverage with $10.4B funding gap\n3. Afghanistan - 5.9% health coverage with $16.4B funding gap\n4. Nigeria - 1.3% health coverage with $32.0B funding gap\n5. DR Congo - 11.4% health coverage with $93.3B funding gap",
    category: 'funding',
    keywords: ['funding gaps', 'health funding', 'worst', 'countries']
  },
  {
    question: "Where would $1M have the most impact?",
    answer: "$1M would have the most impact in:\n\n1. Haiti - Could reach 56,000 people with health services\n2. Burkina Faso - Could reach 89,000 people with health services\n3. South Sudan - Could reach 50,000 people with health services\n4. Mali - Could reach 303,000 people with health services\n5. Central African Republic - Could reach 22,000 people with health services",
    category: 'funding',
    keywords: ['impact', 'million', '$1M', 'effective', 'where']
  },
  {
    question: "What's the total funding gap?",
    answer: "The total humanitarian funding gap across all countries is approximately $612.8 billion. The largest gaps are:\n\n- DR Congo: $93.3B\n- Nigeria: $221.6B\n- Afghanistan: $164.2B\n- South Sudan: $61.3B\n- Ethiopia: $61.3B",
    category: 'funding',
    keywords: ['total', 'funding gap', 'billion', 'overall']
  },

  // Country Analysis
  {
    question: "How does Ukraine's crisis compare to Syria?",
    answer: "Ukraine vs Syria crisis comparison:\n\nUkraine:\n- Crisis Score: 0.373 (Rank 11)\n- Health Coverage: 4.8%\n- Health Gap: $38.9M\n- Food Gap: $40.4M\n\nSyria:\n- Crisis Score: 0.647 (Rank 2)\n- Health Coverage: 1.8%\n- Health Gap: $67.9B\n- Food Gap: $41.9B\n\nSyria has a more severe crisis with much larger funding gaps.",
    category: 'countries',
    keywords: ['Ukraine', 'Syria', 'compare', 'versus', 'crisis']
  },
  {
    question: "What are the top 3 invisible crises?",
    answer: "The top 3 invisible crises (high needs, low coverage) are:\n\n1. Nigeria - 26.7M health needs, only 1.3% coverage\n2. Haiti - 23.4M health needs, only 1.8% coverage\n3. Afghanistan - 201.4M health needs, only 5.9% coverage\n\nThese countries have massive populations in need but extremely low funding coverage.",
    category: 'countries',
    keywords: ['top 3', 'invisible crises', 'worst', 'rank']
  },
  {
    question: "Which country has the highest crisis score?",
    answer: "Nigeria has the highest crisis score at 0.666 (Rank 1).\n\nTop 5 crisis scores:\n1. Nigeria: 0.666\n2. Haiti: 0.647\n3. Afghanistan: 0.635\n4. Mali: 0.539\n5. Myanmar: 0.461",
    category: 'countries',
    keywords: ['highest', 'crisis score', 'rank', 'top']
  },

  // Trends Analysis
  {
    question: "What's happening with food security in East Africa?",
    answer: "Food security trends in East Africa:\n\nWorsening:\n- Ethiopia: Food needs increased 25.8%\n- Somalia: Food needs increased 5.3%\n- South Sudan: Food needs increased 11.2%\n\nImproving:\n- Kenya: Food needs decreased 70.2%\n- Uganda: Food needs decreased 64.2%\n\nMost countries are facing increasing food insecurity.",
    category: 'trends',
    keywords: ['food security', 'East Africa', 'trends', 'Ethiopia', 'Somalia']
  },
  {
    question: "Which countries are improving vs worsening?",
    answer: "Improving countries (decreasing needs):\n- Kenya, Uganda, Burundi, Rwanda, Tanzania\n\nWorsening countries (increasing needs):\n- Ethiopia, Somalia, South Sudan, Nigeria, Haiti\n\nMost countries in crisis are experiencing worsening humanitarian conditions.",
    category: 'trends',
    keywords: ['improving', 'worsening', 'trends', 'better', 'worse']
  },

  // General Questions
  {
    question: "How many countries are in crisis?",
    answer: "There are 20 countries analyzed in the CrisisCompass database.\n\nCrisis distribution:\n- 5 countries: Severe crisis (score > 0.5)\n- 8 countries: Moderate crisis (score 0.3-0.5)\n- 7 countries: Lower crisis (score < 0.3)\n\nTotal affected population: ~1.2 billion people.",
    category: 'general',
    keywords: ['how many', 'total', 'count', 'countries', 'database']
  },

  // Map-Specific Questions
  {
    question: "What do the map colors mean?",
    answer: "Map colors indicate crisis severity:\n\n🔴 **Red** - Severe crisis (score > 0.5)\n🟡 **Yellow** - Moderate crisis (score 0.3-0.5)\n🟢 **Green** - Lower crisis (score < 0.3)\n\nDarker shades indicate higher crisis scores within each category.",
    category: 'map',
    keywords: ['map colors', 'colors', 'legend', 'what do colors mean', 'red yellow green']
  },
  {
    question: "Which countries are marked in red?",
    answer: "Red countries (severe crisis) include:\n\n1. Nigeria - Crisis Score: 0.666\n2. Haiti - Crisis Score: 0.647\n3. Afghanistan - Crisis Score: 0.635\n4. Mali - Crisis Score: 0.539\n5. Myanmar - Crisis Score: 0.461\n\nThese countries have the most critical humanitarian situations.",
    category: 'map',
    keywords: ['red countries', 'severe crisis', 'red markers', 'critical countries']
  },
  {
    question: "How do I interact with the map?",
    answer: "Map interactions:\n\n🖱️ **Click countries** - View detailed crisis information\n🔍 **Zoom** - Use mouse wheel or pinch to zoom\n🎯 **Pan** - Click and drag to move the map\n📊 **Side panel** - Selected country details appear on the right\n\nClick any country to see its specific crisis metrics and funding gaps.",
    category: 'map',
    keywords: ['interact', 'how to use', 'click', 'zoom', 'pan', 'navigate']
  },
  {
    question: "What does the bubble size represent?",
    answer: "Bubble size represents the total population in need:\n\n🔴 **Large bubbles** - Countries with millions in need\n🔵 **Small bubbles** - Countries with smaller affected populations\n\nSize helps visualize the scale of humanitarian need across different countries.",
    category: 'map',
    keywords: ['bubble size', 'size', 'population', 'scale', 'what does size mean']
  },
  {
    question: "Which region has the most crises?",
    answer: "Regional crisis distribution:\n\n🌍 **Africa** - 9 countries (45% of total)\n   Nigeria, Ethiopia, DR Congo, Somalia, South Sudan, Mali, Burkina Faso, Central African Republic, Chad\n\n🌏 **Asia** - 6 countries (30%)\n   Afghanistan, Myanmar, Yemen, Syria, Pakistan, Bangladesh\n\n🌎 **Americas** - 5 countries (25%)\n   Haiti, Colombia, Guatemala, Honduras, El Salvador\n\nAfrica has the highest concentration of humanitarian crises.",
    category: 'map',
    keywords: ['region', 'most crises', 'africa', 'asia', 'americas', 'distribution']
  },
  {
    question: "How are crisis scores calculated?",
    answer: "Crisis Score factors:\n\n📊 **Health Needs** (35%) - Population requiring health services\n💰 **Funding Gap** (35%) - Unfunded portion of requirements\n👥 **Per-Capita Funding** (30%) - Funding per person in need\n\nFormula: 0.35×Health Needs + 0.35×Funding Gap + 0.30×Per-Capita Funding\n\nHigher scores indicate more severe humanitarian situations.",
    category: 'map',
    keywords: ['crisis score', 'calculation', 'formula', 'how calculated', 'methodology']
  },
  {
    question: "What happens when I click a country?",
    answer: "When you click a country:\n\n📋 **Side panel opens** with detailed information\n📊 **Key metrics** - Crisis score, population, funding gaps\n🏥 **Health data** - Coverage rates, needs, funding\n💸 **Financial data** - Required vs funded amounts\n📈 **Trends** - Year-over-year changes\n\nThe panel provides comprehensive crisis analysis for the selected country.",
    category: 'map',
    keywords: ['click country', 'what happens', 'side panel', 'details', 'information']
  }
];

// Function to find best matching Q&A
export function findCrisisAnswer(question: string): CrisisQA | null {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Try exact match first
  let exactMatch = crisisKnowledgeBase.find(qa => 
    qa.question.toLowerCase() === lowerQuestion
  );
  if (exactMatch) return exactMatch;
  
  // Try keyword matching
  for (const qa of crisisKnowledgeBase) {
    const hasKeywordMatch = qa.keywords.some(keyword => 
      lowerQuestion.includes(keyword.toLowerCase())
    );
    if (hasKeywordMatch) return qa;
  }
  
  return null;
}

// Function to get random quick questions
export function getRandomQuickQuestions(count: number = 5): CrisisQA[] {
  const shuffled = [...crisisKnowledgeBase].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
