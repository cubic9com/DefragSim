/**
 * @file gridManager.js
 * @brief Grid management for disk defragmentation visualization
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the GridManager class which manages the grid of blocks
 * representing disk sectors in the defragmentation simulation.
 */

class GridManager {
    constructor() {
        this.grid = [];
        this.rng = null;
        
        this.initializeRNG();
        this.initializeGrid();
        this.initializeRandomGrid();
    }
    
    // Initialize random number generator
    initializeRNG() {
        // Use a different seed each time
        const seedValue = seed();
        this.rng = new Math.seedrandom(seedValue);
    }
    
    // Initialize grid
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < Config.getGridRows(); y++) {
            this.grid[y] = [];
            for (let x = 0; x < Config.getGridCols(); x++) {
                this.grid[y][x] = new Block(x, y);
            }
        }
    }
    
    // Get drive region type
    getDriveRegionState(y) {
        // Beginning part of the drive (top 25%)
        if (y < Config.getGridRows() * 0.25) {
            return BlockState.INVISIBLE_UNOPT_BEGIN;
        }
        // Middle part of the drive (25% to 50%)
        else if (y < Config.getGridRows() * 0.5) {
            return BlockState.INVISIBLE_UNOPT_MIDDLE;
        }
        // First half of the end part of the drive (50% to 70%)
        else if (y < Config.getGridRows() * 0.7) {
            return BlockState.INVISIBLE_UNOPT_END;
        }
        // Second half of the end part of the drive (bottom 30%)
        else {
            return BlockState.INVISIBLE_FREE;
        }
    }
    
    // Randomly set initial block states
    initializeRandomGrid() {
        // Place different types of blocks according to drive position
        for (let y = 0; y < Config.getGridRows(); y++) {
            const regionState = this.getDriveRegionState(y);
            
            for (let x = 0; x < Config.getGridCols(); x++) {
                const r = Math.floor(this.rng() * 101); // 0-100
                
                // The second half of the end part is all free space
                if (regionState === BlockState.INVISIBLE_FREE) {
                    this.grid[y][x].state = BlockState.INVISIBLE_FREE;
                } else {
                    this.setInitialBlockState(x, y, r, regionState);
                }
            }
        }
    }
    
    // Set initial block state
    setInitialBlockState(x, y, randomValue, primaryState) {
        if (randomValue < 60) { // 60% probability for primaryState
            this.grid[y][x].state = primaryState;
        } else if (randomValue < 80) { // 20% probability for optimized
            this.grid[y][x].state = BlockState.INVISIBLE_OPTIMIZED;
        } else if (randomValue < 85) { // 5% probability for fixed data
            // Set fixed data state corresponding to primaryState
            switch (primaryState) {
                case BlockState.INVISIBLE_UNOPT_BEGIN:
                    this.grid[y][x].state = BlockState.INVISIBLE_FIXED_AS_UNOPT_BEGIN;
                    break;
                case BlockState.INVISIBLE_UNOPT_MIDDLE:
                    this.grid[y][x].state = BlockState.INVISIBLE_FIXED_AS_UNOPT_MIDDLE;
                    break;
                case BlockState.INVISIBLE_UNOPT_END:
                    this.grid[y][x].state = BlockState.INVISIBLE_FIXED_AS_UNOPT_END;
                    break;
                default:
                    this.grid[y][x].state = BlockState.INVISIBLE_FREE;
                    break;
            }
        } else { // 15% probability for free space
            this.grid[y][x].state = BlockState.INVISIBLE_FREE;
        }
    }
    
    // Access to grid
    getBlock(x, y) {
        return this.grid[y][x];
    }
    
    // Get row and column count of grid
    getRowCount() {
        return this.grid.length;
    }
    
    getColumnCount() {
        return this.grid.length === 0 ? 0 : this.grid[0].length;
    }
    
    // Get grid row
    getRow(y) {
        return this.grid[y];
    }
    
    // Access to random number generator
    getRNG() {
        return this.rng;
    }
}

// Simple seedable random number generator implementation
// This is a simplified version for compatibility
Math.seedrandom = function(seed) {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    
    return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
};
