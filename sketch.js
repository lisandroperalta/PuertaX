let miImagen;
let misParticulas = [];
let buffer1;
var myCapture, // camera
  myVida; // VIDA

/*
  Here we are trying to get access to the camera.
*/
function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(640, 480);
    myCapture.elt.setAttribute("playsinline", "");
    myCapture.hide();
    console.log(
      "[initCaptureDevice] capture ready. Resolution: " +
      myCapture.width +
      " " +
      myCapture.height
    );
  } catch (_err) {
    console.log("[initCaptureDevice] capture error: " + _err);
  }
}

function setup() {
  miImagen = loadImage('assets/x.png');

  createCanvas(windowWidth, windowHeight); // we need some space...

  buffer1 = createGraphics(windowWidth, windowHeight);

  initCaptureDevice(); // and access to the camera

  /*
    VIDA stuff. One parameter - the current sketch - should be passed to the
    class constructor (thanks to this you can use Vida e.g. in the instance
    mode).
  */
  myVida = new Vida(this); // create the object
  /*
    Turn on the progressive background mode.
  */
  myVida.progressiveBackgroundFlag = true;
  /*
    The value of the feedback for the procedure that calculates the background
    image in progressive mode. The value should be in the range from 0.0 to 1.0
    (float). Typical values of this variable are in the range between ~0.9 and
    ~0.98.
  */
  myVida.imageFilterFeedback = 0.92;
  /*
    The value of the threshold for the procedure that calculates the threshold
    image. The value should be in the range from 0.0 to 1.0 (float).
  */
  myVida.imageFilterThreshold = 0.15;
  /*
    You may need a horizontal image flip when working with the video camera.
    If you need a different kind of mirror, here are the possibilities:
      [your vida object].MIRROR_NONE
      [your vida object].MIRROR_VERTICAL
      [your vida object].MIRROR_HORIZONTAL
      [your vida object].MIRROR_BOTH
    The default value is MIRROR_NONE.
  */
  myVida.mirror = myVida.MIRROR_HORIZONTAL;
  /*
    In order for VIDA to handle blob detection (it doesn't by default), we set
    this flag.
  */
  myVida.handleBlobsFlag = true;
  /*
    Normalized values of parameters defining the smallest and highest allowable
    mass of the blob.
  */
  //myVida.normMinBlobMass = 0.0002;  // uncomment if needed
  //myVida.normMaxBlobMass = 0.5;  // uncomment if needed
  /*
    Normalized values of parameters defining the smallest and highest allowable
    area of the blob boiunding box.
  */
  //myVida.normMinBlobArea = 0.0002;  // uncomment if needed
  //myVida.normMaxBlobArea = 0.5;  // uncomment if needed
  /*
    If this flag is set to "true", VIDA will try to maintain permanent
    identifiers of detected blobs that seem to be a continuation of the
    movement of objects detected earlier - this prevents random changes of
    identifiers when changing the number and location of detected blobs.
  */
  myVida.trackBlobsFlag = false;
  /*
    Normalized value of the distance between the tested blobs of the current
    and previous generation, which allows treating the new blob as the
    continuation of the "elder".
  */
  //myVida.trackBlobsMaxNormDist = 0.3; // uncomment if needed
  /*
    VIDA may prefer smaller blobs located inside larger or the opposite: reject
    smaller blobs inside larger ones. The mechanism can also be completely
    disabled. Here are the possibilities:
      [your vida object].REJECT_NONE_BLOBS
      [your vida object].REJECT_INNER_BLOBS
      [your vida object].REJECT_OUTER_BLOBS
    The default value is REJECT_NONE_BLOBS.
  */
  //myVida.rejectBlobsMethod = myVida.REJECT_NONE_BLOBS; // uncomment if needed
  /*
    If this flag is set to "true", VIDA will generate polygons that correspond
    approximately to the shape of the blob. If this flag is set to "false", the
    polygons will not be generated. Default vaulue is false. Note: generating
    polygons can be burdensome for the CPU - turn it off if you do not need it.
  */
  myVida.approximateBlobPolygonsFlag = false;
  /*
    Variable (integer) that stores the value corresponding to the number of
    polygon points describing the shape of the blobs. The minimum value of this
    variable is 3.
  */
  myVida.pointsPerApproximatedBlobPolygon = 3;

  frameRate(30); // set framerate
}

