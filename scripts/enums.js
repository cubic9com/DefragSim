/**
 * @file enums.js
 * @brief Enumeration definitions for disk defragmentation simulation
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file contains enumeration types used throughout the disk defragmentation
 * animation, including animation states and block states.
 */

// Animation states
const AnimationState = {
    READING_DRIVE_INFO_PHASE1: 'READING_DRIVE_INFO_PHASE1',  // Reading drive information (Phase 1)
    READING_DRIVE_INFO_PHASE2: 'READING_DRIVE_INFO_PHASE2',  // Reading drive information (Phase 2: Identifying fixed data)
    DEFRAGMENTING: 'DEFRAGMENTING',                          // Defragmenting
    COMPLETED: 'COMPLETED',                                  // Completed
    TOUCHED: 'TOUCHED'                                       // When screen is touched
};

// Block states
const BlockState = {
    INVISIBLE_FREE: 'INVISIBLE_FREE',                               // Invisible free space
    INVISIBLE_UNOPT_BEGIN: 'INVISIBLE_UNOPT_BEGIN',                 // Invisible unoptimized data (beginning of drive)
    INVISIBLE_UNOPT_MIDDLE: 'INVISIBLE_UNOPT_MIDDLE',               // Invisible unoptimized data (middle of drive)
    INVISIBLE_UNOPT_END: 'INVISIBLE_UNOPT_END',                     // Invisible unoptimized data (end of drive)
    INVISIBLE_OPTIMIZED: 'INVISIBLE_OPTIMIZED',                     // Invisible optimized data
    INVISIBLE_FIXED_AS_UNOPT_BEGIN: 'INVISIBLE_FIXED_AS_UNOPT_BEGIN',   // Invisible fixed data (beginning of drive)
    INVISIBLE_FIXED_AS_UNOPT_MIDDLE: 'INVISIBLE_FIXED_AS_UNOPT_MIDDLE', // Invisible fixed data (middle of drive)
    INVISIBLE_FIXED_AS_UNOPT_END: 'INVISIBLE_FIXED_AS_UNOPT_END',       // Invisible fixed data (end of drive)
    FIXED_AS_UNOPT_BEGIN: 'FIXED_AS_UNOPT_BEGIN',               // Fixed data (beginning of drive)
    FIXED_AS_UNOPT_MIDDLE: 'FIXED_AS_UNOPT_MIDDLE',             // Fixed data (middle of drive)
    FIXED_AS_UNOPT_END: 'FIXED_AS_UNOPT_END',                   // Fixed data (end of drive)
    FREE: 'FREE',                                               // Free space
    UNOPT_BEGIN: 'UNOPT_BEGIN',                                 // Unoptimized data (beginning of drive)
    UNOPT_MIDDLE: 'UNOPT_MIDDLE',                               // Unoptimized data (middle of drive)
    UNOPT_END: 'UNOPT_END',                                     // Unoptimized data (end of drive)
    OPTIMIZED: 'OPTIMIZED',                                     // Optimized data
    FIXED: 'FIXED',                                             // Fixed data
    READING: 'READING',                                         // Data that's currently being read
    WRITING: 'WRITING',                                         // Data that's currently being written
    BAD: 'BAD'                                                  // Bad area
};
