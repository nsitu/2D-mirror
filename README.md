# 2D-mirror
Track user's head movements with tensorflow's BlazeFace model to control a series of layered images with p5js and WebGL

# Background
This sketch tracks the user's face via webcam. Head movements are used as a kind of UI / control. A BlazeFace model estimates facial landmarks in webcam video. Facial orientation / proximity is calculated from eye and nose locations. Layered images react dynamically to users' head movements. Images are selected for their connection to personal data (E.g. weather radar, fitness tracking, locations visited)
