/**
 * @file block.js
 * @brief Block representation for disk defragmentation visualization
 * @author cubic9com
 * @date 2025
 * @copyright Copyright (c) 2025 cubic9com All rights reserved.
 * 
 * This file implements the Block class which represents individual blocks
 * in the disk defragmentation animation, including their states, positions,
 * animations, and rendering logic.
 */

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.animX = x;
        this.animY = y;
        this.state = BlockState.FREE;
        this.isMoving = false;
        this.fileID = -1;
        this.isExploding = false;
        this.explodeVelocityX = 0.0;
        this.explodeVelocityY = 0.0;
    }
    
    // Get the color based on the block's state
    getColor() {
        switch (this.state) {
            case BlockState.FIXED:
                return Colors.Block.FIXED_BACK;
            case BlockState.UNOPT_BEGIN:
            case BlockState.FIXED_AS_UNOPT_BEGIN:
                return Colors.Block.UNOPT_BEGIN;
            case BlockState.UNOPT_MIDDLE:
            case BlockState.FIXED_AS_UNOPT_MIDDLE:
                return Colors.Block.UNOPT_MIDDLE;
            case BlockState.UNOPT_END:
            case BlockState.FIXED_AS_UNOPT_END:
                return Colors.Block.UNOPT_END;
            case BlockState.OPTIMIZED:
                return Colors.Block.OPTIMIZED;
            case BlockState.READING:
                return Colors.Block.READING;
            case BlockState.WRITING:
                return Colors.Block.WRITING;
            case BlockState.BAD:
                return Colors.Block.BAD_BACK;
            default:
                return Colors.Block.FREE;
        }
    }
    
    // Draw the block
    draw(ctx, animState, screenX, screenY, bw, bh) {
        // 引数で座標が渡されない場合（後方互換フォールバック）
        if (screenX === undefined) {
            const useX = (this.isMoving || this.isExploding) ? this.animX : this.x;
            const useY = (this.isMoving || this.isExploding) ? this.animY : this.y;
            bw = Config.getBlockWidth();
            bh = Config.getBlockHeight();
            screenX = Config.getGridOffsetX() + useX * (bw + 3);
            screenY = Config.getGridOffsetY() + useY * (bh + 3);
        } else if (this.isMoving || this.isExploding) {
            // アニメーション中はグリッド座標ではなく animX/Y を使って画面座標を再計算
            // bw+3 / bh+3 は uiRenderer から渡された値を流用する（Config 呼び出し不要）
            // gridOffsetX/Y は引数として渡されていないため、事前に渡されたスクリーン座標から
            // 逆算するのではなく、gridOffsetX = screenX - this.x*(bw+3) で求める
            const gridOffsetX = screenX - this.x * (bw + 3);
            const gridOffsetY = screenY - this.y * (bh + 3);
            screenX = gridOffsetX + this.animX * (bw + 3);
            screenY = gridOffsetY + this.animY * (bh + 3);
        }
        
        switch (this.state) {
            // Blocks that are not drawn
            case BlockState.INVISIBLE_FREE:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_BEGIN:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_MIDDLE:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_END:
            case BlockState.INVISIBLE_UNOPT_BEGIN:
            case BlockState.INVISIBLE_UNOPT_MIDDLE:
            case BlockState.INVISIBLE_UNOPT_END:
            case BlockState.INVISIBLE_OPTIMIZED:
            case BlockState.FREE:
                break;
                
            // Special drawing for immovable data blocks
            case BlockState.FIXED:
                {
                    const color = this.getColor();
                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, bw, bh);
                    ctx.strokeStyle = Colors.Block.FRAME;
                    ctx.strokeRect(screenX, screenY, bw, bh);
                    
                    // Special drawing for immovable data (red square in the upper right)
                    const halfW = Math.floor(bw / 2);
                    const halfH = Math.floor(bh / 2);
                    ctx.fillStyle = Colors.Block.FIXED_FORE;
                    ctx.fillRect(screenX + halfW + 1, screenY, halfW, halfH - 2);
                    ctx.strokeStyle = Colors.Block.FRAME;
                    ctx.strokeRect(screenX + halfW + 1, screenY, halfW, halfH - 2);
                }
                break;
                
            // Special drawing for bad blocks
            case BlockState.BAD:
                {
                    const color = this.getColor();
                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, bw, bh);
                    ctx.strokeStyle = Colors.Block.FRAME;
                    ctx.strokeRect(screenX, screenY, bw, bh);
                    
                    // Special drawing for bad blocks (diagonal line)
                    ctx.strokeStyle = Colors.Block.BAD_FORE;
                    ctx.beginPath();
                    ctx.moveTo(screenX + 1, screenY + 1);
                    ctx.lineTo(screenX + bw - 2, screenY + bh - 2);
                    ctx.stroke();
                }
                break;
                
            // Other blocks to display
            default:
                {
                    const color = this.getColor();
                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, bw, bh);
                    ctx.strokeStyle = Colors.Block.FRAME;
                    ctx.strokeRect(screenX, screenY, bw, bh);
                }
                break;
        }
    }
    
    // Update the block's state in reading drive info phase 1
    updateStateInDriveInfoPhase1() {
        switch (this.state) {
            case BlockState.INVISIBLE_FREE:
                this.state = BlockState.FREE;
                break;
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_BEGIN:
                this.state = BlockState.FIXED_AS_UNOPT_BEGIN;
                break;
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_MIDDLE:
                this.state = BlockState.FIXED_AS_UNOPT_MIDDLE;
                break;
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_END:
                this.state = BlockState.FIXED_AS_UNOPT_END;
                break;
            case BlockState.INVISIBLE_UNOPT_BEGIN:
                this.state = BlockState.UNOPT_BEGIN;
                break;
            case BlockState.INVISIBLE_UNOPT_MIDDLE:
                this.state = BlockState.UNOPT_MIDDLE;
                break;
            case BlockState.INVISIBLE_UNOPT_END:
                this.state = BlockState.UNOPT_END;
                break;
            case BlockState.INVISIBLE_OPTIMIZED:
                this.state = BlockState.OPTIMIZED;
                break;
            default:
                break;
        }
    }
    
    // Update the block's state in reading drive info phase 2
    updateStateInDriveInfoPhase2() {
        switch (this.state) {
            case BlockState.FIXED_AS_UNOPT_BEGIN:
            case BlockState.FIXED_AS_UNOPT_MIDDLE:
            case BlockState.FIXED_AS_UNOPT_END:
                this.state = BlockState.FIXED;
                break;
            default:
                break;
        }
    }
    
    // Start moving
    startMoving(newX, newY) {
        this.targetX = newX;
        this.targetY = newY;
        this.isMoving = true;
        // Set the position at the start of animation to the current position
        this.animX = this.x;
        this.animY = this.y;
    }
    
    // Update moving animation in defragmenting
    updateMoving() {
        if (this.isMoving) {
            // Gradually move towards the target position
            const dx = this.targetX - this.animX;
            const dy = this.targetY - this.animY;
            
            if (Math.abs(dx) < Config.Animation.POSITION_THRESHOLD && Math.abs(dy) < Config.Animation.POSITION_THRESHOLD) {
                // When close enough, align completely with the target position
                this.animX = this.targetX;
                this.animY = this.targetY;
                this.isMoving = false;
            } else {
                // Gradually approach the target position
                this.animX += dx * Config.Animation.MOVE_SPEED;
                this.animY += dy * Config.Animation.MOVE_SPEED;
            }
        }
    }
    
    // Start explosion (from touch coordinates)
    startExploding(touchX, touchY) {
        // Invisible or free areas do not explode
        switch (this.state) {
            case BlockState.FREE:
            case BlockState.INVISIBLE_FREE:
            case BlockState.INVISIBLE_UNOPT_BEGIN:
            case BlockState.INVISIBLE_UNOPT_MIDDLE:
            case BlockState.INVISIBLE_UNOPT_END:
            case BlockState.INVISIBLE_OPTIMIZED:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_BEGIN:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_MIDDLE:
            case BlockState.INVISIBLE_FIXED_AS_UNOPT_END:
                return;
            default:
                break;
        }
        
        this.isExploding = true;
        
        // Calculate the screen coordinates of the block
        const screenX = Config.getGridOffsetX() + this.x * (Config.getBlockWidth() + 3) + Math.floor(Config.getBlockWidth() / 2);
        const screenY = Config.getGridOffsetY() + this.y * (Config.getBlockHeight() + 3) + Math.floor(Config.getBlockHeight() / 2);
        
        // Calculate the direction vector from the touch coordinates (screen coordinate system)
        const dirX = screenX - touchX;
        const dirY = screenY - touchY;
        
        // Calculate distance (add a small value to prevent division by zero)
        const distance = Math.sqrt(dirX * dirX + dirY * dirY) + 0.1;
        
        // Normalize the direction vector and set the velocity
        // Adjust so that the closer to the center, the greater the velocity
        const speed = 1.0 + (1.0 / distance) * 30.0;
        this.explodeVelocityX = (dirX / distance) * speed;
        this.explodeVelocityY = (dirY / distance) * speed;
        
        // Change state to BAD
        this.state = BlockState.BAD;
    }
    
    // Update explosion animation
    updateExplosion() {
        if (!this.isExploding) {
            return;
        }
        
        // Apply gravity in the Y-axis direction (increase velocity)
        this.explodeVelocityY += Config.Animation.GRAVITY;
        
        // Update position
        this.animX += this.explodeVelocityX;
        this.animY += this.explodeVelocityY;
    }
    
    // Check if the block is outside the screen during explosion
    isOffScreen() {
        if (!this.isExploding) {
            return false;
        }
        
        // Calculate screen boundaries in grid coordinates
        const maxY = Config.getGridRows() + 5; // Add some buffer below the screen
        const minX = -5; // Add some buffer to the left
        const maxX = Config.getGridCols() + 5; // Add some buffer to the right
        
        // Check if the block is outside the screen boundaries
        return (this.animY > maxY || this.animX < minX || this.animX > maxX);
    }
}
