import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BattleContainer from '../components/battle/BattleContainer.jsx';

export default function Battle({ soundEnabled = true }) {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedQuestions = location.state?.questions || [];
  const passedTopic = location.state?.topic || 'NCERT Chapter Battle';
  const initialRoomCode = code && code !== 'new' ? code : null;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#f7f9fc] to-[#eef3fb]">
      <BattleContainer
        feedQuestions={passedQuestions}
        topicTitle={passedTopic}
        initialRoomCode={initialRoomCode}
        soundEnabled={soundEnabled}
        onExit={() => navigate('/')}
      />
    </div>
  );
}
