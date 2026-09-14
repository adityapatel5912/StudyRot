import { useState } from 'react';

export function useCheckWork() {
  const [imageB64, setImageB64] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [report, setReport] = useState(null);
  const [loadingStage, setLoadingStage] = useState('idle'); // 'idle' | 'ocr' | 'parsing' | 'reasoning' | 'done'
  const [error, setError] = useState(null);

  const checkSolution = async (b64Data = null, question = '') => {
    const targetImage = b64Data || imageB64;
    setLoadingStage('ocr');
    setError(null);
    setReport(null);

    // Retrieve user's BYOK keys if stored
    const userGroqKey = localStorage.getItem('studyrot_groq_api_key') || null;
    const userNvidiaKey = localStorage.getItem('studyrot_nvidia_api_key') || null;

    try {
      setTimeout(() => setLoadingStage('parsing'), 800);
      setTimeout(() => setLoadingStage('reasoning'), 1800);

      const formData = new FormData();
      if (targetImage) formData.append('image_b64', targetImage);
      if (question || questionText) formData.append('question', question || questionText);
      if (userGroqKey) formData.append('groq_key', userGroqKey);
      if (userNvidiaKey) formData.append('nvidia_key', userNvidiaKey);

      const res = await fetch('/api/check-work', {
        method: 'POST',
        headers: {
          ...(userGroqKey ? { 'X-Groq-Key': userGroqKey } : {}),
          ...(userNvidiaKey ? { 'X-Nvidia-Key': userNvidiaKey } : {}),
        },
        body: formData,
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setReport(json.data);
        setLoadingStage('done');
      } else {
        setError(json.error || 'Failed to analyze solution photo');
        setLoadingStage('idle');
      }
    } catch (err) {
      setError(err.message || 'Error processing photo');
      setLoadingStage('idle');
    }
  };

  const loadSample = () => {
    setImageB64(null);
    setQuestionText('Concave mirror numerical (f = -15 cm, u = -30 cm)');
    checkSolution(null, 'Concave mirror numerical');
  };

  return {
    imageB64,
    setImageB64,
    questionText,
    setQuestionText,
    report,
    loadingStage,
    error,
    checkSolution,
    loadSample,
  };
}
