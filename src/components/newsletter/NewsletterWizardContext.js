
import React, { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS, loadArray } from './wizardSteps';

const WizardContext = createContext(null);

export function NewsletterWizardProvider({ children }) {
  const [econTopics, setEconTopics] = useState(() => loadArray(STORAGE_KEYS.ECON));
  const [techTopics, setTechTopics] = useState(() => loadArray(STORAGE_KEYS.TECH));
  const [companyInterests, setCompanyInterests] = useState(() => loadArray(STORAGE_KEYS.COMPANIES));
  const [finalTopics, setFinalTopics] = useState(() => loadArray(STORAGE_KEYS.FINAL_TOPICS));

  const persistInterim = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ECON, JSON.stringify(econTopics));
    localStorage.setItem(STORAGE_KEYS.TECH, JSON.stringify(techTopics));
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companyInterests));
  }, [econTopics, techTopics, companyInterests]);

  const commitFinalTopics = useCallback((topics) => {
    setFinalTopics(topics);
    localStorage.setItem(STORAGE_KEYS.FINAL_TOPICS, JSON.stringify(topics));
  }, []);

  const value = {
    econTopics, setEconTopics,
    techTopics, setTechTopics,
    companyInterests, setCompanyInterests,
    finalTopics, commitFinalTopics,
    persistInterim
  };
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within NewsletterWizardProvider');
  return ctx;
}
