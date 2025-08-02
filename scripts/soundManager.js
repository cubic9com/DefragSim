/**
 * @file soundManager.js
 * @brief Sound effects management for disk defragmentation simulation
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the SoundManager class which handles sound effects
 * for the disk defragmentation animation, including seek sounds and
 * explosion effects using Web Audio API.
 */

class SoundManager {
    constructor(rng) {
        this.rng = rng;
        this.audioContext = null;
        this.isInitialized = false;
        this.initialize();
    }
    
    // Initialization
    initialize() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('SoundManager initialized successfully');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.audioContext = null;
            this.isInitialized = false;
        }
    }
    
    // Create a tone using Web Audio API (synchronous version for seek sounds)
    createToneSync(frequency, duration, volume = 0.1) {
        if (!this.audioContext || !this.isInitialized) {
            console.warn('Audio context not available');
            return;
        }
        
        try {
            // Resume audio context if it's suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect oscillator to gain node to audio context destination
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Set frequency and waveform
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'square'; // Use square wave for retro sound
            
            // Set volume envelope (attack and decay)
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.001); // Very quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000); // Decay
            
            // Start and stop the oscillator
            oscillator.start(now);
            oscillator.stop(now + duration / 1000);
            
            console.log(`Playing tone: ${frequency}Hz for ${duration}ms`);
        } catch (error) {
            console.error('Error creating tone:', error);
        }
    }
    
    // Sleep function for synchronous delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Play hard disk seek sound (faithful to C++ version)
    async playSeekSound() {
        if (!this.audioContext || !this.isInitialized) {
            console.warn('Cannot play seek sound: audio context not available');
            return;
        }
        
        console.log('Playing seek sound...');
        
        try {
            // Resume audio context if needed
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const baseFreq = Config.Sound.Seek.BASE_FREQ;
            const freqVariation = Config.Sound.Seek.FREQ_VARIATION;
            const minDuration = Config.Sound.Seek.MIN_DURATION;
            const maxDuration = Config.Sound.Seek.MAX_DURATION;
            const beepCount = Config.Sound.Seek.BEEP_COUNT;
            const volume = Config.Sound.Seek.SPEAKER_VOLUME;
            
            // Play multiple short noises in succession (like the C++ version)
            for (let i = 0; i < beepCount; i++) {
                // Add significant randomness to the base frequency (-variation to +variation)
                const freqOffset = Math.floor((this.rng() - 0.5) * 2 * freqVariation);
                const freq = baseFreq + freqOffset;
                
                // Also randomize the duration
                const duration = minDuration + Math.floor(this.rng() * (maxDuration - minDuration + 1));
                
                // Play the noise
                this.createToneSync(freq, duration, volume);
                
                // Leave a very short interval (0-2ms like C++ version)
                const delayTime = Math.floor(this.rng() * 3); // 0-2ms
                if (delayTime > 0) {
                    await this.sleep(delayTime);
                }
            }
        } catch (error) {
            console.error('Error playing seek sound:', error);
        }
    }
    
    // Play explosion sound
    playExplosionSound() {
        if (!this.audioContext || !this.isInitialized) {
            console.warn('Cannot play explosion sound: audio context not available');
            return;
        }
        
        console.log('Playing explosion sound...');
        
        try {
            // Resume audio context if needed
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const frequency = Config.Sound.Explosion.FREQUENCY;
            const duration = Config.Sound.Explosion.DURATION;
            const volume = Config.Sound.Explosion.SPEAKER_VOLUME;
            
            // Create a more complex explosion sound with multiple frequencies
            this.createToneSync(frequency, duration, volume);
            this.createToneSync(frequency * 1.5, duration * 0.7, volume * 0.7);
            this.createToneSync(frequency * 0.7, duration * 1.2, volume * 0.5);
        } catch (error) {
            console.error('Error playing explosion sound:', error);
        }
    }
    
    // Enable audio context (call this on user interaction)
    enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            console.log('Resuming audio context...');
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            }).catch(error => {
                console.error('Failed to resume audio context:', error);
            });
        }
    }
    
    // Get audio context state for debugging
    getAudioState() {
        if (!this.audioContext) {
            return 'No audio context';
        }
        return `Audio context state: ${this.audioContext.state}`;
    }
}
