/**
 * @file platformCompat.js
 * @brief Platform compatibility layer for web browser support
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file provides platform-specific compatibility definitions to enable
 * the code to run in web browsers using JavaScript.
 */

// Platform compatibility functions for web browser environment

// Get current time in milliseconds (equivalent to Arduino's millis())
function millis() {
    return Date.now() - startTime;
}

// Delay function (non-blocking in web environment)
function delay(msec) {
    // In web environment, we don't use blocking delays
    // This is just for compatibility, actual timing is handled by requestAnimationFrame
    return;
}

// Generate seed for random number generator
function seed() {
    return Date.now() + Math.floor(Math.random() * 1000000);
}

// Initialize start time when the script loads
const startTime = Date.now();

// Language detection utility
function getLanguage() {
    // Get browser language setting
    const lang = navigator.language || navigator.userLanguage;
    return lang.toLowerCase();
}

// Check if the browser language is Japanese
function isJapanese() {
    const lang = getLanguage();
    return lang.startsWith('ja');
}

// Get localized text based on browser language
function getLocalizedText(englishText, japaneseText) {
    return isJapanese() ? japaneseText : englishText;
}
