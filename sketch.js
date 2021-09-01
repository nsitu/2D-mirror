// 2D Mirror / Data Portrait

// This sketch tracks the user's face via webcam
// Head movements are used as a kind of UI / control
// A BlazeFace model estimates facial landmarks in webcam video
// Facial orientation / proximity is calculated from eye and nose locations
// Layered images react dynamically to users' head movements
// Images are selected for their connection to personal data
// E.g. weather radar, fitness tracking, locations visited

// Consider:
// How and why does data visualization relate to artistic expression?
// How and why might a data portrait differ from an infographic?
// How and why is data presented and represented? 

// See also:
// https://storage.googleapis.com/tfjs-models/demos/blazeface/index.html


// Setup some variables for key elements.
let model, webcam, canvas, fpsCounter
let fps = 0       // frames per second

let faces = []    // an array to be populated by BlazeFace predictions
let images = []   // we will populate this array with our own image layers

// This is a data structure to hold face landmarks. 
// It will get updated by BlazeFace
let face= {
  rightEye:{x:1, y:1},
  leftEye:{x:1, y:1},
  nose:{x:1, y:1}
}

// These values will be calculated / derived from eye and nose locations
let faceAngle = 1
let faceScale = 1
let faceCentre = {x:1,y:1}

// Preload happens before anything else.
preload = () => { 
  // images need to be preloaded so that p5 has access to them.
  // feel free to use your own images here!
  images = [ 
    loadImage("maps.png"),
    loadImage("radar.png"),
    loadImage("strava.png")
  ]
}

setup = () => {
  // Use a WebGL Canvas to make our images render faster
  createCanvas(windowWidth, windowHeight, WEBGL)
  // Get a video feed from the webcam.
  webcam = createCapture(VIDEO, initialize)
  webcam.hide()
  // create a div to show frames per second
  fpsCounter = createDiv().id('fps').position(10, 10);
}
 
draw = () => { 
  clear()
  // Proceed only if the BlazeFace model has found "more than zero" faces
  if (faces.length > 0) { 
    // This sketch assumes only one face at a time (i.e. the zero-eth face)  
    face = getLandmarks(faces[0]) 
    // Within the following functions, "lerp" is used to smooth animation 
    // See also: https://p5js.org/reference/#/p5/lerp
    faceAngle = getAngle(face) 
    faceScale = getScale(face)
    faceCentre = getCentre(face)     
    drawImages()
  }
}

// Some functions below use a modern "async" and "await" JavaScript syntax. Curious? Read more:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

initialize = async () => {
  // BlazeFace performs best on "wasm" (Web Assembly); "webgl" and "cpu" also work
  await tf.setBackend('wasm');  
  model = await blazeface.load()
  // "await" is useful here: we cannot make faces UNTIL the model is ready.
  findFaces()
}

// While BlazeFace runs, we use a millisecond timer to get FPS (frames per second)
// This shows the performance of the model, independently of the draw() loop
// draw() may run at a consistent 60fps even if BlazeFace is slower than that.
// see also: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
findFaces = async () => { 
  start = performance.now()
  // since "faces" are stored globally the draw() loop will have access to this data!
  faces = await model.estimateFaces( webcam.elt, false, true);
  end = performance.now()
  // update the fps on every 5th frame
  if (frameCount%5 ==0){ 
    fps = int ( 1000 / (end - start) )
    fpsCounter.html(fps+' <span>FPS</span>')
  }
  // notice how "findFaces" runs continuously in a loop here.
  requestAnimationFrame(findFaces)
}

// BlazeFace numbers its landmarks (0,1,2,3,4,5) but does not name them.
// It helps to build a named structure to make our code more legible.
// e.g. 0 right eye, 1 left eye, 2 nose, 3 mouth, 4 right ear, 5 left ear 
// Here, we extract only the most useful landmarks (two eyes and a nose)
getLandmarks = (data) => {
  return {
    rightEye:{
      x:lerp(data.landmarks[0][0], face.rightEye.x, 0.5), 
      y:lerp(data.landmarks[0][1], face.rightEye.y, 0.5)},
    leftEye:{
      x:lerp(data.landmarks[1][0], face.leftEye.x, 0.5), 
      y:lerp(data.landmarks[1][1], face.leftEye.y, 0.5)},
    nose:{
      x:lerp(data.landmarks[2][0], face.nose.x, 0.5), 
      y:lerp(data.landmarks[2][1], face.nose.y, 0.5)}
  }
}

// Here we get the face angle based on eye orientation / trigonometry
// If you are curious about the math (i.e inverse tangents) here check out the docs
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2#description
getAngle = (face) => {
  let dX = face.rightEye.x - face.leftEye.x
  let dY = face.rightEye.y - face.leftEye.y
  let newAngle = Math.atan2(dY, dX) 
  // Handle changes in sign (i.e. when the angle flips between +/-)
  if (newAngle-faceAngle < -PI ){ newAngle += TWO_PI }
  if (newAngle-faceAngle > PI){ newAngle -= TWO_PI } 
  return lerp(faceAngle, newAngle, 0.5)
}

// Calculate a scale factor based on the distance/gap between the eyes
// As the user approaches the camera, the gap increases
// We map this onto a scale multiplier as follows:
// A number between 0 and 1 will imply scaling down.
// A number between 1 and 2 will imply scaling up.
getScale = (face) => {
  let gap = dist( face.leftEye.x, face.leftEye.y, 
                  face.rightEye.x, face.rightEye.y)
  // Read more about mapping one range of numbers onto another:
  // https://p5js.org/reference/#/p5/map
  let newScale = map(gap, 0, 300, 0, 2)
  return lerp(faceScale, newScale, 0.5)
}

// For the face centre we will use the nose location relative to the dimensions of the webcam
// Since the screen dimensions will likely differ from the webcam
// It helps to express this as a fraction (i.e. a "normalized" value between 0 and 1)
getCentre = (face) => {
  return {
      x: lerp(faceCentre.x, face.nose.x/webcam.width, 0.5),
      y: lerp(faceCentre.y, face.nose.y/webcam.height, 0.5)
  }
}

// Drawing images is all about placement and alignment
// Transform operations are helpful here (i.e. translate / rotate / scale)
drawImages = () =>{
  // To save us some math tell p5 to align images based on their centre point
  imageMode(CENTER)
  // loop through the array of images; see the preload() function above
  for (index in images){ 
    // a bit of fun to make some images more lively based on their location in the list
    let liveliness = 1 + (index*0.75)
    push();
        // Set canvas origin to top left (WebGL is centred by default)
        translate( -width/2, -height/2)   
        // map the face centre onto the actual width of ythe screen
        translate(faceCentre.x*width, faceCentre.y*height)
        // make images bigger when the user moves closer to the camera
        scale(faceScale)
        // rotate images according to their "liveliness"
        rotate(faceAngle * liveliness )
        // draw the image
        image(images[index], 0,0)
    pop();
  }
}

// if the window changes size adjust the canvas accordingly
windowResized = () => {
  resizeCanvas(windowWidth, windowHeight)
}