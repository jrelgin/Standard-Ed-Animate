export class ShapeManager {
    constructor() {
        this.shapes = new Map();
        this.initializeShapes();
    }

    initializeShapes() {
        // Line Chart
        this.addShape('lineChart', (t, x, y) => {
            // Create a smooth line that varies in height
            const lineHeight = 0.7 - 0.4 * Math.sin(x * Math.PI * 2);
            
            // Return 1 if above the line, 0 if below
            const transitionWidth = 0.01;
            const distance = y - lineHeight;
            
            if (distance > transitionWidth) {
                return 1; // Active above the line
            } else if (distance > 0) {
                return distance / transitionWidth;
            }
            return 0;
        });

        // Bar Chart
        this.addShape('barChart', (t, x, y) => {
            // Define bar positions and heights
            const bars = [
                { pos: 0.1, height: 0.6 },
                { pos: 0.3, height: 0.4 },
                { pos: 0.5, height: 0.8 },
                { pos: 0.7, height: 0.5 },
                { pos: 0.9, height: 0.7 }
            ];
            
            const barWidth = 0.15;
            
            // Find if we're in any bar
            for (const bar of bars) {
                if (Math.abs(x - bar.pos) < barWidth / 2) {
                    return y > (1 - bar.height) ? 0 : 1;
                }
            }
            
            return 0;
        });

        // Pie Chart
        this.addShape('pieChart', (t, x, y) => {
            // Center of the pie
            const centerX = 0.5;
            const centerY = 0.5;
            
            // Calculate distance from center and angle
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Define pie segments (start angle, end angle)
            const segments = [
                { start: 0, end: Math.PI * 0.5 },
                { start: Math.PI * 0.5, end: Math.PI },
                { start: Math.PI, end: Math.PI * 1.5 },
                { start: Math.PI * 1.5, end: Math.PI * 2 }
            ];
            
            // Check if point is within pie radius
            const maxRadius = 0.4;
            if (distance <= maxRadius) {
                // Normalize angle to 0-2π range
                const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
                
                // Check which segment we're in
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    if (normalizedAngle >= segment.start && normalizedAngle < segment.end) {
                        // Alternate segments are active
                        return i % 2 === 0 ? 1 : 0;
                    }
                }
            }
            
            return 0;
        });
    }

    addShape(name, generator) {
        this.shapes.set(name, generator);
    }

    getShape(name) {
        return this.shapes.get(name);
    }

    generateShape(name, time, x, y) {
        const generator = this.shapes.get(name);
        if (!generator) return 0;
        
        return generator(time, x, y);
    }
}
