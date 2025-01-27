# Grid Animation System Development Rules

## Project Overview
This project implements an interactive, grid-based animation system featuring dots that illuminate to form dynamic shapes and patterns. The system is designed to be portable to Webflow while maintaining high performance and visual appeal.

## Core Principles

### 1. Visual Requirements
- Maintain fixed-position dots in a grid layout
- Implement smooth transitions between shapes
- Keep animations fluid and performant (target 60fps)
- Use minimal, clean aesthetic suitable for data visualization
- Support responsive design principles

### 2. Code Architecture
- Maintain separation of concerns (grid logic, shapes, animations, interactions)
- Keep dependencies minimal and justified
- Ensure code is portable to Webflow environment
- Document all shape definitions and animation patterns
- Use semantic naming conventions

### 3. Performance Guidelines
- Use RequestAnimationFrame for animations
- Implement efficient state management
- Avoid DOM manipulation during animations
- Cache calculations where possible
- Limit animation complexity based on device capabilities

### 4. Interaction Rules
- All interactions must have visual feedback
- Animations should be interruptible
- Maintain consistent timing for transitions
- Support both mouse and touch interactions
- Implement graceful degradation for older browsers

### 5. Shape and Pattern Guidelines
- Define shapes using normalized coordinates (0-1 range)
- Document the grid size requirements for each shape
- Include entry and exit states for all patterns
- Maintain consistent density across different patterns
- Support variable grid resolutions

### 6. Code Style
- Use ES6+ features appropriately
- Maintain consistent indentation (2 spaces)
- Document complex algorithms and patterns
- Use TypeScript-style JSDoc comments for functions
- Follow airbnb-style naming conventions

### 7. Testing and Debug Mode
- Include debug visualization options
- Support frame-by-frame inspection
- Maintain performance monitoring utilities
- Include grid overlay toggle
- Document test patterns and edge cases

## Version Control Guidelines
- Use semantic versioning
- Keep commits atomic and well-described
- Document breaking changes clearly
- Maintain a changelog
- Tag significant versions

## Build and Deploy Process
- Maintain separate development and production builds
- Include source maps in development
- Optimize assets for production
- Support hot module replacement in development
- Document build and deployment steps
