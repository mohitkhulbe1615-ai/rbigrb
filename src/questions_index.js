import { GA_BANK } from './questions_ga.js';
import { GK_MEGA_1 } from './gk_mega_1.js';
import { GK_MEGA_2 } from './gk_mega_2.js';
import { GK_MEGA_3 } from './gk_mega_3.js';
import { GK_CURRENT_AFFAIRS } from './gk_current_affairs.js';
import { ESI_BANK } from './questions_esi.js';
import { FM_BANK } from './questions_fm.js';
import { QUANT_BANK, REASONING_BANK } from './questions_other.js';
import { ENGLISH_BANK } from './questions_english_new.js';

// Combine all GA questions and re-index
const ALL_GA = [...GA_BANK, ...GK_MEGA_1, ...GK_MEGA_2, ...GK_MEGA_3, ...GK_CURRENT_AFFAIRS].map((q, i) => ({ ...q, id: i + 1 }));

export const FALLBACK_BANK = {
  ga: ALL_GA,
  esi: ESI_BANK,
  fm: FM_BANK,
  quant: QUANT_BANK,
  english: ENGLISH_BANK,
  reasoning: REASONING_BANK,
};
