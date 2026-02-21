// Global variable to keep track of unlocked state
let isAudioContextUnlocked = false;

/**
 * Unlocks audio context on the first user interaction.
 * Modern browsers block audio until a user clicks/taps.
 */
const unlockAudio = () => {
  if (isAudioContextUnlocked) return;
  
  const unlock = () => {
    isAudioContextUnlocked = true;
    console.log("[Audio] System unlocked by user gesture.");
    window.removeEventListener("click", unlock);
    window.removeEventListener("touchstart", unlock);
  };

  window.addEventListener("click", unlock);
  window.addEventListener("touchstart", unlock);
};

// Start listening for unlock gesture
unlockAudio();

export const playNotificationSound = async () => {
  try {
    const audio = new Audio("/notification.mp3");
    
    // Set a timeout for the audio load/play
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      await playPromise.catch((err) => {
        console.warn("[Audio] MP3 play blocked or failed:", err.message);
        playFallbackBeep();
      });
    }
  } catch (error) {
    console.warn("[Audio] playNotificationSound failed:", error);
    playFallbackBeep();
  }
};

const playFallbackBeep = () => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // If context is suspended (blocked), try a quick resume
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("[Audio] Fallback beep failed:", e);
  }
};
