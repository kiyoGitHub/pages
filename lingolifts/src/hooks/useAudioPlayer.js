import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage HTML5 audio playback.
 * Handles play, pause, stop, and tracks playback state.
 */
const useAudioPlayer = () => {
  const audioRef = useRef(null); // Ref to the <audio> element
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(true); // Initially stopped
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0); // Total duration of the audio
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const [currentSource, setCurrentSource] = useState(null); // Current audio source URL

  // Effect to initialize and clean up the audio element and its event listeners
  useEffect(() => {
    audioRef.current = new Audio();
    const audioElement = audioRef.current;

    // Event listeners for the audio element
    const handleLoadedMetadata = () => setDuration(audioElement.duration);
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsStopped(false);
      setError(null);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      setIsStopped(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);
    };
    const handleError = (e) => {
      console.error("Audio playback error:", audioElement.error || e);
      setError('Error during audio playback.');
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('playing', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    // Cleanup function when the component unmounts or dependencies change
    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('playing', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        // No need to set audioRef.current = null here as it might be accessed during cleanup
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  /**
   * Plays audio from the given source.
   * If the source is the same as the current one and audio is paused, it resumes.
   * Otherwise, it loads and plays the new source.
   * @param {string} audioSrc - URL of the audio to play.
   */
  const play = useCallback((audioSrc) => {
    if (!audioRef.current) return;

    if (currentSource === audioSrc && isPaused) {
      audioRef.current.play().catch(e => {
        console.error("Error resuming audio:", e);
        setError("Failed to resume audio.");
      });
    } else {
      setCurrentSource(audioSrc); // Set new source
      audioRef.current.src = audioSrc;
      audioRef.current.load(); // Load the new source
      audioRef.current.play().catch(e => {
        console.error("Error playing new audio:", e);
        setError("Failed to play audio.");
      });
    }
  }, [isPaused, currentSource]); // Dependencies for useCallback

  /**
   * Pauses the currently playing audio.
   */
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]); // Dependency for useCallback

  /**
   * Stops the currently playing audio and resets its time to the beginning.
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      // setCurrentSource(null); // Optionally clear source on stop
    }
  }, []); // No dependencies needed if it only interacts with audioRef

  return {
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    isStopped,
    duration,
    currentTime,
    error,
    currentAudioSrc: currentSource,
  };
};

export default useAudioPlayer;
