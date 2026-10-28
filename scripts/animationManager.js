/**
 * @file animationManager.js
 * @brief Animation management for disk defragmentation simulation
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the AnimationManager class which handles all animation
 * states and transitions for the disk defragmentation visualization.
 */

class AnimationManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.defragStep = 0;
        this.driveInfoPhase1ScanX = 0;
        this.driveInfoPhase1ScanY = 0;
        this.driveInfoPhase1ScanCompleted = false;
        this.driveInfoPhase2ScanX = 0;
        this.driveInfoPhase2ScanY = 0;
        this.driveInfoPhase2ScanCompleted = false;
        this.totalBlocksCache = -1;
        this.unoptimizedBlocksCache = -1;
        this.percentageFrameCounter = 0;
    }
    
    // Reset
    reset() {
        this.defragStep = 0;
        this.driveInfoPhase1ScanX = 0;
        this.driveInfoPhase1ScanY = 0;
        this.driveInfoPhase1ScanCompleted = false;
        this.driveInfoPhase2ScanX = 0;
        this.driveInfoPhase2ScanY = 0;
        this.driveInfoPhase2ScanCompleted = false;
        this.totalBlocksCache = -1;
        this.unoptimizedBlocksCache = -1;
        this.percentageFrameCounter = 0;
    }
    
    // Block update process in reading drive info phase 1
    updateBlocksInDriveInfoPhase1() {
        // Do nothing if scan is complete
        if (this.driveInfoPhase1ScanCompleted) {
            return;
        }
        
        // Update blocks per frame (10x faster than original)
        const blocksPerFrame = Math.max(1, Math.floor(this.gridManager.getColumnCount()));
        
        for (let i = 0; i < blocksPerFrame && this.driveInfoPhase1ScanY < this.gridManager.getRowCount(); i++) {
            if (this.driveInfoPhase1ScanX < this.gridManager.getColumnCount()) {
                this.gridManager.getBlock(this.driveInfoPhase1ScanX, this.driveInfoPhase1ScanY).updateStateInDriveInfoPhase1();
                this.driveInfoPhase1ScanX++;
            }
            
            // Move to the next row when current row is complete
            if (this.driveInfoPhase1ScanX >= this.gridManager.getColumnCount()) {
                this.driveInfoPhase1ScanX = 0;
                this.driveInfoPhase1ScanY++;
            }
        }
        
        // If all rows have been scanned
        if (this.driveInfoPhase1ScanY >= this.gridManager.getRowCount()) {
            this.driveInfoPhase1ScanCompleted = true;
        }
    }
    
    // Block update process in reading drive info phase 2
    updateBlocksInDriveInfoPhase2() {
        // Do nothing if scan is complete
        if (this.driveInfoPhase2ScanCompleted) {
            return;
        }
        
        // Update blocks per frame (10x faster than original)
        const blocksPerFrame = Math.max(1, Math.floor(this.gridManager.getColumnCount() / 1.5));
        
        for (let i = 0; i < blocksPerFrame && this.driveInfoPhase2ScanY < this.gridManager.getRowCount(); i++) {
            if (this.driveInfoPhase2ScanX < this.gridManager.getColumnCount()) {
                this.gridManager.getBlock(this.driveInfoPhase2ScanX, this.driveInfoPhase2ScanY).updateStateInDriveInfoPhase2();
                this.driveInfoPhase2ScanX++;
            }
            
            // Move to the next row when current row is complete
            if (this.driveInfoPhase2ScanX >= this.gridManager.getColumnCount()) {
                this.driveInfoPhase2ScanX = 0;
                this.driveInfoPhase2ScanY++;
            }
        }
        
        // If all rows have been scanned
        if (this.driveInfoPhase2ScanY >= this.gridManager.getRowCount()) {
            this.driveInfoPhase2ScanCompleted = true;
        }
    }
    
    updateBlocksInDefragmenting() {
        const rows = this.gridManager.getRowCount();
        const cols = this.gridManager.getColumnCount();

        // Update all blocks, remembering which ones finished moving
        // (collecting positions in temporary arrays every frame would
        // churn the garbage collector)
        let anyBlockCompleted = false;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const block = this.gridManager.getBlock(x, y);
                const wasMoving = block.isMoving;
                block.updateMoving();

                if (wasMoving && !block.isMoving) {
                    anyBlockCompleted = true;
                    if (x === block.targetX && y === block.targetY) {
                        block.state = BlockState.OPTIMIZED;
                    }
                }
            }
        }

        // When a move completes, the blocks that were being read become free
        if (anyBlockCompleted) {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const block = this.gridManager.getBlock(x, y);
                    if (block.state === BlockState.READING) {
                        block.state = BlockState.FREE;
                        block.fileID = -1;
                    }
                }
            }

            // The number of unoptimized blocks has changed
            this.unoptimizedBlocksCache = -1;
        }
    }

    // Update defrag step
    incrementDefragStep() {
        this.defragStep++;
    }
    
    // Get defrag step
    getDefragStep() {
        return this.defragStep;
    }
    
    // Count the number of unoptimized blocks
    countUnoptimizedBlocks() {
        let unoptimizedCount = 0;
        
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                switch (block.state) {
                    // Don't count optimized or free space blocks
                    case BlockState.FREE:
                    case BlockState.FIXED:
                    case BlockState.OPTIMIZED:
                    case BlockState.READING:
                        break;
                    
                    // Count other blocks (unoptimized)
                    default:
                        unoptimizedCount++;
                        break;
                }
            }
        }
        
        return unoptimizedCount;
    }
    
    // Count the total number of blocks (excluding free space and invisible free)
    countTotalBlocks() {
        let totalBlocks = 0;
        
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                // Don't count free space blocks (both visible and invisible)
                if (block.state !== BlockState.FREE && block.state !== BlockState.INVISIBLE_FREE) {
                    totalBlocks++;
                }
            }
        }
        
        return totalBlocks;
    }
    
    // Calculate defragmentation progress in defragmenting (percentage)
    calculateDefragmentingCompletionPercentage() {
        if (this.totalBlocksCache < 0) {
            this.totalBlocksCache = this.countTotalBlocks();
        }
        const totalBlocks = this.totalBlocksCache;

        if (totalBlocks <= 0) {
            return 0; // If total blocks is 0, return 0% instead of 100%
        }

        // Counting unoptimized blocks costs a full grid scan, so reuse the
        // cached count: recount periodically, right after a move completes
        // (the cache is invalidated in updateBlocksInDefragmenting), and on
        // every frame near completion so the finish is detected promptly
        this.percentageFrameCounter++;
        if (this.unoptimizedBlocksCache < 0 ||
            this.percentageFrameCounter >= 15 ||
            this.unoptimizedBlocksCache <= 20) {
            this.unoptimizedBlocksCache = this.countUnoptimizedBlocks();
            this.percentageFrameCounter = 0;
        }

        const optimizedBlocks = totalBlocks - this.unoptimizedBlocksCache;
        return Math.floor((optimizedBlocks * 100) / totalBlocks);
    }

    // Calculate progress in reading drive information reading phase 1 (percentage)
    calculateDriveInfoPhase1CompletionPercentage() {
        const totalCells = this.gridManager.getRowCount() * this.gridManager.getColumnCount();
        const scannedCells = this.driveInfoPhase1ScanY * this.gridManager.getColumnCount() + this.driveInfoPhase1ScanX;
        
        if (totalCells > 0) {
            return Math.floor((scannedCells * 100) / totalCells);
        } else {
            return 100; // If total cells is 0, consider it 100% complete
        }
    }
    
    // Calculate progress in reading drive information reading phase 2 (percentage)
    calculateDriveInfoPhase2CompletionPercentage() {
        const totalCells = this.gridManager.getRowCount() * this.gridManager.getColumnCount();
        const scannedCells = this.driveInfoPhase2ScanY * this.gridManager.getColumnCount() + this.driveInfoPhase2ScanX;
        
        if (totalCells > 0) {
            return Math.floor((scannedCells * 100) / totalCells);
        } else {
            return 100; // If total cells is 0, consider it 100% complete
        }
    }
    
    // Calculate total progress in reading drive information reading phases 1 and 2 (percentage)
    calculateDriveInfoPhasesCompletionPercentage() {
        // Calculate progress with phase 1 and phase 2 each accounting for 50%
        if (this.driveInfoPhase1ScanCompleted) {
            // If phase 1 is complete, calculate phase 2 progress as 50-100%
            return 50 + Math.floor(this.calculateDriveInfoPhase2CompletionPercentage() / 2);
        } else {
            // If phase 1 is not complete, calculate phase 1 progress as 0-50%
            return Math.floor(this.calculateDriveInfoPhase1CompletionPercentage() / 2);
        }
    }
    
    // Get whether reading drive information phase 1 scan is complete
    isDriveInfoPhase1ScanCompleted() {
        return this.driveInfoPhase1ScanCompleted;
    }
    
    // Get whether reading drive information phase 2 scan is complete
    isDriveInfoPhase2ScanCompleted() {
        return this.driveInfoPhase2ScanCompleted;
    }
    
    // Get current phase 1 scan position
    getDriveInfoPhase1ScanX() {
        return this.driveInfoPhase1ScanX;
    }
    
    getDriveInfoPhase1ScanY() {
        return this.driveInfoPhase1ScanY;
    }
    
    // Get current phase 2 scan position
    getDriveInfoPhase2ScanX() {
        return this.driveInfoPhase2ScanX;
    }
    
    getDriveInfoPhase2ScanY() {
        return this.driveInfoPhase2ScanY;
    }
}
