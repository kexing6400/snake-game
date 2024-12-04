export class Controller {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchStartY = null;
        this.minSwipeDistance = 30; // 最小滑动距离
        
        // 绑定键盘事件
        this.bindKeyboardEvents();
        // 绑定触摸事件
        this.bindTouchEvents();
        // 禁用默认的触摸行为
        this.disableDefaultTouchBehavior();
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.game.setDirection('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.game.setDirection('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.game.setDirection('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.game.setDirection('RIGHT');
                    break;
            }
        });
    }

    bindTouchEvents() {
        document.addEventListener('touchstart', (event) => {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = event.touches[0].clientX;
            const touchEndY = event.touches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // 只有当滑动距离超过最小值时才改变方向
            if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
                // 判断是水平滑动还是垂直滑动
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平滑动
                    if (deltaX > 0) {
                        this.game.setDirection('RIGHT');
                    } else {
                        this.game.setDirection('LEFT');
                    }
                } else {
                    // 垂直滑动
                    if (deltaY > 0) {
                        this.game.setDirection('DOWN');
                    } else {
                        this.game.setDirection('UP');
                    }
                }
                
                // 更新起始点，使得用户可以连续滑动
                this.touchStartX = touchEndX;
                this.touchStartY = touchEndY;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: true });
    }

    disableDefaultTouchBehavior() {
        document.addEventListener('touchmove', (event) => {
            // 防止页面滚动
            if (event.target.closest('.game-canvas')) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    destroy() {
        // 清理事件监听器
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
} 