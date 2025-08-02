/**
 * @file defragSimulator.js
 * @brief Main controller for disk defragmentation simulation
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the DefragSimulator class which orchestrates the entire
 * disk defragmentation animation, managing all subsystems including grid,
 * file management, animations, UI rendering, and sound effects.
 */

class DefragSimulator {
    constructor() {
        this.gridManager = new GridManager();
        this.fileManager = new FileManager(this.gridManager);
        this.animationManager = new AnimationManager(this.gridManager);
        this.uiRenderer = new UIRenderer();
        this.soundManager = new SoundManager(this.gridManager.getRNG());
        this.completedStateStartTime = 0;
        this.isInCompletedState = false;
        this.touchStateStartTime = 0;
        this.isInTouchState = false;
        this.lastSoundTime = 0;
        this.soundInterval = 50; // Play sound every 50ms during defrag
        
        // Set initial state
        this.uiRenderer.setState(AnimationState.READING_DRIVE_INFO_PHASE1);
    }
    
    // Initialization
    initialize() {
        // Initialize UI rendering class
        this.uiRenderer.initialize();
        
        // Initialize sound class
        this.soundManager.initialize();
        
        // Initialize Config with screen dimensions
        Config.getInstance().initialize(this.uiRenderer.screenWidth, this.uiRenderer.screenHeight);
        
        // Recreate grid manager with proper dimensions
        this.gridManager = new GridManager();
        this.fileManager = new FileManager(this.gridManager);
        this.animationManager = new AnimationManager(this.gridManager);
        this.soundManager = new SoundManager(this.gridManager.getRNG());
        
        // Initial animation state is reading drive information phase 1
        this.setState(AnimationState.READING_DRIVE_INFO_PHASE1);
        this.uiRenderer.setCompletionPercentage(0);
        
        // Reset completion state flag
        this.completedStateStartTime = 0;
        this.isInCompletedState = false;
        
        // Reset touch state flag
        this.touchStateStartTime = 0;
        this.isInTouchState = false;
        
        // Play seek sound
        this.soundManager.playSeekSound().catch(error => {
            console.warn('Failed to play initial seek sound:', error);
        });
    }
    
    // Reset
    reset() {
        // Create a new grid manager
        this.gridManager = new GridManager();
        
        // Reinitialize file manager (create a new instance)
        this.fileManager = new FileManager(this.gridManager);
        
        // Create new animation manager
        this.animationManager = new AnimationManager(this.gridManager);
        
        // Create new sound manager
        this.soundManager = new SoundManager(this.gridManager.getRNG());
        
        // Initial animation state is reading drive information phase 1
        this.setState(AnimationState.READING_DRIVE_INFO_PHASE1);
        this.uiRenderer.setCompletionPercentage(0);

        // Reset Hit counter
        this.uiRenderer.setHitCounter(0);

        // Reset completion state flag
        this.completedStateStartTime = 0;
        this.isInCompletedState = false;

        // Reset touch state flag
        this.touchStateStartTime = 0;
        this.isInTouchState = false;
        
        // Play seek sound
        this.soundManager.playSeekSound().catch(error => {
            console.warn('Failed to play reset seek sound:', error);
        });
    }
    
