export class Game {
    constructor(config = {}) {
        this.config = {
            gridSize: 15,
            initialSpeed: 300,
            minSpeed: 300,
            ...config
        };
        
        this.state = {
            snake: [],
            food: null,
            direction: 'RIGHT',
            score: 0,
            isGameOver: false,
            isPaused: false,
            specialEffects: new Map(),
            currentSpeed: this.config.initialSpeed
        };
        
        this.init();
    }

    init() {
        // 初始化蛇的位置（默认长度为3）
        const centerX = Math.floor(this.config.gridSize / 2);
        const centerY = Math.floor(this.config.gridSize / 2);
        
        this.state.snake = [
            { x: centerX, y: centerY },       // 头部
            { x: centerX - 1, y: centerY },   // 身体
            { x: centerX - 2, y: centerY }    // 尾部
        ];
        
        this.generateFood();
    }

    generateFood() {
        const availablePositions = [];
        
        // 找出所有空闲位置
        for (let x = 0; x < this.config.gridSize; x++) {
            for (let y = 0; y < this.config.gridSize; y++) {
                if (!this.state.snake.some(segment => segment.x === x && segment.y === y)) {
                    availablePositions.push({ x, y });
                }
            }
        }
        
        // 随机选择一个位置放置食物
        if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            this.state.food = availablePositions[randomIndex];
        }
    }

    move() {
        if (this.state.isGameOver || this.state.isPaused) return;

        const head = { ...this.state.snake[0] };
        
        // 根据当前方向移动蛇头
        switch (this.state.direction) {
            case 'UP':
                head.y = (head.y - 1 + this.config.gridSize) % this.config.gridSize;
                break;
            case 'DOWN':
                head.y = (head.y + 1) % this.config.gridSize;
                break;
            case 'LEFT':
                head.x = (head.x - 1 + this.config.gridSize) % this.config.gridSize;
                break;
            case 'RIGHT':
                head.x = (head.x + 1) % this.config.gridSize;
                break;
        }

        // 检查是否吃到食物
        const ateFood = head.x === this.state.food.x && head.y === this.state.food.y;
        
        // 更新蛇的位置
        this.state.snake.unshift(head);
        if (!ateFood) {
            this.state.snake.pop();
        } else {
            this.state.score += 1;
            this.generateFood();
        }

        // 检查是否撞到自己
        this.checkCollision();
    }

    checkCollision() {
        const head = this.state.snake[0];
        // 检查是否撞到自己（从第四个身体节点开始检查，因为不可能撞到紧邻的前三个节点）
        for (let i = 4; i < this.state.snake.length; i++) {
            if (this.state.snake[i].x === head.x && this.state.snake[i].y === head.y) {
                this.state.isGameOver = true;
                return;
            }
        }
    }

    setDirection(newDirection) {
        const oppositeDirections = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        
        // 防止直接反向移动
        if (oppositeDirections[newDirection] !== this.state.direction) {
            this.state.direction = newDirection;
        }
    }

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
    }

    reset() {
        this.state.snake = [];
        this.state.score = 0;
        this.state.isGameOver = false;
        this.state.isPaused = false;
        this.state.direction = 'RIGHT';
        this.state.specialEffects.clear();
        this.init();
    }

    getState() {
        return { ...this.state };
    }
} 