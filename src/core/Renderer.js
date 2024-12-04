export class Renderer {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            gridSize: 15,
            cellSize: 30,
            backgroundColor: '#FFF0F5', // 浅粉色背景
            gridColor: '#FFB6C6',       // 浅粉色网格线
            snakeHeadColor: '#FF69B4',  // 粉红色蛇头
            snakeBodyColor: '#FFB6C6',  // 浅粉色蛇身
            foodColor: '#FF1493',       // 深粉色食物
            ...config
        };
        
        this.setupCanvas();
        this.loadAssets();
    }

    setupCanvas() {
        const size = this.config.gridSize * this.config.cellSize;
        this.canvas.width = size;
        this.canvas.height = size;
        
        // 设置画布样式
        this.canvas.style.border = '2px solid #FF69B4';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.boxShadow = '0 0 10px rgba(255, 105, 180, 0.3)';
    }

    async loadAssets() {
        this.assets = {
            heart: await this.loadImage('heart.png'),
            food: await this.loadImage('food.png'),
            specialFood: {
                m: await this.loadImage('special-m.png'),
                e: await this.loadImage('special-e.png'),
                i: await this.loadImage('special-i.png'),
                y: await this.loadImage('special-y.png'),
                u: await this.loadImage('special-u.png'),
                n: await this.loadImage('special-n.png')
            }
        };
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = `assets/${src}`;
        });
    }

    render(gameState) {
        this.clear();
        this.drawBackground();
        this.drawGrid();
        this.drawFood(gameState.food);
        this.drawSnake(gameState.snake);
        this.drawEffects(gameState.specialEffects);
    }

    clear() {
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#FFF0F5');
        gradient.addColorStop(1, '#FFE4E1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // 绘制背景文字
        this.ctx.save();
        
        // 设置文字样式
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.3)'; // 使用半透明的粉色
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 计算画布中心
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 绘制文字
        this.ctx.fillText('我爱梅芸', centerX, centerY);
        
        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 0.5;

        // 绘制垂直线
        for (let x = 0; x <= this.config.gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.config.cellSize, 0);
            this.ctx.lineTo(x * this.config.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= this.config.gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.config.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.config.cellSize);
            this.ctx.stroke();
        }
    }

    drawSnake(snake) {
        snake.forEach((segment, index) => {
            const x = segment.x * this.config.cellSize;
            const y = segment.y * this.config.cellSize;
            const size = this.config.cellSize;
            
            if (index === 0) {
                // 绘制圆形蛇头
                const radius = size * 0.4;
                this.ctx.beginPath();
                this.ctx.fillStyle = this.config.snakeHeadColor;
                this.ctx.arc(
                    x + size/2,
                    y + size/2,
                    radius,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            } else {
                // 绘制爱心形状的蛇身
                this.ctx.fillStyle = this.config.snakeBodyColor;
                this.drawHeart(x + size/2, y + size/2, size * 0.32);
                
                // 增大文字大小
                this.ctx.save();
                this.ctx.font = `bold ${size * 0.35}px Arial`; // 增大字体
                this.ctx.fillStyle = '#FF1493'; // 深粉色文字
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                const text = index % 2 === 1 ? '梅' : '芸';
                this.ctx.fillText(text, x + size/2, y + size/2);
                this.ctx.restore();
            }
        });
    }

    drawHeart(x, y, size) {
        this.ctx.save();
        this.ctx.beginPath();
        
        // 修改爱心形状参数使其更饱满
        const topOffset = size * 0.3; // 调整爱心顶部位置
        
        // 移动到爱心顶部中心点
        this.ctx.moveTo(x, y + topOffset);
        
        // 绘制左半边爱心，调整控制点使形状更明显
        this.ctx.bezierCurveTo(
            x - size, y + topOffset,    // 控制点1
            x - size, y - size * 0.7,   // 控制点2
            x, y - size * 0.5           // 终点
        );
        
        // 绘制右半边爱心
        this.ctx.bezierCurveTo(
            x + size, y - size * 0.7,   // 控制点1
            x + size, y + topOffset,    // 控制点2
            x, y + topOffset            // 终点
        );
        
        this.ctx.fill();
        this.ctx.restore();
    }

    drawFood(food) {
        if (!food) return;
        
        const x = food.x * this.config.cellSize;
        const y = food.y * this.config.cellSize;
        
        if (food.type === 'special') {
            this.drawSpecialFood(x, y, food.value);
        } else {
            this.drawNormalFood(x, y);
        }
    }

    drawNormalFood(x, y) {
        const size = this.config.cellSize;
        
        // 添加跳动动画效果
        const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
        
        this.ctx.save();
        this.ctx.translate(x + size/2, y + size/2);
        this.ctx.scale(scale, scale);
        
        // 绘制食物爱心，稍微增大尺寸
        this.ctx.fillStyle = this.config.foodColor;
        this.drawHeart(0, 0, size * 0.35); // 增大食物爱心
        
        // 添加更明显的光晕效果
        this.ctx.globalAlpha = 0.4; // 增加透明度使光晕更明显
        this.ctx.fillStyle = '#FF69B4';
        this.drawHeart(0, 0, size * 0.4);
        
        // 添加内部小爱心装饰
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillStyle = '#FFF';
        this.drawHeart(0, -size * 0.1, size * 0.15); // 在上方添加小爱心装饰
        
        this.ctx.restore();
    }

    drawSpecialFood(x, y, value) {
        const size = this.config.cellSize;
        const colors = {
            m: '#FF1493', // 玫瑰红
            e: '#FFB6C6', // 粉红色
            i: '#DA70D6', // 紫色
            y: '#FFD700', // 黄色
            u: '#1E90FF', // 蓝色
            n: '#90EE90'  // 绿色
        };
        
        // 绘制特殊食物背景光环
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(
            x + size/2, y + size/2, 0,
            x + size/2, y + size/2, size
        );
        gradient.addColorStop(0, colors[value]);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 绘制字母
        this.ctx.font = `bold ${size * 0.8}px Arial`;
        this.ctx.fillStyle = colors[value];
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(value, x + size/2, y + size/2);
        this.ctx.restore();
    }

    drawEffects(effects) {
        effects.forEach((effect, type) => {
            switch(type) {
                case 'speed':
                    this.drawSpeedEffect();
                    break;
                case 'rainbow':
                    this.drawRainbowEffect();
                    break;
                // 添加更多特效...
            }
        });
    }

    drawSpeedEffect() {
        // 绘制速度特效（例如运动轨迹）
        this.ctx.save();
        // 实现速度特效的具体绘制逻辑
        this.ctx.restore();
    }

    drawRainbowEffect() {
        // 绘制彩虹特效
        this.ctx.save();
        // 实现彩虹特效的具体绘制逻辑
        this.ctx.restore();
    }

    // 动画效果
    animate(callback) {
        let lastTime = 0;
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            callback(deltaTime);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
} 