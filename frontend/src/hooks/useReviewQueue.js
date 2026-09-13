import { useState } from 'react';
import { useReview } from '../contexts/ReviewProvider.jsx';

export function useReviewQueue(initialCards = []) {
  const { recordRating } = useReview();
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedHistory, setReviewedHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = cards[currentIndex] || null;

  const rateCurrentCard = async (rating) => {
    if (!currentCard) return;

    // rating: 1 (Forgot), 2 (Hard), 3 (Good), 4 (Easy)
    await recordRating({
      card_id: currentCard.card_id || `card_${currentIndex}`,
      rating,
      subject: currentCard.subject || 'Science',
      grade: currentCard.grade || 10,
      topic: currentCard.topic || 'CBSE Topic',
    });

    setReviewedHistory((prev) => [...prev, { ...currentCard, userRating: rating }]);

    if (currentIndex + 1 >= cards.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const restartQueue = () => {
    setCurrentIndex(0);
    setReviewedHistory([]);
    setIsCompleted(false);
  };

  return {
    cards,
    setCards,
    currentIndex,
    currentCard,
    totalCards: cards.length,
    reviewedHistory,
    isCompleted,
    rateCurrentCard,
    restartQueue,
  };
}
