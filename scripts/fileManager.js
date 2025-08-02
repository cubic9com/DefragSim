/**
 * @file fileManager.js
 * @brief File management for disk defragmentation simulation
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the FileManager class which handles file identification,
 * grouping, and movement operations during the defragmentation process.
 */

class FileManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.nextFileID = 0;
        this.currentFileToMove = -1;
        this.isMovingFile = false;
        
        this.assignFileIDs();
    }
    
    // Reset
    reset() {
        this.nextFileID = 0;
        this.currentFileToMove = -1;
        this.isMovingFile = false;
        this.assignFileIDs();
    }
    
    // Assign file IDs
    assignFileIDs() {
        // Use GridManager's random number generator
        const rng = this.gridManager.getRNG();
        
        // Previous block's file ID (initial value is -1)
        let previousFileID = -1;
        
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                
                // If previous block is valid, use the same file ID as the previous block with 50% probability
                if (previousFileID >= 0 && rng() < 0.5) {
                    block.fileID = previousFileID;
                } else {
                    // Generate a new random file ID (0-400)
                    block.fileID = Math.floor(rng() * 401);
                }
                
                // Save current file ID for the next block
                previousFileID = block.fileID;
            }
        }
    }
    
    // Find file to move
    findNextFileToMove() {
        let fileToMove = -1;
        let fileType = BlockState.FREE;
        let fileBlocks = []; // Coordinates of blocks belonging to the file
        
        // Find unoptimized files
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                if ((block.state === BlockState.UNOPT_BEGIN || 
                     block.state === BlockState.UNOPT_MIDDLE || 
                     block.state === BlockState.UNOPT_END) && 
                    block.fileID >= 0 && 
                    !block.isMoving) {
                    
                    // Found a new file
                    fileToMove = block.fileID;
                    fileType = block.state;
                    
                    // Collect all blocks belonging to this file
                    fileBlocks = this.collectFileBlocks(fileToMove);
                    break;
                }
            }
            if (fileToMove >= 0) break;
        }
        
        return { fileToMove, fileType, fileBlocks };
    }
    
    // Collect blocks belonging to a file
    collectFileBlocks(fileID) {
        const fileBlocks = [];
        
        for (let y = 0; y < this.gridManager.getRowCount(); y++) {
            for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                const block = this.gridManager.getBlock(x, y);
                if (block.fileID === fileID && 
                    (block.state === BlockState.UNOPT_BEGIN || 
                     block.state === BlockState.UNOPT_MIDDLE || 
                     block.state === BlockState.UNOPT_END)) {
                    fileBlocks.push({ x, y });
                }
            }
        }
        
        return fileBlocks;
    }
    
    // Find target positions for a file
    findTargetPositionsForFile(fileBlocks) {
        const targetPositions = [];
        let foundTarget = false;
        
        // Search from top-left (in order from the beginning) - horizontal priority
        for (let y = 0; y < this.gridManager.getRowCount() && !foundTarget; y++) {
            for (let x = 0; x < this.gridManager.getColumnCount() && !foundTarget; x++) {
                // Check if there are consecutive fileBlocks.length free spaces from this position
                let validTarget = true;
                const currentTargetPositions = [];
                
                // Look for consecutive free spaces horizontally
                for (let i = 0; i < fileBlocks.length; i++) {
                    let checkX = x + i;
                    let checkY = y;
                    
                    // If the end of the row is reached, move to the next row
                    if (checkX >= this.gridManager.getColumnCount()) {
                        checkX = checkX - this.gridManager.getColumnCount();
                        checkY++;
                    }
                    
                    // Check if outside grid range
                    if (checkY >= this.gridManager.getRowCount()) {
                        validTarget = false;
                        break;
                    }
                    
                    // Check if it's free space - strictly target only free spaces
                    if (this.gridManager.getBlock(checkX, checkY).state !== BlockState.FREE) {
                        validTarget = false;
                        break;
                    }
                    
                    // Add this position to target candidates
                    currentTargetPositions.push({ x: checkX, y: checkY });
                }
                
                if (validTarget && currentTargetPositions.length === fileBlocks.length) {
                    targetPositions.push(...currentTargetPositions);
                    foundTarget = true;
                    break; // Use the first valid target found
                }
            }
        }
        
        return { foundTarget, targetPositions };
    }
    
    // Move file to target
    moveFileToTarget(fileBlocks, targetPositions, fileID) {
        // Move each block in the file
        for (let i = 0; i < fileBlocks.length; i++) {
            const sourceX = fileBlocks[i].x;
            const sourceY = fileBlocks[i].y;
            const targetX = targetPositions[i].x;
            const targetY = targetPositions[i].y;
            
            // Change the state of the source block to reading
            const sourceBlock = this.gridManager.getBlock(sourceX, sourceY);
            const originalState = sourceBlock.state;
            sourceBlock.state = BlockState.READING;
            
            // Set the target block
            const targetBlock = this.gridManager.getBlock(targetX, targetY);
            
            // Set the target block to writing state
            targetBlock.state = BlockState.WRITING;
            targetBlock.fileID = sourceBlock.fileID;
            
            // Start movement animation (from source to target)
            targetBlock.startMoving(targetX, targetY);
            // Set animation start position to source
            targetBlock.animX = sourceX;
            targetBlock.animY = sourceY;
        }
        
        // Set file moving flag
        this.isMovingFile = true;
        this.currentFileToMove = fileID;
    }
    
    // Update file movement
    updateFileMovement() {
        if (this.isMovingFile) {
            let allMoved = true;
            for (let y = 0; y < this.gridManager.getRowCount(); y++) {
                for (let x = 0; x < this.gridManager.getColumnCount(); x++) {
                    const block = this.gridManager.getBlock(x, y);
                    if (block.fileID === this.currentFileToMove && block.isMoving) {
                        allMoved = false;
                        break;
                    }
                }
                if (!allMoved) break;
            }
            
            if (allMoved) {
                this.isMovingFile = false;
                this.currentFileToMove = -1;
            }
        }
    }
    
    // Move next file
    moveNextFile() {
        // Find unoptimized files
        const { fileToMove, fileType, fileBlocks } = this.findNextFileToMove();
        
        if (fileToMove < 0 || fileBlocks.length === 0) {
            // If there are no unoptimized files, complete
            return;
        }
        
        // Determine the target
        const { foundTarget, targetPositions } = this.findTargetPositionsForFile(fileBlocks);
        
        // If a target is found, execute the move process
        if (foundTarget && targetPositions.length > 0) {      
            this.moveFileToTarget(fileBlocks, targetPositions, fileToMove);
        } else {
            // If no target is found, this file will not be moved
            // Change blocks in the file to optimized (blue)
            for (const pos of fileBlocks) {
                this.gridManager.getBlock(pos.x, pos.y).state = BlockState.OPTIMIZED;
            }
        }
    }
    
    // Get whether moving
    isMoving() {
        return this.isMovingFile;
    }
    
    // Get currently moving file ID
    getCurrentFileToMove() {
        return this.currentFileToMove;
    }
    
    // Get next file ID
    getNextFileID() {
        return this.nextFileID;
    }
}
