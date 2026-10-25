/**
 * @file uiRenderer.js
 * @brief User interface rendering for disk defragmentation visualization
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the UIRenderer class which handles all user interface
 * rendering including the window frame, progress bar, grid display, and
 * hit counter for the disk defragmentation animation.
 */

class UIRenderer {
    constructor() {
        this.state = AnimationState.READING_DRIVE_INFO_PHASE1;
        this.completionPercentage = 0;
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.hitCounter = 0;
        this.canvas = null;
        this.ctx = null;
    }
    
    // Initialization
    initialize() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to full screen
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;
        
        // Initialize hit counter
        this.hitCounter = 0;
    }
    
    // Draw UI elements
    drawUI() {
        const ctx = this.ctx;
        
        // Title bar
        ctx.fillStyle = Colors.UI.TITLE_BAR_BACK;
        ctx.fillRect(0, 0, this.screenWidth, Config.TITLE_BAR_HEIGHT);
        
        // Buttons in the title bar
        this.drawTitleBarButtons(ctx);
        
        // Title text
        ctx.fillStyle = Colors.UI.TITLE_BAR_TEXT;
        ctx.font = '12px monospace';
        ctx.fillText(getLocalizedText('Defragmenting Drive C', 'ドライブCをデフラグ中'), 5, 14);
        
        // Status area at the bottom
        const statusY = this.screenHeight - 50;  // 52 pixels from bottom for status text
        const progressBarY = this.screenHeight - 41;  // 43 pixels from bottom for progress bar
        const percentageY = this.screenHeight - 10;   // 10 pixels from bottom for percentage
        
        // Status message
        ctx.fillStyle = Colors.UI.BUTTON_TEXT;
        ctx.font = '12px monospace';
        
        let statusMessage = '';
        switch (this.state) {
            case AnimationState.READING_DRIVE_INFO_PHASE1:
            case AnimationState.READING_DRIVE_INFO_PHASE2:
                statusMessage = getLocalizedText('Reading drive information...', 'ドライブ情報を読み取り中...');
                break;
            case AnimationState.DEFRAGMENTING:
                statusMessage = getLocalizedText('Defragmenting file system...', 'ファイルシステムをデフラグ中...');
                break;
            case AnimationState.COMPLETED:
                statusMessage = getLocalizedText('Defragmentation completed.', 'デフラグが完了しました。');
                break;
            case AnimationState.TOUCHED:
                statusMessage = getLocalizedText('The drive was damaged!!!', 'ドライブが破損しました！！！');
                break;
        }
        
        ctx.fillText(statusMessage, 10, statusY);
        
        // Progress bar
        this.drawProgressBar(ctx, progressBarY);
        
        // Completion percentage
        ctx.fillStyle = Colors.UI.BUTTON_TEXT;
        ctx.font = '12px monospace';
        ctx.fillText(`${this.completionPercentage}% ${getLocalizedText('Complete', '完了')}`, 12, percentageY);
    }
    
    // Draw title bar buttons
    drawTitleBarButtons(ctx) {
        // Close button
        this.drawButton(ctx, this.screenWidth - 18, 3, 15, 14);
        // Draw × symbol
        ctx.strokeStyle = Colors.UI.BUTTON_TEXT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.screenWidth - 15, 7);
        ctx.lineTo(this.screenWidth - 7, 13);
        ctx.moveTo(this.screenWidth - 15, 13);
        ctx.lineTo(this.screenWidth - 7, 7);
        ctx.stroke();
        
        // Maximize button
        this.drawButton(ctx, this.screenWidth - 36, 3, 15, 14);
        // Draw □ symbol
        ctx.strokeStyle = Colors.UI.BUTTON_TEXT;
        ctx.strokeRect(this.screenWidth - 32, 7, 7, 6);
        
        // Minimize button
        this.drawButton(ctx, this.screenWidth - 54, 3, 15, 14);
        // Draw _ symbol
        ctx.strokeStyle = Colors.UI.BUTTON_TEXT;
        ctx.beginPath();
        ctx.moveTo(this.screenWidth - 50, 12);
        ctx.lineTo(this.screenWidth - 44, 12);
        ctx.stroke();
    }
    
    // Draw a 3D button
    drawButton(ctx, x, y, width, height) {
        // Button background
        ctx.fillStyle = Colors.UI.BUTTON_BACK;
        ctx.fillRect(x, y, width, height);
        
        // Button highlight (top and left)
        ctx.strokeStyle = Colors.UI.BUTTON_LIGHT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
        
        // Button shadow (bottom and right)
        ctx.strokeStyle = Colors.UI.BUTTON_SHADOW;
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.stroke();
    }
    
    // Draw progress bar
    drawProgressBar(ctx, progressBarY) {
        // Progress bar frame
        ctx.strokeStyle = Colors.UI.PROGRESS_FRAME;
        ctx.strokeRect(Config.getProgressBarOffsetX(), progressBarY, Config.getProgressBarWidth(), Config.getProgressBarHeight());
        
        // Calculate number of blocks based on percentage
        const progressBarInnerWidth = Config.getProgressBarWidth() - 4;  // -4 for padding (2 on each side)
        const maxBlocks = Math.floor((progressBarInnerWidth + Config.getProgressBarBlockSpacing() - Config.getProgressBarBlockWidth()) / Config.getProgressBarBlockSpacing());
        
        // Calculate how many blocks to show based on percentage
        const blocksToShow = Math.ceil((this.completionPercentage * maxBlocks) / 100);
        
        // Fill the progress bar (blue blocks)
        ctx.fillStyle = Colors.UI.PROGRESS_BLOCK;
        for (let i = 0; i < blocksToShow; i++) {
            const blockX = Config.getProgressBarOffsetX() + 2 + i * Config.getProgressBarBlockSpacing();  // +2 for padding
            ctx.fillRect(blockX, progressBarY + 2, Config.getProgressBarBlockWidth(), Config.getProgressBarBlockHeight());
        }
    }
    
    // Draw hit counter
    drawHitCounter() {
        const ctx = this.ctx;
        
        // Hit counter
        ctx.fillStyle = Colors.UI.HIT_COUNTER;
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        
        const centerX = this.screenWidth / 2;
        const centerY = this.screenHeight / 2;
        
        const hitText = this.hitCounter === 1 ? 
            `${this.hitCounter} Hit!` :
            `${this.hitCounter} Hits!`;
        
        ctx.fillText(hitText, centerX, centerY);
        
        if (this.hitCounter >= 10) {
            ctx.fillText('GREAT!', centerX, centerY + 30);
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }
    
    // Draw grid and UI elements
    draw(gridManager, animationManager) {
        const ctx = this.ctx;
        
        // Clear the canvas
        ctx.fillStyle = Colors.UI.WINDOW_BACK;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        
        const gridOffsetX = Config.getGridOffsetX();
        const gridOffsetY = Config.getGridOffsetY();
        const blockWidth = Config.getBlockWidth();
        const blockHeight = Config.getBlockHeight();
        const blockStepX = blockWidth + 3;
        const blockStepY = blockHeight + 3;
        const rows = gridManager.getRowCount();
        const cols = gridManager.getColumnCount();
        
        // Fill the grid area background with white
        const gridX = gridOffsetX - 3;
        const gridY = gridOffsetY - 3;
        const gridWidth = cols * blockStepX + 4;
        const gridHeight = rows * blockStepY + 4;
        
        ctx.fillStyle = Colors.UI.GRID_BACK;
        ctx.fillRect(gridX, gridY, gridWidth, gridHeight);
        
        // Grid area frame
        ctx.strokeStyle = Colors.UI.GRID_FRAME;
        ctx.strokeRect(gridX, gridY, gridWidth, gridHeight);
        
        // Draw UI elements
        this.drawUI();
        
        // Draw blocks
        const state = this.state;
        for (let y = 0; y < rows; y++) {
            const baseScreenY = gridOffsetY + y * blockStepY;
            for (let x = 0; x < cols; x++) {
                gridManager.getBlock(x, y).draw(ctx, state, gridOffsetX + x * blockStepX, baseScreenY, blockWidth, blockHeight);
            }
        }
        
        // Draw hit counter
        if (state === AnimationState.TOUCHED) {
            this.drawHitCounter();
        }
    }
    
    // Set state
    setState(newState) {
        this.state = newState;
    }
    
    // Get state
    getState() {
        return this.state;
    }
    
    // Set completion percentage
    setCompletionPercentage(percentage) {
        this.completionPercentage = percentage;
    }
    
    // Get completion percentage
    getCompletionPercentage() {
        return this.completionPercentage;
    }
    
    // Increment hit counter
    incrementHitCounter() {
        this.hitCounter++;
    }
    
    // Get hit counter
    getHitCounter() {
        return this.hitCounter;
    }

    // Set hit counter
    setHitCounter(counter) {
        this.hitCounter = counter;
    }
}