    // Update process
    update() {
        const state = this.uiRenderer.getState();
        let completionPercentage = 0;
        
        switch (state) {
            case AnimationState.READING_DRIVE_INFO_PHASE1:
                // Update blocks
                this.animationManager.updateBlocksInDriveInfoPhase1();
                
                // Update progress
                completionPercentage = this.animationManager.calculateDriveInfoPhasesCompletionPercentage();
                this.uiRenderer.setCompletionPercentage(completionPercentage);
                
                // Check if scan is complete
                if (this.animationManager.isDriveInfoPhase1ScanCompleted()) {
                    // Change animation state to reading drive information (Phase 2: Identifying immovable data)
                    this.uiRenderer.setState(AnimationState.READING_DRIVE_INFO_PHASE2);
                }
                break;
                
            case AnimationState.READING_DRIVE_INFO_PHASE2:
                // Update blocks
                this.animationManager.updateBlocksInDriveInfoPhase2();
                
                // Update progress
                completionPercentage = this.animationManager.calculateDriveInfoPhasesCompletionPercentage();
                this.uiRenderer.setCompletionPercentage(completionPercentage);
                
                // Check if scan is complete
                if (this.animationManager.isDriveInfoPhase2ScanCompleted()) {
                    // Change animation state to DEFRAGMENTING
                    this.uiRenderer.setState(AnimationState.DEFRAGMENTING);
                }
                break;
                
            case AnimationState.DEFRAGMENTING:
                // Update defrag step
                this.animationManager.incrementDefragStep();
                
                // If not moving a file, start moving a new file
                if (!this.fileManager.isMoving() && 
                    this.animationManager.getDefragStep() % Config.Animation.DEFRAG_STEP_INTERVAL === 0) {
                    this.fileManager.moveNextFile();
                }
                
                // Update blocks
                this.animationManager.updateBlocksInDefragmenting();
                
                // Update file movement
                this.fileManager.updateFileMovement();
                
                // Update progress
                completionPercentage = this.animationManager.calculateDefragmentingCompletionPercentage();
                this.uiRenderer.setCompletionPercentage(completionPercentage);
                
                // Play seek sound at intervals
                const currentTime = millis();
                if (currentTime - this.lastSoundTime >= this.soundInterval) {
                    // Use async call but don't wait for it
                    this.soundManager.playSeekSound().catch(error => {
                        console.warn('Failed to play seek sound:', error);
                    });
                    this.lastSoundTime = currentTime;
                }
                
                // Check if all fragmented files have been moved
                if (completionPercentage >= 100) {
                    this.uiRenderer.setState(AnimationState.COMPLETED);
                }
                break;
                
            case AnimationState.COMPLETED:
                // If it's the first time entering COMPLETED state, record the time
                if (!this.isInCompletedState) {
                    this.completedStateStartTime = millis();
                    this.isInCompletedState = true;
                }
                
                // Reset after the set time has elapsed
                if (millis() - this.completedStateStartTime >= Config.Animation.RESET_DELAY) {
                    this.reset();
                }
                break;
                
            case AnimationState.TOUCHED:
                // If it's the first time entering TOUCHED state, record the time
                if (!this.isInTouchState) {
                    this.touchStateStartTime = millis();
                    this.isInTouchState = true;
                }
                
                // Update explosion animation
                for (let y = 0; y < this.gridManager.getRowCount(); y++) {
                    for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                        const block = this.gridManager.getBlock(x, y);
                        block.updateExplosion();
                    }
                }
                
                // Reset after the set time has elapsed
                if (millis() - this.touchStateStartTime >= Config.Animation.RESET_DELAY) {
                    this.reset();
                }
                break;
        }
    }
    
    // Draw grid and UI elements
    draw() {
        this.uiRenderer.draw(this.gridManager, this.animationManager);
    }
    
    // Get state
    getState() {
        return this.uiRenderer.getState();
    }
    
    // Set state
    setState(newState) {
        this.uiRenderer.setState(newState);
    }
    
    // Process when touch/click is detected
    handleTouch(x, y) {
        // Enable audio context on first user interaction
        this.soundManager.enableAudio();
        
        // Set to TOUCHED state
        this.uiRenderer.setState(AnimationState.TOUCHED);
        
        // Increment hit counter
        this.uiRenderer.incrementHitCounter();
        
        // Explode using the touched screen coordinates as the reference point
        this.setAllBlocksToBAD(x, y);
    }
    
    // Explode all blocks
    setAllBlocksToBAD(touchX, touchY) {
        // Start explosion animation for all blocks
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                // Explode blocks other than invisible or free areas
                switch (block.state) {
                    case BlockState.FREE:
                    case BlockState.INVISIBLE_UNOPT_BEGIN:
                    case BlockState.INVISIBLE_UNOPT_MIDDLE:
                    case BlockState.INVISIBLE_UNOPT_END:
                    case BlockState.INVISIBLE_OPTIMIZED:
                    case BlockState.INVISIBLE_FIXED_AS_UNOPT_BEGIN:
                    case BlockState.INVISIBLE_FIXED_AS_UNOPT_MIDDLE:
                    case BlockState.INVISIBLE_FIXED_AS_UNOPT_END:
                        break;
                    
                    default:
                        block.startExploding(touchX, touchY);
                        break;
                }
            }
        }
        
        // Play explosion sound
        this.soundManager.playExplosionSound();
    }
}
