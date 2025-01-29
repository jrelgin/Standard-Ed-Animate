import { gsap } from 'gsap';

export class PhysicsAnimation {
    constructor() {
        this.svg = document.getElementById('animation');
        this.svgPath = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.gravity = 0.1;          // Same as pie
        this.influenceRadius = 150;  // Same as pie
        this.maxScale = 2.5;         // Same as pie
        this.particleSize = 4;       // Same as pie
        this.spacing = 15;           // Same as pie
        this.svgColor = '#247B7B';   // Delta's teal color
        
        // Initialize
        this.loadSVG().then(() => {
            this.createParticles();
            this.setupEventListeners();
            this.animate();
        });
    }

    async loadSVG() {
        try {
            const response = await fetch('../assets/svg/delta.svg');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const svgText = await response.text();
            
            // Extract the path data and viewBox from the original SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const originalSvg = svgDoc.querySelector('svg');
            const path = svgDoc.querySelector('path');
            
            // Scale up the viewBox to match the pie chart scale
            const scaleUp = 1200 / 81; // Scale factor to match pie's 1200px width
            const originalPath = path.getAttribute('d');
            const scaledPath = this.scalePath(originalPath, scaleUp);
            
            // Set the viewBox to match the pie chart
            this.svg.setAttribute('viewBox', '0 0 1200 1035'); // Scale height proportionally
            this.svg.style.width = '80vmin';
            this.svg.style.height = '69vmin';  // Maintain aspect ratio
            
            // Create and append the path (invisible, just for hit testing)
            const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            newPath.setAttribute('d', scaledPath);
            newPath.setAttribute('fill', '#000000');
            newPath.style.fillOpacity = '0';
            this.svg.appendChild(newPath);
            
            // Store reference to the path
            this.svgPath = newPath;
        } catch (error) {
            console.error('Error loading SVG:', error);
        }
    }

    // Helper function to scale SVG path
    scalePath(pathData, scale) {
        return pathData.replace(/[\d.-]+/g, (number) => {
            return (parseFloat(number) * scale).toFixed(2);
        });
    }

    isPointInSVG(x, y) {
        const point = this.svg.createSVGPoint();
        point.x = x;
        point.y = y;
        return this.svgPath.isPointInFill(point);
    }

    createParticles() {
        // Calculate grid dimensions based on scaled SVG size
        const cols = Math.floor(1200 / this.spacing);
        const rows = Math.floor(1035 / this.spacing);
        
        // Create grid of particles
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col + 0.5) * this.spacing;
                const y = (row + 0.5) * this.spacing;
                
                // Only create particles that are inside the SVG shape
                if (this.isPointInSVG(x, y)) {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", x);
                    circle.setAttribute("cy", y);
                    circle.setAttribute("r", this.particleSize);
                    circle.setAttribute("fill", this.svgColor);
                    this.svg.appendChild(circle);
                    
                    this.particles.push({
                        element: circle,
                        x,
                        y,
                        originalX: x,
                        originalY: y,
                        velocityX: 0,
                        velocityY: 0,
                        scale: 1
                    });
                }
            }
        }
    }

    setupEventListeners() {
        this.svg.addEventListener('mousemove', (e) => {
            const rect = this.svg.getBoundingClientRect();
            const scaleX = 1200 / rect.width;
            const scaleY = 1035 / rect.height;
            
            // Convert mouse position to SVG coordinates
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });
    }

    animate() {
        // Update each particle
        this.particles.forEach(particle => {
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.influenceRadius) {
                // Calculate influence based on distance
                const influence = 1 - (distance / this.influenceRadius);
                
                // Even gentler push force
                const pushForce = 0.5;
                particle.velocityX -= (dx / distance) * pushForce * influence;
                particle.velocityY -= (dy / distance) * pushForce * influence;
                
                // Scale up based on proximity with smoother transition
                const targetScale = 1 + (this.maxScale - 1) * influence;
                particle.scale += (targetScale - particle.scale) * 0.15;
            } else {
                // Return to original size more smoothly
                particle.scale += (1 - particle.scale) * 0.15;
            }
            
            // Apply gravity towards original position
            const homeX = particle.originalX - particle.x;
            const homeY = particle.originalY - particle.y;
            particle.velocityX += homeX * this.gravity;
            particle.velocityY += homeY * this.gravity;
            
            // Even stronger damping for smoother movement
            particle.velocityX *= 0.9;
            particle.velocityY *= 0.9;
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            
            // Update SVG element
            particle.element.setAttribute("cx", particle.x);
            particle.element.setAttribute("cy", particle.y);
            particle.element.setAttribute("r", this.particleSize * particle.scale);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}
