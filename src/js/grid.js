import { gsap } from 'gsap';

export class GridSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dots = [];
        this.debugMode = false;
        
        // Grid configuration
        this.spacing = 20;
        this.dotRadius = 2;
        
        // Animation configuration
        this.timeline = gsap.timeline();
        this.flowDuration = 2; // in seconds for GSAP
        this.pauseDuration = 2; // in seconds for GSAP
        this.activeColumnWidth = 20; // Number of columns that are "lit up" in the wave
        this.pulseFrequency = 3; // How many times the wave pulses per second
        
        // Handle high DPI displays
        this.pixelRatio = window.devicePixelRatio || 1;
        this.updateDimensions();
        
        // Start the animation loop
        this.animate();
    }

    updateDimensions() {
        const { width, height } = this.canvas.getBoundingClientRect();
        
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        this.columns = Math.floor(width / this.spacing);
        this.rows = Math.floor(height / this.spacing);
        
        this.initializeDots();
    }

    initializeDots() {
        this.dots = [];
        
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;
        const offsetX = (width - (this.columns - 1) * this.spacing) / 2;
        const offsetY = (height - (this.rows - 1) * this.spacing) / 2;

        // Generate random fade multipliers and lengths for each row
        const rowFadeMultipliers = Array(this.rows).fill(0).map(() => {
            const rand = Math.random();
            if (rand < 0.25) {
                // 25% super fast, instant fade
                return 15.0 + Math.random() * 5.0; // 15-20x speed
            } else if (rand < 0.5) {
                // 25% medium-fast fade
                return 6.0 + Math.random() * 3.0; // 6-9x speed
            } else if (rand < 0.75) {
                // 25% slower visible fade
                return 2.0 + Math.random() * 2.0; // 2-4x speed
            } else {
                // 25% very slow fade for contrast
                return 0.5 + Math.random() * 0.5; // 0.5-1x speed
            }
        });

        // Generate random fade lengths for each row
        const rowFadeLengths = Array(this.rows).fill(0).map(() => {
            const rand = Math.random();
            if (rand < 0.3) {
                // 30% very short trails
                return 0.3 + Math.random() * 0.2; // 0.3-0.5x active width
            } else if (rand < 0.6) {
                // 30% medium trails
                return 0.8 + Math.random() * 0.4; // 0.8-1.2x active width
            } else {
                // 40% long trails
                return 1.5 + Math.random() * 1.0; // 1.5-2.5x active width
            }
        });

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                // Add subtle variation within each row (±20%)
                const rowMultiplier = rowFadeMultipliers[row];
                const dotVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                
                this.dots.push({
                    x: offsetX + col * this.spacing,
                    y: offsetY + row * this.spacing,
                    col: col,
                    row: row,
                    isPartOfShape: false,
                    opacity: 0.2,
                    wavePosition: -1,
                    fadeMultiplier: rowMultiplier * dotVariation,
                    fadeLength: rowFadeLengths[row] * this.activeColumnWidth
                });
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
    }

    activateDots(pattern) {
        // Kill any existing animations
        gsap.killTweensOf(this.dots);
        
        // Store the current shape state before resetting
        const previousShapeState = this.dots.map(dot => ({
            isPartOfShape: dot.isPartOfShape,
            opacity: dot.opacity
        }));
        
        // Reset wave position but keep current opacity
        this.dots.forEach((dot, index) => {
            dot.wavePosition = -1;
            
            // Determine if this dot is part of the new shape
            const x = dot.col / (this.columns - 1);
            const y = dot.row / (this.rows - 1);
            dot.isPartOfShape = pattern(0, x, y) > 0;
            
            // Keep the previous opacity until the wave reaches this dot
            dot.opacity = previousShapeState[index].opacity;
            dot.wasPartOfPreviousShape = previousShapeState[index].isPartOfShape;
        });

        // Create a new timeline
        const tl = gsap.timeline();
        
        // Animate the wave position from end to start (right to left)
        const waveProgress = { value: this.columns + this.activeColumnWidth };
        
        tl.to(waveProgress, {
            value: -this.activeColumnWidth,
            duration: this.flowDuration,
            ease: "none",
            onUpdate: () => {
                // Update each dot's opacity based on its position relative to the wave
                this.dots.forEach(dot => {
                    const distanceFromWave = dot.col - waveProgress.value;
                    
                    if (distanceFromWave >= 0) {
                        // Wave has passed this dot
                        if (dot.isPartOfShape) {
                            // If it's part of the new shape, snap to full brightness
                            dot.opacity = 1;
                        } else {
                            // If it's not part of the shape, fade out behind the wave
                            const fadeDistance = distanceFromWave;
                            const fadeLength = this.activeColumnWidth * 0.5; // Length of fade trail
                            if (fadeDistance <= fadeLength) {
                                // Only the last few rows fade
                                dot.opacity = 1 - (fadeDistance / fadeLength);
                            } else {
                                // Beyond fade distance, snap to dim
                                dot.opacity = 0.2;
                            }
                        }
                    } else if (distanceFromWave >= -this.activeColumnWidth) {
                        // Dot is in the active wave - full brightness
                        dot.opacity = 1;
                    } else {
                        // Wave hasn't reached this dot yet
                        if (dot.wasPartOfPreviousShape) {
                            dot.opacity = 1;
                        } else {
                            dot.opacity = 0.2;
                        }
                    }
                });
            }
        })
        .to({}, { duration: this.pauseDuration }); // Pause to display shape

        return tl;
    }

    transitionShapes(currentPattern, nextPattern) {
        // Kill any existing animations
        gsap.killTweensOf(this.dots);
        
        // Calculate dot states for both patterns
        this.dots.forEach(dot => {
            const x = dot.col / (this.columns - 1);
            const y = dot.row / (this.rows - 1);
            
            // Store current and next shape states
            dot.isPartOfCurrentShape = currentPattern(0, x, y) > 0;
            dot.isPartOfNextShape = nextPattern(0, x, y) > 0;
            
            // Initialize opacity based on current shape
            dot.opacity = dot.isPartOfCurrentShape ? 1 : 0.2;
        });

        // Create a new timeline
        const tl = gsap.timeline();
        
        // Animate the wave position from start to end
        const waveProgress = { value: -this.activeColumnWidth };
        
        tl.to(waveProgress, {
            value: this.columns + this.activeColumnWidth,
            duration: this.flowDuration,
            ease: "none",
            onUpdate: () => {
                this.dots.forEach(dot => {
                    const distanceFromWave = dot.col - waveProgress.value;
                    
                    if (distanceFromWave <= 0) {  // Wave has passed this dot
                        if (dot.isPartOfNextShape) {
                            dot.opacity = 1;  // Part of new shape, snap to full brightness
                        } else {
                            // Use the dot's custom fade length
                            const fadeDistance = Math.abs(distanceFromWave);
                            if (fadeDistance <= dot.fadeLength) {
                                const fadeProgress = (fadeDistance / dot.fadeLength) * dot.fadeMultiplier;
                                dot.opacity = Math.max(0.2, 1 - fadeProgress);
                            } else {
                                dot.opacity = 0.2;
                            }
                        }
                    } else if (distanceFromWave <= this.activeColumnWidth) {
                        // In the active wave - full brightness
                        dot.opacity = 1;
                    } else {
                        // Wave hasn't reached this dot yet
                        if (dot.isPartOfCurrentShape) {
                            dot.opacity = 1;
                        } else {
                            dot.opacity = 0.2;
                        }
                    }
                });
            }
        })
        .to({}, { duration: this.pauseDuration });

        return tl;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);

        // Render all dots with their current opacity
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, this.dotRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
            this.ctx.fill();

            if (this.debugMode) {
                this.ctx.strokeStyle = '#ddd';
                this.ctx.strokeRect(
                    dot.x - this.spacing/2,
                    dot.y - this.spacing/2,
                    this.spacing,
                    this.spacing
                );
            }
        });
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}
