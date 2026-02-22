// Real humanitarian data from UN/World Bank sources
// Data includes Food Security, Health, Nutrition, Education, and other sectors

export interface CountryData {
  code: string;
  name: string;
  coordinates: [number, number];
  metrics: {
    totalRequired: number; // USD
    totalFunded: number; // USD
    fundingGap: number; // USD
    fundingPercentage: number; // 0-100
    
    // People in need by sector (2025 data)
    inNeed: {
      all?: number;
      foodSecurity?: number;
      health?: number;
      nutrition?: number;
      education?: number;
      wash?: number;
      protection?: number;
      shelter?: number;
    };
    
    // People targeted by sector (2025 data)
    targeted: {
      all?: number;
      foodSecurity?: number;
      health?: number;
      nutrition?: number;
      education?: number;
      wash?: number;
      protection?: number;
      shelter?: number;
    };
    
    // People reached by sector (2025 data)
    reached: {
      all?: number;
      foodSecurity?: number;
      health?: number;
      nutrition?: number;
      education?: number;
      wash?: number;
      protection?: number;
      shelter?: number;
    };
    
    // Special metrics
    pooledBudget?: number;
    pooledDependency?: number;
    combinedSocialNeed?: number;
    neglectIndex?: number;
    healthToFoodNeedRatio?: number;
    healthBudgetPerPerson?: number;
  };
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

// Country coordinate mapping
const countryCoordinates: Record<string, [number, number]> = {
  AFG: [33.9391, 67.7100],
  SYR: [34.8021, 38.9968],
  YEM: [15.5527, 48.5164],
  SSD: [6.8770, 31.3070],
  SDN: [12.8628, 30.2176],
  SOM: [5.1521, 46.1996],
  COD: [-4.0383, 21.7587],
  CAF: [6.6111, 20.9394],
  ETH: [9.1450, 40.4897],
  MMR: [21.9162, 95.9560],
  NGA: [9.0820, 8.6753],
  UKR: [48.3794, 31.1656],
  VEN: [6.4238, -66.5897],
  HTI: [18.9712, -72.2852],
  COL: [4.5709, -74.2973],
  BFA: [12.2383, -1.5616],
  MLI: [17.5707, -3.9962],
  NER: [13.5127, 2.1128],
  TCD: [15.4542, 18.7322],
  CMR: [3.8480, 11.5021],
  MOZ: [-18.6657, 35.5296],
  GTM: [15.7835, -90.2308],
  HND: [15.2000, -86.2419],
  SLV: [13.7942, -88.8965],
  LBN: [33.8547, 35.8623],
  PSE: [31.9522, 35.2332]
};

const countryNames: Record<string, string> = {
  AFG: 'Afghanistan',
  SYR: 'Syria',
  YEM: 'Yemen',
  SSD: 'South Sudan',
  SDN: 'Sudan',
  SOM: 'Somalia',
  COD: 'DR Congo',
  CAF: 'Central African Republic',
  ETH: 'Ethiopia',
  MMR: 'Myanmar',
  NGA: 'Nigeria',
  UKR: 'Ukraine',
  VEN: 'Venezuela',
  HTI: 'Haiti',
  COL: 'Colombia',
  BFA: 'Burkina Faso',
  MLI: 'Mali',
  NER: 'Niger',
  TCD: 'Chad',
  CMR: 'Cameroon',
  MOZ: 'Mozambique',
  GTM: 'Guatemala',
  HND: 'Honduras',
  SLV: 'El Salvador',
  LBN: 'Lebanon',
  PSE: 'Palestine'
};

// Parse the CSV data
const rawData = [
  { code: 'AFG', totalReq: 2416811546, totalFunded: 1006698560, inNeedAll: 269679137, inNeedFSC: 170406173, inNeedHEA: 147946862, inNeedNUT: 79994190, inNeedEDU: 91514443, inNeedWSH: 234743188, targetedAll: 191497180, targetedFSC: 164277979, targetedHEA: 95288881, targetedNUT: 51342858, pooledBudget: 90900000, pooledDependency: 0.09, combinedSocialNeed: 1014235925, neglectIndex: 1.01, healthToFoodRatio: 0.87, healthBudgetPerPerson: 6.80 },
  { code: 'BFA', totalReq: 792565236, totalFunded: 272684836, inNeedAll: 43180493, inNeedFSC: 20445339, inNeedHEA: 14231351, inNeedNUT: 8847346, inNeedEDU: 14348805, inNeedWSH: 19853562, targetedAll: 26809300, targetedFSC: 15677091, targetedHEA: 9395127, targetedNUT: 4448235, pooledBudget: 0, pooledDependency: 0.31, combinedSocialNeed: 84064388, neglectIndex: 0.70, healthToFoodRatio: 0.70, healthBudgetPerPerson: 19.16 },
  { code: 'CMR', totalReq: 359298328, totalFunded: 84320211, inNeedAll: 31953434, inNeedFSC: 24838320, inNeedHEA: 15114710, inNeedNUT: 5628390, inNeedEDU: 14965500, inNeedWSH: 21551140, targetedAll: 19987742, targetedFSC: 10527510, targetedHEA: 10902630, targetedNUT: 3554410, pooledBudget: 0, pooledDependency: 0.91, combinedSocialNeed: 76751407, neglectIndex: 0.61, healthToFoodRatio: 0.61, healthBudgetPerPerson: 5.58 },
  { code: 'CAF', totalReq: 326056578, totalFunded: 125577046, inNeedAll: 12201700, inNeedFSC: 9138029, inNeedHEA: 7648830, inNeedNUT: 3873681, inNeedEDU: 4219145, inNeedWSH: 8213296, targetedAll: 8863164, targetedFSC: 5926994, targetedHEA: 3331479, targetedNUT: 2626042, pooledBudget: 18100000, pooledDependency: 0.14, combinedSocialNeed: 19316401, neglectIndex: 0.15, healthToFoodRatio: 0.84, healthBudgetPerPerson: 16.42 },
  { code: 'TCD', totalReq: 1454258243, totalFunded: 436509852, inNeedAll: 28196903, inNeedFSC: 17828930, inNeedHEA: 14243010, inNeedNUT: 11145184, inNeedEDU: 6552542, inNeedWSH: 14452252, targetedAll: 21902285, targetedFSC: 12091010, targetedHEA: 4519228, targetedNUT: 9563756, pooledBudget: 0, pooledDependency: 0.03, combinedSocialNeed: 13589293, neglectIndex: 0.80, healthToFoodRatio: 0.80, healthBudgetPerPerson: 30.65 },
  { code: 'COL', totalReq: 467231247, totalFunded: 45942202, inNeedAll: 44425812, inNeedFSC: 24541695, inNeedHEA: 18041222, inNeedEDU: 9010233, inNeedWSH: 11926891, targetedAll: 12781338, targetedFSC: 2631663, targetedHEA: 1902514, pooledBudget: 0, pooledDependency: 1.50, combinedSocialNeed: 68821444, neglectIndex: 0.74, healthToFoodRatio: 0.74, healthBudgetPerPerson: 2.55 },
  { code: 'COD', totalReq: 2538016151, totalFunded: 669859519, inNeedAll: 148692621, inNeedFSC: 123277746, inNeedHEA: 90549744, inNeedNUT: 45305211, inNeedEDU: 13081826, inNeedWSH: 43516525, targetedAll: 68442038, targetedFSC: 51245593, targetedHEA: 42005691, targetedNUT: 20489532, pooledBudget: 43351831, pooledDependency: 0.06, combinedSocialNeed: 154070015, neglectIndex: 0.23, healthToFoodRatio: 0.73, healthBudgetPerPerson: 7.40 },
  { code: 'SLV', totalReq: 66923449, totalFunded: 18644495, inNeedAll: 4143280, inNeedFSC: 3702090, inNeedHEA: 1019245, inNeedNUT: 624881, inNeedEDU: 939273, inNeedWSH: 2972402, targetedAll: 2062032, targetedFSC: 425898, targetedHEA: 430797, targetedNUT: 187500, pooledBudget: 0, pooledDependency: 0.24, combinedSocialNeed: 4400139, neglectIndex: 0.28, healthToFoodRatio: 0.28, healthBudgetPerPerson: 18.29 },
  { code: 'ETH', totalReq: 19002155, totalFunded: 2767588, inNeedAll: 0, inNeedFSC: 0, inNeedHEA: 0, inNeedNUT: 0, pooledBudget: 44500000, pooledDependency: 16.08, combinedSocialNeed: 223966508, neglectIndex: 80.92, healthToFoodRatio: 0, healthBudgetPerPerson: 0 },
  { code: 'GTM', totalReq: 100563396, totalFunded: 24992697, inNeedAll: 10819765, inNeedFSC: 6367921, inNeedHEA: 2693654, inNeedNUT: 4739087, inNeedEDU: 1387497, inNeedWSH: 2142344, targetedAll: 5904672, targetedFSC: 883383, targetedHEA: 697071, targetedNUT: 1464822, pooledBudget: 0, pooledDependency: 0.82, combinedSocialNeed: 20572874, neglectIndex: 0.42, healthToFoodRatio: 0.42, healthBudgetPerPerson: 9.28 },
  { code: 'HTI', totalReq: 908159989, totalFunded: 236379498, inNeedAll: 42985706, inNeedFSC: 40408200, inNeedHEA: 29502365, inNeedNUT: 5852460, inNeedEDU: 10615196, inNeedWSH: 26975689, targetedAll: 28673844, targetedFSC: 25083960, targetedHEA: 13957761, targetedNUT: 4529570, pooledBudget: 4500000, pooledDependency: 0.02, combinedSocialNeed: 29924825, neglectIndex: 0.13, healthToFoodRatio: 0.73, healthBudgetPerPerson: 8.01 },
  { code: 'HND', totalReq: 138491372, totalFunded: 15576631, inNeedAll: 8310899, inNeedFSC: 4983514, inNeedHEA: 3427488, inNeedNUT: 1857852, inNeedEDU: 2052116, inNeedWSH: 4743707, targetedAll: 4065765, targetedFSC: 1677881, targetedHEA: 1415537, targetedNUT: 880523, pooledBudget: 0, pooledDependency: 0.55, combinedSocialNeed: 8534572, neglectIndex: 0.69, healthToFoodRatio: 0.69, healthBudgetPerPerson: 4.54 },
  { code: 'LBN', totalReq: 371357000, totalFunded: 288678888, pooledBudget: 35150000, pooledDependency: 0.12, combinedSocialNeed: 0, neglectIndex: 0 },
  { code: 'MLI', totalReq: 771314315, totalFunded: 189699954, inNeedAll: 32157658, inNeedFSC: 8725967, inNeedHEA: 18714846, inNeedNUT: 14191493, inNeedEDU: 9050813, inNeedWSH: 16280139, targetedAll: 23545059, targetedFSC: 6980775, targetedHEA: 12276841, targetedNUT: 11353189, pooledBudget: 0, pooledDependency: 0.23, combinedSocialNeed: 44242358, neglectIndex: 2.14, healthToFoodRatio: 2.14, healthBudgetPerPerson: 10.14 },
  { code: 'MOZ', totalReq: 133082917, totalFunded: 9769335, inNeedAll: 3915087, inNeedFSC: 4166617, inNeedHEA: 2893398, inNeedNUT: 1073936, inNeedEDU: 1378328, inNeedWSH: 5359521, targetedAll: 3291288, targetedFSC: 3828429, targetedHEA: 1805252, targetedNUT: 1283936, pooledBudget: 0, pooledDependency: 4.40, combinedSocialNeed: 43009797, neglectIndex: 0.69, healthToFoodRatio: 0.69, healthBudgetPerPerson: 3.38 },
  { code: 'MMR', totalReq: 1137811569, totalFunded: 200050333, inNeedAll: 219710870, inNeedFSC: 166960415, inNeedHEA: 141581174, inNeedNUT: 34574438, inNeedEDU: 54977847, inNeedWSH: 78346275, targetedAll: 61669882, targetedFSC: 20916327, targetedHEA: 26980728, targetedNUT: 7649891, pooledBudget: 36000000, pooledDependency: 0.18, combinedSocialNeed: 519992377, neglectIndex: 2.60, healthToFoodRatio: 0.85, healthBudgetPerPerson: 1.41 },
  { code: 'NER', totalReq: 603027582, totalFunded: 156816763, inNeedAll: 7740986, inNeedFSC: 3833637, inNeedHEA: 3357930, inNeedNUT: 2161052, inNeedEDU: 6259200, inNeedWSH: 5455916, targetedAll: 6396333, targetedFSC: 3833637, targetedHEA: 2965473, targetedNUT: 1387963, pooledBudget: 0, pooledDependency: 0.17, combinedSocialNeed: 26511051, neglectIndex: 0.88, healthToFoodRatio: 0.88, healthBudgetPerPerson: 46.70 },
  { code: 'NGA', totalReq: 910246471, totalFunded: 284691216, inNeedAll: 39235240, inNeedFSC: 25765740, inNeedHEA: 24654465, inNeedNUT: 19127655, inNeedEDU: 8244020, inNeedWSH: 26006702, targetedAll: 17920535, targetedFSC: 14022367, targetedHEA: 15793597, targetedNUT: 11393539, pooledBudget: 19600000, pooledDependency: 0.07, combinedSocialNeed: 61773703, neglectIndex: 0.22, healthToFoodRatio: 0.96, healthBudgetPerPerson: 11.55 },
  { code: 'PSE', totalReq: 4073058682, totalFunded: 2529405746, pooledBudget: 105310000, pooledDependency: 0.04, combinedSocialNeed: 0, neglectIndex: 0 },
  { code: 'SOM', totalReq: 8554300, totalFunded: 1367292, inNeedAll: 17939223, inNeedFSC: 13568073, inNeedHEA: 16200128, inNeedNUT: 10053139, inNeedEDU: 7773614, inNeedWSH: 15728349, targetedAll: 13714978, targetedFSC: 7574630, targetedHEA: 11356207, targetedNUT: 7049186, pooledBudget: 58650000, pooledDependency: 42.90, combinedSocialNeed: 38669986, neglectIndex: 28.28, healthToFoodRatio: 1.19, healthBudgetPerPerson: 0.08 },
  { code: 'SSD', totalReq: 1694778653, totalFunded: 713321164, inNeedAll: 46450440, inNeedFSC: 38808575, inNeedHEA: 25031179, inNeedNUT: 21672941, inNeedEDU: 8161533, inNeedWSH: 25050687, targetedAll: 26934914, targetedFSC: 17782620, targetedHEA: 15448694, targetedNUT: 14218026, pooledBudget: 0, pooledDependency: 0.15, combinedSocialNeed: 105131903, neglectIndex: 0.64, healthToFoodRatio: 0.64, healthBudgetPerPerson: 28.50 },
  { code: 'SDN', totalReq: 4162518656, totalFunded: 1630357837, inNeedAll: 283099158, inNeedFSC: 233249393, inNeedHEA: 188820270, inNeedNUT: 33519375, inNeedEDU: 75302967, inNeedWSH: 235739196, targetedAll: 194693358, targetedFSC: 148955769, targetedHEA: 87419953, targetedNUT: 20936101, pooledBudget: 171630000, pooledDependency: 0.11, combinedSocialNeed: 343204898, neglectIndex: 0.21, healthToFoodRatio: 0.81, healthBudgetPerPerson: 8.63 },
  { code: 'SYR', totalReq: 3186585280, totalFunded: 1166879149, pooledBudget: 41500000, pooledDependency: 0.04, combinedSocialNeed: 116073712, neglectIndex: 0.10 },
  { code: 'UKR', totalReq: 2633534010, totalFunded: 1532252401, inNeedAll: 88962071, inNeedFSC: 34930199, inNeedHEA: 64459197, inNeedEDU: 11473945, inNeedWSH: 59642437, targetedAll: 42114583, targetedFSC: 15763509, targetedHEA: 20960640, pooledBudget: 193600000, pooledDependency: 0.13, combinedSocialNeed: 249902528, neglectIndex: 0.16, healthToFoodRatio: 1.85, healthBudgetPerPerson: 23.77 },
  { code: 'VEN', totalReq: 606497714, totalFunded: 118231672, inNeedAll: 23831160, inNeedFSC: 13154508, inNeedHEA: 21265403, inNeedNUT: 3516867, inNeedEDU: 8272407, inNeedWSH: 11276271, targetedAll: 15376992, targetedFSC: 6011100, targetedHEA: 10516869, targetedNUT: 2756109, pooledBudget: 0, pooledDependency: 0.47, combinedSocialNeed: 55145376, neglectIndex: 1.62, healthToFoodRatio: 1.62, healthBudgetPerPerson: 5.56 },
  { code: 'YEM', totalReq: 2478772922, totalFunded: 705928116, inNeedAll: 97701050, inNeedFSC: 85452857, inNeedHEA: 98635709, inNeedNUT: 43075535, inNeedEDU: 34139141, inNeedWSH: 76099283, targetedAll: 52635150, targetedFSC: 59999991, targetedHEA: 52902005, targetedNUT: 38829100, pooledBudget: 0, pooledDependency: 0.06, combinedSocialNeed: 316756272, neglectIndex: 0.45, healthToFoodRatio: 1.15, healthBudgetPerPerson: 7.16 }
];

export const countriesData: CountryData[] = rawData
  .filter(d => countryCoordinates[d.code])
  .map(d => {
    const fundingGap = d.totalReq - d.totalFunded;
    const fundingPercentage = d.totalReq > 0 ? (d.totalFunded / d.totalReq) * 100 : 0;
    
    // Determine risk level based on funding percentage and neglect index
    let riskLevel: 'critical' | 'high' | 'medium' | 'low';
    if (fundingPercentage < 30 || (d.neglectIndex && d.neglectIndex > 5)) {
      riskLevel = 'critical';
    } else if (fundingPercentage < 50 || (d.neglectIndex && d.neglectIndex > 1)) {
      riskLevel = 'high';
    } else if (fundingPercentage < 70) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }
    
    return {
      code: d.code,
      name: countryNames[d.code] || d.code,
      coordinates: countryCoordinates[d.code],
      metrics: {
        totalRequired: d.totalReq,
        totalFunded: d.totalFunded,
        fundingGap: fundingGap,
        fundingPercentage: fundingPercentage,
        inNeed: {
          all: d.inNeedAll,
          foodSecurity: d.inNeedFSC,
          health: d.inNeedHEA,
          nutrition: d.inNeedNUT,
          education: d.inNeedEDU,
          wash: d.inNeedWSH
        },
        targeted: {
          all: d.targetedAll,
          foodSecurity: d.targetedFSC,
          health: d.targetedHEA,
          nutrition: d.targetedNUT
        },
        reached: {
          all: 0,
          foodSecurity: 0,
          health: 0,
          nutrition: 0
        },
        pooledBudget: d.pooledBudget,
        pooledDependency: d.pooledDependency,
        combinedSocialNeed: d.combinedSocialNeed,
        neglectIndex: d.neglectIndex,
        healthToFoodNeedRatio: d.healthToFoodRatio,
        healthBudgetPerPerson: d.healthBudgetPerPerson
      },
      riskLevel
    };
  });

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'critical':
      return '#DC2626'; // red-600
    case 'high':
      return '#F97316'; // orange-500
    case 'medium':
      return '#EAB308'; // yellow-500
    case 'low':
      return '#22C55E'; // green-500
    default:
      return '#94A3B8'; // slate-400
  }
};

export const getCountryByCode = (code: string): CountryData | undefined => {
  return countriesData.find(country => country.code === code);
};

export const formatCurrency = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export const formatNumber = (value: number): string => {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
};
