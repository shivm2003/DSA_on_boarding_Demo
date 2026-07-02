import React from 'react';
import { STEPS } from '../constants';

const ProgressStepper = ({ currentStep }) => {
  return (
    <div className="stepper mt-4">
      {STEPS.map((step, index) => (
        <div key={index} className={`step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}>
          <div className="step-circle">{index + 1}</div>
          <span className="step-label">{step}</span>
          {index < STEPS.length - 1 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
