export const GameStates = {
    INIT: 'INIT',
    READY: 'READY',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    ENDED: 'ENDED'
};

export class GameState {
    constructor() {
        this.currentState = GameStates.INIT;
        this.listeners = new Map();
        this.stateData = {
            score: 0,
            highScore: this.loadHighScore(),
            specialEffects: new Map(),
            combo: 0
        };
    }

    // 状态转换
    transition(newState) {
        const oldState = this.currentState;
        
        // 验证状态转换是否有效
        if (!this.isValidTransition(oldState, newState)) {
            console.warn(`Invalid state transition from ${oldState} to ${newState}`);
            return false;
        }

        this.currentState = newState;
        this.notifyListeners('stateChange', { oldState, newState });
        return true;
    }

    // 验证状态转换是否合法
    isValidTransition(fromState, toState) {
        const validTransitions = {
            [GameStates.INIT]: [GameStates.READY, GameStates.PLAYING],
            [GameStates.READY]: [GameStates.PLAYING],
            [GameStates.PLAYING]: [GameStates.PAUSED, GameStates.ENDED],
            [GameStates.PAUSED]: [GameStates.PLAYING, GameStates.ENDED],
            [GameStates.ENDED]: [GameStates.READY, GameStates.PLAYING]
        };

        return validTransitions[fromState]?.includes(toState) ?? false;
    }

    // 添加状态监听器
    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    // 移除状态监听器
    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // 通知所有监听器
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    // 更新分数
    updateScore(points) {
        this.stateData.score += points;
        if (this.stateData.score > this.stateData.highScore) {
            this.stateData.highScore = this.stateData.score;
            this.saveHighScore();
        }
        this.notifyListeners('scoreUpdate', this.stateData.score);
    }

    // 更新连击数
    updateCombo(ate) {
        if (ate) {
            this.stateData.combo++;
        } else {
            this.stateData.combo = 0;
        }
        this.notifyListeners('comboUpdate', this.stateData.combo);
    }

    // 添加特殊效果
    addSpecialEffect(effect, duration) {
        this.stateData.specialEffects.set(effect, {
            startTime: Date.now(),
            duration: duration
        });
        this.notifyListeners('effectAdd', { effect, duration });
    }

    // 移除特殊效果
    removeSpecialEffect(effect) {
        this.stateData.specialEffects.delete(effect);
        this.notifyListeners('effectRemove', effect);
    }

    // 检查特殊效果是否激活
    hasEffect(effect) {
        if (!this.stateData.specialEffects.has(effect)) return false;
        
        const effectData = this.stateData.specialEffects.get(effect);
        const now = Date.now();
        const isActive = now - effectData.startTime < effectData.duration;
        
        if (!isActive) {
            this.removeSpecialEffect(effect);
        }
        
        return isActive;
    }

    // 重置游戏状态
    reset() {
        this.stateData.score = 0;
        this.stateData.combo = 0;
        this.stateData.specialEffects.clear();
        this.transition(GameStates.READY);
    }

    // 加载最高分
    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('highScore')) || 0;
        } catch (e) {
            console.warn('Failed to load high score:', e);
            return 0;
        }
    }

    // 保存最高分
    saveHighScore() {
        try {
            localStorage.setItem('highScore', this.stateData.highScore.toString());
        } catch (e) {
            console.warn('Failed to save high score:', e);
        }
    }

    // 获取当前状态
    getCurrentState() {
        return this.currentState;
    }

    // 获取状态数据
    getStateData() {
        return { ...this.stateData };
    }
} 