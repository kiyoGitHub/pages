import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components'; // Added keyframes
import { FaVolumeUp, FaStopCircle, FaSpinner } from 'react-icons/fa';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import * as ttsService from '../../services/ttsService';
import * as storageService from '../../services/storageService'; // storageService is correctly imported

// ... (styled components remain the same)
const TurnWrapper = styled.div`
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 8px;
  position: relative;

  ${({ theme, speaker }) => {
    const isSpeaker1 = speaker === 'Speaker 1';
    return css`
      background-color: ${isSpeaker1 ? theme.primary + '1A' : theme.card.background};
      border-left: 4px solid ${isSpeaker1 ? theme.primary : theme.secondary};
      box-shadow: 0 1px 2px ${({theme}) => theme.card.shadow}30;
    `;
  }}

  p { margin: 0 0 5px 0; line-height: 1.65; }
`;
const EnglishText = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin-right: 40px;
  font-size: 1.05rem;
`;
const JapaneseText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
  font-family: 'Noto Sans JP', sans-serif;
`;
const PlayButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, isActive }) => isActive ? theme.primary : theme.secondary}CC;
  cursor: pointer;
  font-size: 1.2rem;
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover { color: ${({ theme }) => theme.primary}; }
  &:disabled {
    color: ${({ theme }) => theme.button.disabledText};
    cursor: not-allowed;
  }
`;
const InfoText = styled.small`
  display: block;
  font-size: 0.8em;
  margin-top: 6px;
  color: ${({ theme, type }) => {
    if (type === 'error') return theme.error;
    if (type === 'loading') return theme.secondary;
    return theme.text;
  }};
`;
// スピナーアニメーション用 (FaSpinnerに適用)
const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const StyledFaSpinner = styled(FaSpinner)`
  animation: ${spinAnimation} 1s linear infinite;
`;


const Turn = ({ turn, showJapanese, turnId, activePlayerId, setActivePlayerId }) => {
  const { play, stop, isPlaying, error: playerError, currentAudioSrc } = useAudioPlayer();
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [isTTSEnabledGlobally, setIsTTSEnabledGlobally] = useState(true);

  useEffect(() => {
    const ttsSettings = storageService.loadTTSSettings(); // Correct: uses storageService
    setIsTTSEnabledGlobally(ttsSettings.ttsEnabled);
  }, []);

  useEffect(() => {
    return () => {
      if (isPlaying && activePlayerId === turnId) {
        stop();
      }
    };
  }, [isPlaying, activePlayerId, turnId, stop]);

  if (!turn) return null;

  const handlePlayAudio = async () => {
    // Correctly use storageService.loadTTSSettings() here
    const currentTTSSettings = storageService.loadTTSSettings();

    if (activePlayerId === turnId && (isPlaying || (isLoadingAudio && currentTTSSettings?.ttsService !== 'GeminiTTS'))) {
      if (currentTTSSettings?.ttsService !== 'GeminiTTS') {
        ttsService.cancelBrowserSpeech();
      } else {
        stop();
      }
      setActivePlayerId(null);
      setIsLoadingAudio(false);
      return;
    }

    if (activePlayerId && activePlayerId !== turnId) {
      console.log(`オーディオプレイヤーを ${activePlayerId} から ${turnId} に切り替え`);
    }

    setActivePlayerId(turnId);
    setIsLoadingAudio(true);
    setTtsError(null);

    try {
      // const ttsSettings = storageService.loadTTSSettings(); // Already fetched as currentTTSSettings
      if (currentTTSSettings.ttsService === 'GeminiTTS' && currentTTSSettings.ttsApiKey) {
        const audioSrc = await ttsService.synthesizeSpeech(turn.english, currentTTSSettings);
        play(audioSrc);
      } else {
        ttsService.cancelBrowserSpeech();
        await ttsService.speakBrowser(turn.english, 'en-US');
        setIsLoadingAudio(false);
      }
    } catch (err) {
      console.error("TurnコンポーネントでのTTSエラー:", err);
      setTtsError(err.message);
      setIsLoadingAudio(false);
      setActivePlayerId(null);
    }
  };

  const isThisTurnActive = activePlayerId === turnId;
  // Correctly use storageService.loadTTSSettings() here
  const currentTTSSettings = storageService.loadTTSSettings();
  const isBrowserSpeechSelected = currentTTSSettings?.ttsService !== 'GeminiTTS';

  const isCurrentlySpeakingThisTurn = isThisTurnActive && (
    (isPlaying && currentAudioSrc !== null) ||
    (isLoadingAudio && isBrowserSpeechSelected)
  );
  const isCurrentlyLoadingCloudAudioForThisTurn = isThisTurnActive && isLoadingAudio && !isBrowserSpeechSelected;

  return (
    <TurnWrapper speaker={turn.speaker}>
      <EnglishText>{turn.english}</EnglishText>
      {showJapanese && <JapaneseText>{turn.japanese}</JapaneseText>}

      {isTTSEnabledGlobally && (
        <PlayButton
          onClick={handlePlayAudio}
          disabled={isCurrentlyLoadingCloudAudioForThisTurn}
          isActive={isCurrentlySpeakingThisTurn}
          title={isCurrentlySpeakingThisTurn ? "読み上げを停止" : "この部分を読み上げ"}
        >
          {isCurrentlyLoadingCloudAudioForThisTurn ? <StyledFaSpinner /> : (isCurrentlySpeakingThisTurn ? <FaStopCircle /> : <FaVolumeUp />)}
        </PlayButton>
      )}

      {isCurrentlyLoadingCloudAudioForThisTurn && <InfoText type="loading">音声データをロード中...</InfoText>}
      {isThisTurnActive && ttsError && <InfoText type="error">TTSエラー: {ttsError}</InfoText>}
      {isThisTurnActive && playerError && <InfoText type="error">オーディオエラー: {playerError}</InfoText>}
    </TurnWrapper>
  );
};

export default Turn;
// ファイル末尾に改行を保証します
