export const WIZARD_STEPS = {
  SUBSCRIBE: 'SUBSCRIBE',
  ECON_TOPICS: 'ECON_TOPICS',
  COMPANY_INTEREST: 'COMPANY_INTEREST',
  GENERAL_TOPICS: 'GENERAL_TOPICS',
  FEED: 'FEED'
};

export const WIZARD_ORDER = [
  WIZARD_STEPS.SUBSCRIBE,
  WIZARD_STEPS.ECON_TOPICS,
  WIZARD_STEPS.COMPANY_INTEREST,
  WIZARD_STEPS.GENERAL_TOPICS
];

export const WIZARD_TOTAL = WIZARD_ORDER.length;

export const STORAGE_KEYS = {
  SUBSCRIBED: 'newsletterSubscribed',
  KAKAO: 'newsletterKakaoConsent',
  ECON: 'nlEconTopics',
  TECH: 'nlTechTopics',
  COMPANIES: 'nlCompanyInterests',
  FINAL_TOPICS: 'newsletterSelectedTopics'
};

export function loadArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
