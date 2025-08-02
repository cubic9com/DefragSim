/**
 * @file main.js
 * @brief Main entry point for web-based disk defragmentation simulator
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file contains the main entry point for the web browser version
 * of the disk defragmentation animation. It initializes the application,
 * sets up event handlers, and runs the main animation loop.
 */

// Global instance
let defragSim;
let animationId;
let isAnimationStarted = false;

// Initialize the application
function setup() {
    // Set up start button
    setupUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Don't start animation loop yet - wait for button click
}

// Set up UI with language detection
function setupUI() {
    const appTitle = document.getElementById('appTitle');
    const noticeStorage = document.getElementById('noticeStorage');
    const noticeSound = document.getElementById('noticeSound');
    const noticeGitHub = document.getElementById('noticeGitHub');
    const startButton = document.getElementById('startButton');
        
    // Set title text based on language
    appTitle.textContent = getLocalizedText('Disk Defragmentation Simulator', 'ディスクデフラグシミュレータ');
    
    // Set notice text based on language
    noticeStorage.textContent = getLocalizedText('It is a simulator and does not actually access the storage.', 'シミュレータであり、実際にストレージにアクセスしているわけではありません。');
    noticeSound.textContent = getLocalizedText('A sound effect will play.', '音声が再生されます。');
    noticeGitHub.textContent = getLocalizedText('Source code is available on GitHub.', 'ソースコードはGitHubにて公開しています。');
    
    // Set button text based on language
    startButton.textContent = getLocalizedText('Start', '開始');
    
    // Add click event listener
    startButton.addEventListener('click', startAnimation);
}

// Start the animation when button is clicked
function startAnimation() {
    if (isAnimationStarted) {
        return; // Already started
    }
    
    // Hide the title, start button and notice text
    const appTitle = document.getElementById('appTitle');
    const startButton = document.getElementById('startButton');
    const noticeText = document.getElementById('noticeText');
    appTitle.style.display = 'none';
    startButton.style.display = 'none';
    noticeText.style.display = 'none';
    
    // Create defrag simulator instance
    defragSim = new DefragSimulator();
    
    // Initialize the simulator
    defragSim.initialize();
    
    // Enable audio context on user interaction
    if (defragSim.soundManager) {
        defragSim.soundManager.enableAudio();
        // Play initial seek sound
        defragSim.soundManager.playSeekSound().catch(error => {
            console.warn('Failed to play initial seek sound:', error);
        });
    }
    
    // Mark animation as started
    isAnimationStarted = true;
    
    // Start the animation loop
    loop();
}

// Set up event listeners
function setupEventListeners() {
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse events
    canvas.addEventListener('click', handleClick);
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle window focus/blur for audio context
    window.addEventListener('focus', () => {
        if (defragSim && defragSim.soundManager) {
            defragSim.soundManager.enableAudio();
        }
    });
}

// Handle mouse click
function handleClick(event) {
    if (!defragSim || !isAnimationStarted) return;
    
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    defragSim.handleTouch(x, y);
}

// Handle touch start
function handleTouchStart(event) {
    event.preventDefault(); // Prevent scrolling
    
    if (!defragSim || !isAnimationStarted) return;
    
    if (event.touches.length > 0) {
        const rect = event.target.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        defragSim.handleTouch(x, y);
    }
}

// Handle touch end
function handleTouchEnd(event) {
    event.preventDefault(); // Prevent default touch behavior
}

// Main animation loop
function loop() {
    // Update the simulation
    defragSim.update();
    
    // Draw the current frame
    defragSim.draw();
    
    // Schedule next frame
    animationId = requestAnimationFrame(loop);
}

// Stop the animation loop
function stopLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!isAnimationStarted) return; // Don't handle visibility if animation hasn't started
    
    if (document.hidden) {
        // Page is hidden, pause animation
        stopLoop();
    } else {
        // Page is visible, resume animation
        if (!animationId) {
            loop();
        }
    }
});

// Start the application when the page loads
window.addEventListener('load', () => {
    setup();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    stopLoop();
});

// Export for debugging purposes
window.defragSim = defragSim;
