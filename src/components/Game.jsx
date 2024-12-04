import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game as GameCore } from '../core/Game';
import { GameState } from '../core/GameState';
import { Renderer } from '../core/Renderer';
import { Controller } from '../core/Controller';
import './Game.css';

const Game = () => {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const rendererRef = useRef(null);
    const controllerRef = useRef(null);
    const gameStateRef = useRef(null);
    const moveIntervalRef = useRef(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStatus, setGameStatus] = useState('INIT');

    // 移动控制
    const moveSnake = useCallback(() => {
        if (!gameRef.current || gameRef.current.state.isGameOver || isPaused) {
            return;
        }

        console.log('Moving snake...');
        gameRef.current.move();

        // 设置下一次移动
        moveIntervalRef.current = setTimeout(moveSnake, 300);
    }, [isPaused]);

    // 处理游戏状态变化
    useEffect(() => {
        // 清除现有的移动定时器
        if (moveIntervalRef.current) {
            clearTimeout(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }

        // 如果游戏正在进行且未暂停，开始移动
        if (gameStatus === 'PLAYING' && !isPaused) {
            console.log('Starting snake movement');
            moveIntervalRef.current = setTimeout(moveSnake, 300);
        }

        return () => {
            if (moveIntervalRef.current) {
                clearTimeout(moveIntervalRef.current);
                moveIntervalRef.current = null;
            }
        };
    }, [gameStatus, isPaused, moveSnake]);

    // 初始化游戏实例
    useEffect(() => {
        if (!canvasRef.current || gameRef.current) return;
        console.log('Initializing game...');

        const game = new GameCore({
            gridSize: 15,
            cellSize: 30
        });

        const gameState = new GameState();
        const renderer = new Renderer(canvasRef.current, {
            gridSize: 15,
            cellSize: 30
        });
        const controller = new Controller(game);

        console.log('Game instances created');

        gameRef.current = game;
        gameStateRef.current = gameState;
        rendererRef.current = renderer;
        controllerRef.current = controller;

        // 直接从游戏状态更新分数
        const updateScore = () => {
            const currentScore = gameRef.current.getState().score;
            console.log('Score updated:', currentScore);
            setScore(currentScore);
            
            // 更新最高分
            if (currentScore > highScore) {
                setHighScore(currentScore);
                localStorage.setItem('snakeHighScore', currentScore.toString());
            }
        };

        // 从本地存储加载最高分
        const savedHighScore = localStorage.getItem('snakeHighScore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }

        // 设置状态监听器
        gameState.addListener('stateChange', ({ newState }) => {
            console.log('Game state changed:', newState);
            setGameStatus(newState);
        });

        // 在移动后检查分数和游戏状态
        const originalMove = game.move.bind(game);
        game.move = () => {
            originalMove();
            updateScore();
            
            // 检查游戏是否结束
            if (game.state.isGameOver) {
                console.log('Game Over detected');
                setGameStatus('ENDED');
                if (moveIntervalRef.current) {
                    clearTimeout(moveIntervalRef.current);
                    moveIntervalRef.current = null;
                }
            }
        };

        // 设置渲染循环
        function renderLoop() {
            if (rendererRef.current && gameRef.current) {
                rendererRef.current.render(gameRef.current.getState());
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);

        return () => {
            if (moveIntervalRef.current) {
                clearTimeout(moveIntervalRef.current);
            }
            if (controllerRef.current) {
                controllerRef.current.destroy();
            }
        };
    }, [highScore]);

    const handleStartGame = useCallback(() => {
        console.log('Starting game...');
        if (!gameRef.current) return;

        gameRef.current.reset();
        setScore(0);
        setGameStatus('PLAYING');
        setIsPaused(false);
    }, []);

    const handlePauseGame = useCallback(() => {
        console.log('Toggling pause...');
        if (!gameRef.current) return;
        
        setIsPaused(prev => !prev);
    }, []);

    const handleRestartGame = useCallback(() => {
        console.log('Restarting game...');
        if (!gameRef.current) return;

        gameRef.current.reset();
        setScore(0);
        setIsPaused(false);
        setGameStatus('PLAYING');
    }, []);

    const handleScreenshot = useCallback(() => {
        if (!canvasRef.current) return;
        
        try {
            // 获取画布数据URL
            const dataUrl = canvasRef.current.toDataURL('image/png');
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `snake-game-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.png`;
            link.href = dataUrl;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    }, []);

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="score-container">
                    <div className="score">分数: {score}</div>
                    <div className="high-score">最高分: {highScore}</div>
                </div>
                <button className="screenshot-button" onClick={handleScreenshot}>
                    截图分享
                </button>
            </div>
            
            <div className="game-board">
                <canvas 
                    ref={canvasRef} 
                    className="game-canvas"
                    width={450}
                    height={450}
                />
                
                <div className="game-controls">
                    {gameStatus === 'INIT' && (
                        <button className="start-button" onClick={handleStartGame}>
                            开始游戏
                        </button>
                    )}
                    
                    {gameStatus === 'PLAYING' && (
                        <button className="pause-button" onClick={handlePauseGame}>
                            {isPaused ? '继续' : '暂停'}
                        </button>
                    )}
                    
                    {gameStatus === 'ENDED' && (
                        <div className="game-over">
                            <h2>游戏结束</h2>
                            <p>最终得分: {score}</p>
                            <button className="restart-button" onClick={handleRestartGame}>
                                重新开始
                            </button>
                            <button className="screenshot-button" onClick={handleScreenshot}>
                                保存截图
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mobile-controls">
                <div className="control-hint">
                    <p>移动端控制方式：</p>
                    <p>滑动：控制方向</p>
                    <p>双击：暂停/继续</p>
                </div>
            </div>
        </div>
    );
};

export default Game; 