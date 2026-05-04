import { GA_BANK } from './questions_ga.js';
import { GK_MEGA_1 } from './gk_mega_1.js';
import { GK_MEGA_2 } from './gk_mega_2.js';
import { GK_MEGA_3 } from './gk_mega_3.js';
import { GK_CURRENT_AFFAIRS } from './gk_current_affairs.js';
import { CA_BANK_2 } from './ca_bank_2.js';
import { ESI_BANK } from './questions_esi.js';
import { FM_BANK } from './questions_fm.js';
import { QUANT_BANK, REASONING_BANK } from './questions_other.js';
import { ENGLISH_BANK } from './questions_english_new.js';

// GA = static GK only (1000 questions)
const ALL_GA = [...GA_BANK, ...GK_MEGA_1, ...GK_MEGA_2, ...GK_MEGA_3].map((q, i) => ({ ...q, id: i + 1 }));

// CA = current affairs separate (200 + 500 = 700 questions)
const ALL_CA = [...GK_CURRENT_AFFAIRS, ...CA_BANK_2].map((q, i) => ({ ...q, id: i + 1 }));

export const FALLBACK_BANK = {
  ga: ALL_GA,
  ca: ALL_CA,
  esi: ESI_BANK,
  fm: FM_BANK,
  quant: QUANT_BANK,
  english: ENGLISH_BANK,
  reasoning: REASONING_BANK,
};
