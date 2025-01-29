# Standard Ed Animated

An elegant collection of interactive SVG animations using physics-based particle systems. Each animation creates a unique, engaging user experience with smooth, responsive interactions.

## Features

- Three distinct interactive animations:
  - Grid Animation: Flowing dots with shape transitions
  - Pie Chart Animation: Interactive particle system in a pie shape
  - Delta Animation: Interactive particle system in a delta shape
- Physics-based interactions with mouse movement
- Smooth scaling and movement transitions
- Responsive design that adapts to window size
- Beautiful color schemes:
  - Grid: Black background with flowing animations
  - Pie: White background with teal dots
  - Delta: Deep blue background with white dots

## Project Structure

```
standard-ed-animated/
├── src/
│   ├── index.html           # Grid animation
│   ├── physics.html         # Pie chart animation
│   ├── delta.html          # Delta animation
│   ├── assets/
│   │   └── svg/            # SVG shapes for animations
│   └── js/
│       ├── grid-animation/  # Grid animation system
│       ├── physics-animation/ # Pie chart physics
│       └── delta-animation/  # Delta physics
```

## Running the Project

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

## Implementation Details

- Built with Vite for modern development
- Uses GSAP for smooth animations
- SVG-based particle systems
- Physics-based interactions
- Modular architecture for easy extension

## License

MIT License
