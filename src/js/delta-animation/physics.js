import { gsap } from 'gsap';

export class PhysicsAnimation {
    constructor() {
        this.svg = document.getElementById('animation');
        this.svgPath = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.gravity = 0.1;
        this.influenceRadius = 150;
        this.maxScale = 2.5;
        this.particleSize = 4;
        this.spacing = 15;
        this.svgColor = '#333'; // We'll update this with the actual SVG color
        
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
            
            // Get the original color from the SVG
            this.svgColor = path.getAttribute('fill') || '#333';
            
            // Set the viewBox and size
            this.svg.setAttribute('viewBox', originalSvg.getAttribute('viewBox') || '0 0 1200 1200');
            this.svg.style.width = '80vmin';
            this.svg.style.height = '80vmin';
            
            // Create and append the path (invisible, just for hit testing)
            const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            newPath.setAttribute('d', path.getAttribute('d'));
            newPath.setAttribute('fill', '#000000');
            newPath.style.fillOpacity = '0';
            this.svg.appendChild(newPath);
            
            // Store reference to the path
            this.svgPath = newPath;
        } catch (error) {
            console.error('Error loading SVG:', error);
        }
    }

    isPointInSVG(x, y) {
        const point = this.svg.createSVGPoint();
        point.x = x;
        point.y = y;
        return this.svgPath.isPointInFill(point);
    }

    createParticles() {
        // Calculate grid dimensions based on viewBox
        const viewBox = this.svg.getAttribute('viewBox').split(' ').map(Number);
        const width = viewBox[2];
        const height = viewBox[3];
        const cols = Math.floor(width / this.spacing);
        const rows = Math.floor(height / this.spacing);
        
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
            const viewBox = this.svg.getAttribute('viewBox').split(' ').map(Number);
            const scaleX = viewBox[2] / rect.width;
            const scaleY = viewBox[3] / rect.height;
            
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
