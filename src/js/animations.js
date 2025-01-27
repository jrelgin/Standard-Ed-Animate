import { gsap } from 'gsap';

export class AnimationController {
    constructor(gridSystem, shapeManager) {
        this.gridSystem = gridSystem;
        this.shapeManager = shapeManager;
        
        // Animation state
        this.currentShapeIndex = 0;
        this.mainTimeline = gsap.timeline({
            repeat: -1,
            onRepeat: () => this.updateCurrentShape()
        });
        
        // Shape sequence
        this.shapeSequence = ['lineChart', 'barChart', 'pieChart'];
        
        // Start the animation sequence
        this.initializeAnimation();
    }

    initializeAnimation() {
        // Clear any existing animations
        this.mainTimeline.clear();
        
        // Create the initial shape animation
        this.addNextShapeToTimeline();
    }

    addNextShapeToTimeline() {
        const currentShape = this.shapeSequence[this.currentShapeIndex];
        const shapeGenerator = this.shapeManager.getShape(currentShape);
        
        if (shapeGenerator) {
            // Add the shape animation to the timeline
            const shapeTimeline = this.gridSystem.activateDots(shapeGenerator);
            this.mainTimeline.add(shapeTimeline);
        }
    }

    updateCurrentShape() {
        this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapeSequence.length;
        this.addNextShapeToTimeline();
    }

    update() {
        // GSAP handles the animation updates automatically
        // This method is kept for compatibility with the existing code
    }
}
