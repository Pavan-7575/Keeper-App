// Web Audio API Synthesizer for Notification Tones

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

export const playNotificationTone = (soundName = 'chime') => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (soundName === 'bell') {
            // Metallic Bell Sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now); // A5
            osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.2);
        } else if (soundName === 'digital') {
            // Digital Beep Beep
            [0, 0.15].forEach((offset) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(1046.5, now + offset); // C6
                gain.gain.setValueAtTime(0.15, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.1);
            });
        } else if (soundName === 'alarm') {
            // Loud Alarm Ring (3 rapid double-beeps)
            [0, 0.15, 0.4, 0.55, 0.8, 0.95].forEach((offset) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(950, now + offset);
                gain.gain.setValueAtTime(0.25, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.12);
            });
        } else if (soundName === 'wave') {
            // Gentle Wave Rise
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.6);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        } else {
            // Default Chime (Harmonic Dual Tone)
            [523.25, 659.25, 783.99].forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = now + index * 0.12;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        }
    } catch (e) {
        console.warn('Could not play notification tone:', e);
    }
};
