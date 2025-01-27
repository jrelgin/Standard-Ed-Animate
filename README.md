# Grid Animation System

An interactive grid-based animation system that creates flowing dot animations to visualize data in various chart forms.

## Features

- Smooth flowing dot animations from left to right
- Three distinct data visualization shapes:
  - Line Chart
  - Bar Chart
  - Pie Chart
- Automatic transitions between shapes
- Debug mode for grid visualization
- Responsive design that adapts to window size

## Project Structure

```
grid-animation-system/
├── index.html              # Main HTML file
├── src/
│   ├── styles/
│   │   └── main.css       # Styling
│   └── js/
│       ├── main.js        # Application entry point
│       ├── grid.js        # Grid system and dot management
│       ├── shapes.js      # Shape definitions
│       ├── animations.js  # Animation controller
│       └── interactions.js # User interaction handling
```

## Running the Project

1. Clone the repository
2. Open index.html in a modern web browser
3. The animation will start automatically

## Controls

- Toggle Debug Mode: Shows the grid structure and dot boundaries

## Implementation Details

- Uses HTML5 Canvas for rendering
- Implements smooth easing functions for natural motion
- Supports high DPI displays
- Modular architecture for easy extension
