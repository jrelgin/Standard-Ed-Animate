export class ShapeManager {
    constructor() {
        this.shapes = new Map();
        this.initializeShapes();
    }

    initializeShapes() {
        // Line Chart
        this.addShape('lineChart', (t, x, y) => {
            // Define key points for the line (x, y coordinates)
            const points = [
                { x: 0.0, y: 0.8 },    // Start at left edge
                { x: 0.25, y: 0.6 },   // Point 1
                { x: 0.5, y: 0.7 },    // Point 2
                { x: 1.0, y: 0.3 }     // End at right edge
            ];
            
            // Find the line segment we're in
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                
                if (x >= p1.x && x <= p2.x) {
                    // Linear interpolation between points
                    const progress = (x - p1.x) / (p2.x - p1.x);
                    const lineHeight = p1.y + (p2.y - p1.y) * progress;
                    
                    // Keep same thickness
                    const thickness = 0.15;
                    return Math.abs(y - lineHeight) < thickness ? 1 : 0;
                }
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
                    // Changed to measure from bottom (y=1) upward
                    return y > (1 - bar.height) ? 1 : 0;
                }
            }
            
            return 0;
        });

        // Pie Chart
        this.addShape('pieChart', (t, x, y) => {
            // Center of the pie
            const centerX = 0.5;
            const centerY = 0.5;
            const radius = 0.45;  // Larger radius to match other shapes
            
            // Normalize coordinates to make circle perfect (fix horizontal stretch)
            const dx = (x - centerX) * 1.5; // Compress x-axis to counter stretch
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Define pie segments
            const segments = [
                { start: 0, end: Math.PI * 0.5 },
                { start: Math.PI * 0.5, end: Math.PI },
                { start: Math.PI, end: Math.PI * 1.5 },
                { start: Math.PI * 1.5, end: Math.PI * 2 }
            ];
            
            if (distance <= radius) {
                const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
                
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    if (normalizedAngle >= segment.start && normalizedAngle < segment.end) {
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
