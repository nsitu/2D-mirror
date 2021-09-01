# 2D-mirror
Track user's head movements with tensorflow's BlazeFace model to control a series of layered images with p5js and WebGL  

# Demo
[Live demo](https://nsitu.ca/2dmirror)  

# Background
This sketch tracks the user's face via webcam. Head movements are used as a kind of UI / control. A BlazeFace model estimates facial landmarks in webcam video. This sketch uses tensorflow's "wasm" (web assembly) backend (WebGL and CPU are also possible). Facial orientation / proximity is calculated from eye and nose locations. Layered images react dynamically to users' head movements. 

# Themes
Images in this demo are selected for their connection to personal data (E.g. weather radar, fitness tracking, locations visited). Inspiration is via [Accurat's work with Data Portraits](https://www.accurat.it/work/ted)

# Resources
[Tensorflow BlazeFace - Landmarks Demo](https://storage.googleapis.com/tfjs-models/demos/blazeface/index.html)  
[BlazeFace Model Card - PDF](https://drive.google.com/file/d/1f39lSzU5Oq-j_OXgS67KfN5wNsoeAZ4V/view)
 
