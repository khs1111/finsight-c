import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Onboarding from './Onboarding'; // legacy
import Subscribe from './Subscribe';
import TopicSelection from './TopicSelection';
import Feed from './Feed';
import Detail from './Detail';
import StepEconomyTopics from './StepEconomyTopics';
import StepTechTopics from './StepTechTopics';
import StepTechTopicsRedesign from './StepTechTopicsRedesign';
import StepCompanyInterest from './StepCompanyInterest';
import PostSubscribe from './PostSubscribe';
import { NewsletterWizardProvider } from './NewsletterWizardContext';
import { STORAGE_KEYS } from './wizardSteps';

export default function NewsletterRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  // 루트 접근 시 무조건 HOT 피드로 진입
  useEffect(() => {
    if (location.pathname === '/newsletter') {
      navigate('/newsletter/feed', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <NewsletterWizardProvider>
        <Routes>
          <Route index element={<Feed />} />
          <Route path="subscribe" element={<Subscribe />} />
          <Route path="econ" element={<StepEconomyTopics />} />
          <Route path="tech" element={<StepTechTopicsRedesign />} />
          <Route path="companies" element={<StepCompanyInterest />} />
          <Route path="subscriber" element={<PostSubscribe />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="topics" element={<TopicSelection />} />
          <Route path="feed" element={<Feed />} />
          <Route path=":id" element={<Detail />} />
        </Routes>
      </NewsletterWizardProvider>
    </div>
  );
}
