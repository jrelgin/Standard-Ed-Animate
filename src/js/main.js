import { GridSystem } from './grid.js';
import { ShapeManager } from './shapes.js';
import { AnimationController } from './animations.js';
import { InteractionManager } from './interactions.js';

class App {
    constructor() {
        this.canvas = document.getElementById('grid-canvas');
        this.debugMode = false;

        // Initialize systems
        this.gridSystem = new GridSystem(this.canvas);
        this.shapeManager = new ShapeManager();
        this.animationController = new AnimationController(this.gridSystem, this.shapeManager);
        this.interactionManager = new InteractionManager(this.canvas, this.animationController);

        // Setup
        this.setupEventListeners();
        this.start();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.gridSystem.updateDimensions();
        });

        // Debug mode toggle
        document.getElementById('toggle-debug').addEventListener('click', () => {
            this.debugMode = !this.debugMode;
            this.gridSystem.setDebugMode(this.debugMode);
        });
    }

    start() {
        const animate = () => {
            this.animationController.update();
            this.gridSystem.render();
            requestAnimationFrame(animate);
        };

        animate();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
