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
        this.flowDuration = 4; // in seconds for GSAP
        this.pauseDuration = 6; // in seconds for GSAP
        this.activeColumnWidth = 8; // Number of columns that are "lit up" in the wave
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

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                this.dots.push({
                    x: offsetX + col * this.spacing,
                    y: offsetY + row * this.spacing,
                    col: col,
                    row: row,
                    isPartOfShape: false,
                    opacity: 0.2,
                    wavePosition: -1 // Position relative to the moving wave
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
        
        // Animate the wave position from start to end
        const waveProgress = { value: -this.activeColumnWidth };
        
        tl.to(waveProgress, {
            value: this.columns + this.activeColumnWidth,
            duration: this.flowDuration,
            ease: "none",
            onUpdate: () => {
                // Update each dot's opacity based on its position relative to the wave
                this.dots.forEach(dot => {
                    const distanceFromWave = Math.abs(dot.col - waveProgress.value);
                    
                    if (waveProgress.value >= dot.col) {
                        // Wave has passed this dot
                        if (dot.isPartOfShape) {
                            // If it's part of the new shape, light it up
                            dot.opacity = 1;
                        } else {
                            // If it's not part of the new shape, dim it
                            dot.opacity = 0.2;
                        }
                    } else {
                        // Wave hasn't reached this dot yet
                        if (dot.wasPartOfPreviousShape) {
                            // Keep previous shape dots lit until wave reaches them
                            dot.opacity = 1;
                        }
                        
                        // Light up dots in the wave
                        if (distanceFromWave <= this.activeColumnWidth / 2) {
                            dot.opacity = 1;
                        }
                    }
                });
            }
        })
        .to({}, { duration: this.pauseDuration }) // Pause to display shape
        .to(waveProgress, {
            value: this.columns + this.activeColumnWidth * 2,
            duration: this.flowDuration,
            ease: "none",
            onUpdate: () => {
                this.dots.forEach(dot => {
                    const distanceFromWave = Math.abs(dot.col - waveProgress.value);
                    
                    if (distanceFromWave <= this.activeColumnWidth / 2) {
                        // Dot is in the active wave
                        dot.opacity = 1;
                    } else if (waveProgress.value > dot.col) {
                        // Wave has passed, all dots return to inactive state
                        dot.opacity = 0.2;
                    }
                });
            }
        });

        return tl;
    }

    // Helper function to calculate wave effect
    calculateWaveEffect(distanceFromWave, waveProgress, currentTime) {
        // Base intensity drops off from center of wave
        const normalizedDistance = Math.abs(distanceFromWave) / (this.activeColumnWidth / 2);
        const baseIntensity = Math.max(0, 1 - normalizedDistance);
        
        // Add pulsing effect
        const pulsePhase = (currentTime / 1000) * this.pulseFrequency * Math.PI;
        const pulseEffect = 0.2 * Math.sin(pulsePhase); // 0.2 is pulse amplitude
        
        // Add subtle gradient based on position in wave
        const gradientEffect = 0.15 * Math.sin((distanceFromWave / (this.activeColumnWidth / 2)) * Math.PI);
        
        // Combine effects
        return Math.min(1, Math.max(0.2, baseIntensity + pulseEffect + gradientEffect));
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
        const waveProgress = { 
            value: -this.activeColumnWidth,
            time: 0 // Track animation time for wave effects
        };
        
        tl.to(waveProgress, {
            value: this.columns + this.activeColumnWidth,
            time: this.flowDuration,
            duration: this.flowDuration,
            ease: "none",
            onUpdate: () => {
                const currentTime = performance.now();
                this.dots.forEach(dot => {
                    const distanceFromWave = dot.col - waveProgress.value;
                    
                    if (waveProgress.value >= dot.col) {
                        // After wave passes, show next shape state
                        dot.opacity = dot.isPartOfNextShape ? 1 : 0.2;
                    } else {
                        // Before wave, maintain current shape
                        if (dot.isPartOfCurrentShape) {
                            dot.opacity = 1;
                        } else if (Math.abs(distanceFromWave) <= this.activeColumnWidth / 2) {
                            // Apply wave effect
                            dot.opacity = this.calculateWaveEffect(distanceFromWave, waveProgress.value, currentTime);
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
