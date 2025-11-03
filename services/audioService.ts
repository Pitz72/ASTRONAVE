
// Create a single AudioContext instance to be reused.
// It's created on the first user interaction to comply with browser policies.
let audioCtx: AudioContext | null = null;

const initializeAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if it was suspended
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

// A helper to create and start an oscillator for a short duration.
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Low volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
};

// Helper for noise-based sounds (like movement)
const playNoise = (duration: number) => {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start();
    noise.stop(audioCtx.currentTime + duration);
}

// Ensure audio is initialized on first user interaction
const ensureAudioInitialized = () => {
    if (!audioCtx || audioCtx.state === 'suspended') {
        initializeAudio();
    }
};

export const playKeystrokeSound = () => {
    ensureAudioInitialized();
    playTone(220, 0.05, 'square');
};

export const playSubmitSound = () => {
    ensureAudioInitialized();
    playTone(440, 0.1, 'square');
};

export const playItemSound = () => {
    ensureAudioInitialized();
    playTone(880, 0.05, 'triangle');
    setTimeout(() => { if(audioCtx) playTone(1046, 0.05, 'triangle') }, 60);
};

export const playMagicSound = () => {
    ensureAudioInitialized();
    playTone(1046.50, 0.1, 'sine');
    setTimeout(() => { if(audioCtx) playTone(1396.91, 0.1, 'sine') }, 100);
    setTimeout(() => { if(audioCtx) playTone(1567.98, 0.2, 'sine') }, 200);
};

export const playMoveSound = () => {
    ensureAudioInitialized();
    playNoise(0.15);
};

export const playErrorSound = () => {
    ensureAudioInitialized();
    playTone(110, 0.15, 'sawtooth');
};
