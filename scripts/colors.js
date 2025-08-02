/**
 * @file colors.js
 * @brief Color definitions for disk defragmentation visualization
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file contains all color constants used in the disk defragmentation
 * animation, organized into namespaces for blocks and UI elements.
 */

// Helper function to convert 16-bit RGB565 color to CSS color string
function rgb565ToCSS(color565) {
    const r = ((color565 >> 11) & 0x1F) << 3;
    const g = ((color565 >> 5) & 0x3F) << 2;
    const b = (color565 & 0x1F) << 3;
    return `rgb(${r}, ${g}, ${b})`;
}

// Organize color definitions
const Colors = {
    // Color definitions for blocks
    Block: {
        FREE: rgb565ToCSS(0xFFFF),            // Color for free space
        FIXED_BACK: rgb565ToCSS(0xFFFF),      // Background color for fixed data
        FIXED_FORE: rgb565ToCSS(0xF800),      // Foreground color for fixed data
        OPTIMIZED: rgb565ToCSS(0x161F),       // Color for optimized data
        UNOPT_BEGIN: rgb565ToCSS(0x07FF),     // Color for unoptimized data (beginning of drive)
        UNOPT_MIDDLE: rgb565ToCSS(0x0430),    // Color for unoptimized data (middle of drive)
        UNOPT_END: rgb565ToCSS(0x0210),       // Color for unoptimized data (end of drive)
        READING: rgb565ToCSS(0x07E0),         // Color for data that's currently being read
        WRITING: rgb565ToCSS(0xF800),         // Color for data that's currently being written
        BAD_BACK: rgb565ToCSS(0xFFFF),        // Background color for bad area
        BAD_FORE: rgb565ToCSS(0xF800),        // Foreground color for bad area
        FRAME: rgb565ToCSS(0x0000)            // Color for block frame
    },

    // Color definitions for UI
    UI: {
        WINDOW_BACK: rgb565ToCSS(0xC618),     // Color for window background
        TITLE_BAR_BACK: rgb565ToCSS(0x0010),  // Color for window title bar background
        TITLE_BAR_TEXT: rgb565ToCSS(0xFFFF),  // Color for window title bar text
        BUTTON_BACK: rgb565ToCSS(0xC618),     // Color for button background
        BUTTON_LIGHT: rgb565ToCSS(0xFFFF),    // Color for button highlight
        BUTTON_SHADOW: rgb565ToCSS(0x0000),   // Color for button shadow
        BUTTON_TEXT: rgb565ToCSS(0x0000),     // Color for button text
        GRID_BACK: rgb565ToCSS(0xFFFF),       // Color for grid background
        GRID_FRAME: rgb565ToCSS(0x0000),      // Color for grid frame
        PROGRESS_FRAME: rgb565ToCSS(0x0000),  // Color for progress bar frame
        PROGRESS_BLOCK: rgb565ToCSS(0x0210),  // Color for progress bar block
        HIT_COUNTER: rgb565ToCSS(0xF800)      // Color for hit counter text
    }
};
