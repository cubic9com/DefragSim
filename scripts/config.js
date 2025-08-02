/**
 * @file config.js
 * @brief Configuration settings for disk defragmentation simulator
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file contains the Config singleton class that manages all configuration
 * parameters for the disk defragmentation visualization, including grid dimensions,
 * UI settings, animation parameters, and sound configurations.
 */

// Configuration singleton class for the defragmentation simulator
class Config {
    constructor() {
        if (Config.instance) {
            return Config.instance;
        }
        
        // Screen dimensions
        this.screenWidth = 0;
        this.screenHeight = 0;
        
        // Calculated values
        this.gridCols = 0;
        this.gridRows = 0;
        this.progressBarWidth = 0;
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;
        this.progressBarOffsetX = 0;
        
        Config.instance = this;
    }
    
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    
    initialize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        
        // ========================================
        // Block dimensions (fixed values)
        // ========================================
        const blockWidth = 9;      // Width of each block in pixels
        const blockHeight = 12;     // Height of each block in pixels
        const blockSpacing = 3;    // Spacing between blocks in pixels
        
        // ========================================
        // Calculate grid columns and X offset
        // ========================================
        
        // Reserve minimum margins on both sides
        const maxGridAreaWidth = this.screenWidth - 10;  // 5 pixels margin on each side
        this.gridCols = Math.floor(maxGridAreaWidth / (blockWidth + blockSpacing));
        
        // Calculate actual grid pixel width
        const actualGridWidth = this.gridCols * (blockWidth + blockSpacing);
        
        // Center the grid horizontally
        this.gridOffsetX = Math.floor((this.screenWidth - actualGridWidth) / 2);
        
        // ========================================
        // Calculate grid rows and Y offset
        // ========================================
        
        // Y offset includes title bar height and matches X offset for symmetry
        this.gridOffsetY = Config.TITLE_BAR_HEIGHT + this.gridOffsetX;
        
        // Calculate available height for grid
        const statusAreaHeight = 65;  // Space for status text, progress bar, and percentage
        const gridAreaHeight = this.screenHeight - this.gridOffsetY - statusAreaHeight;
        this.gridRows = Math.floor(gridAreaHeight / (blockHeight + blockSpacing));
        
        // Ensure minimum grid rows for playability
        if (this.gridRows < 8) this.gridRows = 8;
        
        // ========================================
        // Calculate progress bar dimensions
        // ========================================
        
        // Progress bar block dimensions
        const progressBlockWidth = 8;     // Width of each progress block
        const progressBlockSpacing = 10;  // Spacing between progress blocks
        const progressPadding = 2;        // Internal padding of progress bar frame
        
        // Calculate maximum number of progress blocks that can fit
        const maxProgressBarInnerWidth = this.screenWidth - 20 - 2 * progressPadding;  // 20px for margins, 4px for padding
        const maxBlocks = Math.floor((maxProgressBarInnerWidth + progressBlockSpacing - progressBlockWidth) / progressBlockSpacing);
        
        // Calculate exact progress bar width based on number of blocks
        // Formula: first block width + (number of blocks - 1) * spacing
        const progressBarInnerWidth = progressBlockWidth + (maxBlocks - 1) * progressBlockSpacing;
        this.progressBarWidth = progressBarInnerWidth + 2 * progressPadding;  // Add frame padding
        
        // Center the progress bar horizontally
        this.progressBarOffsetX = Math.floor((this.screenWidth - this.progressBarWidth) / 2);
    }
    
    // ========================================
    // Grid configuration getters
    // ========================================
    
    static getGridCols() {
        return Config.getInstance().gridCols;
    }
    
    static getGridRows() {
        return Config.getInstance().gridRows;
    }
    
    static getGridOffsetX() {
        return Config.getInstance().gridOffsetX;
    }
    
    static getGridOffsetY() {
        return Config.getInstance().gridOffsetY;
    }
    
    // ========================================
    // Block configuration getters
    // ========================================
    
    static getBlockWidth() {
        return 9;  // Fixed block width
    }
    
    static getBlockHeight() {
        return 12;  // Fixed block height
    }
    
    // ========================================
    // UI configuration
    // ========================================
    
    static get TITLE_BAR_HEIGHT() {
        return 20;
    }
    
    // ========================================
    // Progress bar configuration getters
    // ========================================
    
    static getProgressBarWidth() {
        return Config.getInstance().progressBarWidth;
    }
    
    static getProgressBarOffsetX() {
        return Config.getInstance().progressBarOffsetX;
    }
    
    static getProgressBarHeight() {
        return 15;  // Fixed progress bar height
    }
    
    static getProgressBarBlockWidth() {
        return 8;  // Fixed progress block width
    }
    
    static getProgressBarBlockHeight() {
        return 11;  // Fixed progress block height
    }
    
    static getProgressBarBlockSpacing() {
        return 10;  // Fixed spacing between progress blocks
    }
    
    // ========================================
    // Animation configuration
    // ========================================
    static get Animation() {
        return {
            // Block movement speed coefficient
            MOVE_SPEED: 0.3,
            
            // Position threshold (differences below this are ignored)
            POSITION_THRESHOLD: 0.05,
            
            // Gravity acceleration during explosion
            GRAVITY: 0.4,
            
            // Defrag step interval (in frames)
            DEFRAG_STEP_INTERVAL: 60,
            
            // Block movement delay time (in milliseconds)
            BLOCK_MOVE_DELAY: 5,
            
            // Wait time until reset (in milliseconds)
            RESET_DELAY: 3000
        };
    }
    
    // ========================================
    // Sound configuration
    // ========================================
    static get Sound() {
        return {
            // Seek sound configuration
            Seek: {
                // Base frequency (Hz)
                BASE_FREQ: 4500,
                
                // Random frequency variation range (Hz)
                FREQ_VARIATION: 500,
                
                // Minimum sound duration (milliseconds)
                MIN_DURATION: 4,
                
                // Maximum sound duration (milliseconds)
                MAX_DURATION: 10,
                
                // Number of consecutive beep sounds
                BEEP_COUNT: 6,
                
                // Speaker volume
                SPEAKER_VOLUME: 0.005
            },
            
            // Explosion sound configuration
            Explosion: {
                // Explosion sound frequency
                FREQUENCY: 82.407,
                
                // Explosion sound duration
                DURATION: 50,
                
                // Speaker volume
                SPEAKER_VOLUME: 0.15
            }
        };
    }
}

// Initialize static instance
Config.instance = null;
