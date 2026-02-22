// CrisisCompass Knowledge Base - Pre-defined Q&A pairs for common crisis questions
// This avoids using Gemini tokens for frequently asked questions

export interface CrisisQA {
  question: string;
  answer: string;
  category: 'funding' | 'countries' | 'trends' | 'analysis' | 'general';
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
