import React from 'react';
import { WIZARD_ORDER } from './wizardSteps';

export default function ProgressBar({ currentStep }) {
  const index = WIZARD_ORDER.indexOf(currentStep); // 0-based
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 24px', marginBottom: 28, marginTop: 8 }}>
      {WIZARD_ORDER.map((s, i) => (
        <div key={s} style={{ flex: 1, height: 6, borderRadius: 4, background: i <= index ? 'linear-gradient(90deg,#377BFF,#5AA2FF)' : '#E2E8F0', transition: 'background .3s' }} />
      ))}
    </div>
  );
}