function draw() {
  if (myCapture !== null && myCapture !== undefined) {
    // safety first
    background(0, 0, 0);
    /*
      Call VIDA update function, to which we pass the current video frame as a
      parameter. Usually this function is called in the draw loop (once per
      repetition).
    */
    myVida.update(myCapture);
    /*
      Now we can display images: source video (mirrored) and subsequent stages
      of image transformations made by VIDA.
    */
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    CAMARAS

    push();
    //image(myVida.backgroundImage, 320, 0);
    //image(myVida.differenceImage, 0, 0, windowWidth, windowHeight);
    blendMode(DIFFERENCE);
    fill(255);
    rect(0, 0, width, height);
    image(myVida.thresholdImage, 0, 0, windowWidth, windowHeight);


    image(myVida.currentImage, 0, 0, windowWidth, windowHeight);

    pop();
    // let's also describe the displayed images

    // text('vida: progressive background image', 340, 20);
    //text('vida: difference image', 20, 260);
    //text('vida: threshold image', 340, 260);
    /*
      VIDA has two built-in versions of the function drawing detected blobs:
        [your vida object].drawBlobs(x, y);
      and
        [your vida object].drawBlobs(x, y, w, h);
      But we want to create our own drawing function, which at the same time
      will be used for the current handling of blobs and reading their
      parameters.
      To manually get to the data describing detected blobs we call the
      [your vida object].getBlobs() function, which returns an array containing
      detected blobs. This function (although it does not make any
      time-consuming calculations) should be called at most once per draw()
      loop, because (if you do not use VIDA in an unusual way, you trickster)
      the parameters of the blobs do not change within one frame.
    */
    var temp_blobs = myVida.getBlobs();
    // define size of the drawing
    var temp_w = width;
    var temp_h = height;
    // offset from the upper left corner
    var offset_x = 0;
    var offset_y = 0;
    // pixel-based blob coords
    var temp_rect_x,
      temp_rect_y,
      temp_rect_w,
      temp_rect_h,
      temp_mass_center_x,
      temp_mass_center_y;


    push(); // store current drawing style and font
    translate(offset_x, offset_y); // translate coords
    // set text style and font
    textFont("Helvetica", 10);
    textAlign(LEFT, BOTTOM);
    textStyle(NORMAL);



    // let's iterate over all detected blobs and draw them
    for (var i = 0; i < temp_blobs.length; i++) {

      // convert norm coords to pixel-based
      temp_rect_x = Math.floor(temp_blobs[i].normRectX * temp_w);
      temp_rect_y = Math.floor(temp_blobs[i].normRectY * temp_h);
      temp_rect_w = Math.floor(temp_blobs[i].normRectW * temp_w);
      temp_rect_h = Math.floor(temp_blobs[i].normRectH * temp_h);
      temp_mass_center_x = Math.floor(temp_blobs[i].normMassCenterX * temp_w);
      temp_mass_center_y = Math.floor(temp_blobs[i].normMassCenterY * temp_h);

      if (temp_blobs[i].isNewFlag == true && misParticulas.length < 15) {
        if (frameCount % 5 == 0) {
          misParticulas.push(new Particula(temp_mass_center_x, temp_mass_center_y, 200));
        }
      }

      // draw bounding box
      strokeWeight(2);
      stroke(255);
      noFill();
      rect(temp_rect_x, temp_rect_y, temp_rect_w, temp_rect_h);
      // draw mass center
      noStroke();
      fill(255);
      ellipseMode(CENTER);
      // image(miImagen,temp_mass_center_x, temp_mass_center_y); ////////////////////////////////////////////////////////////////

      // buffer1.image(miImagen,temp_mass_center_x, temp_mass_center_y); ////////////////////////////////////////////////////////////////

      // ellipse(temp_mass_center_x, temp_mass_center_y, 30, 30); ////////////////////////////////////////////////////////////////
      // print id
      ///  noStroke(); fill(255, 255 , 0);
     // text(temp_blobs[i].id, temp_rect_x, temp_rect_y - 1);
      // draw approximated polygon (if available)
      strokeWeight(1);
      stroke(255);
      noFill();
          }
    pop(); // restore memorized drawing style and font
  } else {
    /*
      If there are problems with the capture device (it's a simple mechanism so
      not every problem with the camera will be detected, but it's better than
      nothing) we will change the background color to alarmistically red.
    */
    background(255, 0, 0);
  }

  if (misParticulas.length >= 5) { //shfalsfahdsgfkhjasgdfkjhagsdfkhjgad
    misParticulas.pop();
  }
  print(misParticulas.length + ":" + frameRate());

  for (let i = misParticulas.length - 1; i >= 0; i--) {
    misParticulas[i].dibujar();
    if (misParticulas[i].vida < 1) {
      misParticulas.splice(i, 1);


    }

  }
  push();
  blendMode(DIFFERENCE);
  buffer1.fill(255, 15);
  buffer1.rect(0, 0, windowWidth, windowHeight);
  image(buffer1, 0, 0, windowWidth, windowHeight);
  pop();
}
function mouseReleased() {
  agregarParticula();
}

function agregarParticula() {
  misParticulas.push(new Particula(mouseX, mouseY, 5));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Particula {
  //posX, posY, tamanio
  constructor(posX, posY, tamanio) {
    this.vida = 255;
    this.posX = posX;
    this.posY = posY;
    this.tamanio = tamanio;
    this.vel = 4;
    this.dir = random(radians(360));
  }

  dibujar() {
    push();


    this.vida -= 20;

    this.dir += radians(random(-10, 10));

    let dx = this.vel * cos(this.dir);
    let dy = this.vel * sin(this.dir);
    this.posX += dx;
    this.posY += dy;

    this.posX = (this.posX > width ? this.posX - width : this.posX);
    this.posX = (this.posX < 0 ? this.posX + width : this.posX);
    this.posY = (this.posY > height ? this.posY - height : this.posY);
    this.posY = (this.posY < 0 ? this.posY + height : this.posY);
    fill(255, 255, 255, this.vida);
    imageMode(CENTER);
    buffer1.tint(this.vida);
    buffer1.image(miImagen, this.posX, this.posY, this.tamanio, this.tamanio);

    // ellipse(this.posX, this.posY, this.tamanio, this.tamanio);
    pop();

  }





}

// This code runs once when an instance is created. this.x = x; this.y = y; this.size = size;

