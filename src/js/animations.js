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
        const nextShapeIndex = (this.currentShapeIndex + 1) % this.shapeSequence.length;
        const nextShape = this.shapeSequence[nextShapeIndex];
        
        const currentGenerator = this.shapeManager.getShape(currentShape);
        const nextGenerator = this.shapeManager.getShape(nextShape);
        
        if (currentGenerator && nextGenerator) {
            // Add the shape transition animation to the timeline
            const shapeTimeline = this.gridSystem.transitionShapes(currentGenerator, nextGenerator);
            this.mainTimeline.add(shapeTimeline);
        }
    }

    updateCurrentShape() {
        this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapeSequence.length;
        this.addNextShapeToTimeline();
    }

    update() {
        // GSAP handles the animation updates automatically
    }
}
