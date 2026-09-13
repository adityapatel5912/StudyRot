import { useState, useEffect } from 'react';

const TOUR_KEY = 'studyrot:tourSeen';

export function useTour() {
  const [tourSeen, setTourSeen] = useState(() => {
    try {
      return localStorage.getItem(TOUR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = () => {
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const endTour = () => {
    setIsTourActive(false);
    try {
      localStorage.setItem(TOUR_KEY, 'true');
      setTourSeen(true);
    } catch {}
  };

  const resetTourStatus = () => {
    try {
      localStorage.removeItem(TOUR_KEY);
      setTourSeen(false);
    } catch {}
  };

  return {
    tourSeen,
    isTourActive,
    currentStep,
    startTour,
    nextStep,
    endTour,
    resetTourStatus,
  };
}
