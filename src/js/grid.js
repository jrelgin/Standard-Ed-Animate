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
        this.activeColumnWidth = 3; // Number of columns that are "lit up" in the wave
        
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
        
        // Reset all dots
        this.dots.forEach(dot => {
            dot.opacity = 0.2;
            dot.wavePosition = -1;
            
            // Determine if this dot is part of the shape
            const x = dot.col / (this.columns - 1);
            const y = dot.row / (this.rows - 1);
            dot.isPartOfShape = pattern(0, x, y) > 0;
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
                    
                    if (dot.isPartOfShape) {
                        // If dot is part of shape, it becomes and stays active once the wave reaches it
                        if (waveProgress.value >= dot.col) {
                            dot.opacity = 1;
                        }
                    } else {
                        // Non-shape dots only light up when the wave passes over them
                        dot.opacity = distanceFromWave <= this.activeColumnWidth / 2 ? 1 : 0.2;
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
                    } else {
                        // All dots return to inactive state after wave passes
                        dot.opacity = 0.2;
                    }
                });
            }
        });

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
