// Get signal from microphone
var tracks =[];
var isMobile = !!navigator.userAgent.match(/iphone|android/ig) || false;

/*
* WebGl Three.js code
*/

var scene,
camera,
debugCamera,
renderer,
element,
container,
effect,
fps,
controls,
player,
mapCube,
mapTexture,
cubeMaterial,
djbox,
songPlane,
songContext,
songMaterial,
button, //just to test
testSphere, //just to test
clock,
container,
hemiLight,
guidat;
var debugContext;
var blocks=[];
var spheres=[];
var debugSpheres=[];
var sHost = window.location.origin;
var socket = io.connect(sHost);
var materials = (function(){
   var m = {};
   m.basicBlack = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.1 } );
   m.basicGreen = new THREE.MeshBasicMaterial( { color: 0x4A8C66, transparent: true, opacity: 0.8 } );
   m.basicBlue = new THREE.MeshBasicMaterial( { color: 0x4A668C, transparent: true, opacity: 0.8 } );
   m.basicRed = new THREE.MeshBasicMaterial( { color: 0x9E1A1A, transparent: true, opacity: 0.8 } );
   m.basicWhite = new THREE.MeshBasicMaterial( { color: 0xfefefe } );
   m.transparentWhite = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
   m.cubeMaterial = new THREE.MeshLambertMaterial();
   m.leftSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true, transparent: true, opacity: 0.1 } );
   m.rightSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true, transparent: true, opacity: 0.9 } );
   m.trackSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xfefefe, wireframe:true,transparent: true, opacity: 0.1 } );
   return m;
})();

var geometries = (function(){
   var g = {};
   g.scale = 1;
   g.playerGeometry = new THREE.BoxGeometry(4, 4, 4);
   g.basicCube = new THREE.BoxGeometry(g.scale, g.scale, g.scale);
   g.basicSphere = new THREE.SphereGeometry(g.scale, g.scale, g.scale);
   g.octahedron = new THREE.OctahedronGeometry(g.scale);
   g.ring = new THREE.RingGeometry(g.scale, 5*g.scale, 16*g.scale);
   g.tork = new THREE.TorusKnotGeometry(getRandomInt(3,4)*g.scale, getRandomInt(1,3)*g.scale,100*g.scale,getRandomInt(10,16)*g.scale);
   g.iso = new THREE.IcosahedronGeometry(g.scale);
   return g;
})();

var songInfo = (function() {
    var s = {};
    s.context = null;
    s.browsingSong = "";
    s.leftSong = "";
    s.rightSong = "";
    s.setBrowsingSong = function(title) {
        s.clearBrowsingSong();
        s.context.fillText(title, 120, 69);
        s.browsingSong = title;
    };
    s.setLeftSong = function(title) {
        s.clearLeftSong();
        s.context.fillText(title, 80, 499);
        s.leftSong = title;
    };
    s.setRightSong = function(title) {
        s.clearRightSong();
        songContext.fillText(title, 330, 499);
        s.rightSong = title;
    };
    s.clearBrowsingSong = function() {
        s.context.clearRect(0, 60, 500, 15);
        s.browsingSong = "";
    };
    s.clearLeftSong = function() {
        s.context.clearRect(70, 490, 235, 20);
        s.leftSong = "";
    };
    s.clearRightSong = function() {
        s.context.clearRect(320, 490, 235, 20);
        s.rightSong = "";
    };
    return s;
})();

var djControls = (function() {
   var djc = {};
   djc.leftSphereID = 1;
   djc.rightSphereID = 2;

   djc.mesh = new THREE.Mesh();
   // 2 sets of buttons below each turny thing
   djc.leftButtons = {
       play : createButton(1.1, .5, -5.4, -16.62),
       cue : createButton(1.1, .5, -6.76, -16.62)
   }
   djc.rightButtons = {
       play : createButton(1.1, .5, 6.76, -16.62),
       cue : createButton(1.1, .5, 5.4, -16.62)
   }
   // djc.leftPlayButton = createButton(1.1, .5, -5.4, -16.62);
   // djc.leftCueButton = createButton(1.1, .5, -6.76, -16.62);
   // djc.rightPlayButton = createButton(1.1, .5, 6.76, -16.62);
   // djc.rightCueButton = createButton(1.1, .5, 5.4, -16.62)

   // song selection cylinder
   djc.mesh.add(createKnob(.45, 0, -22.4));
   // two queing buttons
   djc.mesh.add(createButton(.7, .4, -1.45, -21));
   djc.mesh.add(createButton(.7, .4, 1.45, -21));
   // top left controls
   djc.mesh.add(createButton(1.2, 1.2, -3.1, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, -4.6, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, -6.1, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, -7.6, -25.7));
   djc.mesh.add(createKnob(.2, -3.1, -27.3));
   djc.mesh.add(createKnob(.2, -4.6, -27.3));
   djc.mesh.add(createKnob(.2, -6.15, -27.3));
   djc.mesh.add(createKnob(.2, -7.6, -27.3));
   // top right controls
   djc.mesh.add(createButton(1.2, 1.2, 3.1, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, 4.6, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, 6.1, -25.7));
   djc.mesh.add(createButton(1.2, 1.2, 7.6, -25.7));
   djc.mesh.add(createKnob(.2, 3.1, -27.3));
   djc.mesh.add(createKnob(.2, 4.6, -27.3));
   djc.mesh.add(createKnob(.2, 6.15, -27.3));
   djc.mesh.add(createKnob(.2, 7.6, -27.3));

   // Slider tricks!
   djc.setSliderValue = function(slider, midiVal) {
       sliderVal = midiToSlider(midiVal, slider.range);
       if (slider.horizontal) { // horizontal movement
           slider.mesh.position.x = sliderVal;
           rSphereOpacity = (midiVal%128)/127;
           materials.rightSphereMaterial.opacity = Math.max(rSphereOpacity, 0.1);
           materials.leftSphereMaterial.opacity = Math.max(1-rSphereOpacity, 0.1);

           if ((midiVal >= 127) && (slider.prevMidi < 127)) {         // shift spheres left
               var tween = new TWEEN.Tween({v: player.position.z})
                               .to({v: -12.2}, 300)
                               .easing(TWEEN.Easing.Cubic.In)
                                .onStart(function() {
                                    djc.rightButtons.play.material = djc.leftButtons.play.material;
                                    djc.rightButtons.cue.material = djc.leftButtons.cue.material;
                                    djc.leftButtons.play.material = materials.transparentWhite;
                                    djc.leftButtons.cue.material = materials.transparentWhite;
                                    songInfo.setRightSong(songInfo.leftSong);
                                    songInfo.clearLeftSong();
                                    //setControllerSpheres(true);
                                })
                               .onUpdate(function() {
                                   player.position.z = this.v;
                               }).start();
           }
           else if ((midiVal < 127) && (slider.prevMidi >= 127)) {     // shift spheres right
               var tween = new TWEEN.Tween({v: player.position.z})
                               .to({v: 0}, 300)
                               .easing(TWEEN.Easing.Cubic.In)
                                .onStart(function() {
                                    djc.leftButtons.play.material = djc.rightButtons.play.material;
                                    djc.leftButtons.cue.material = djc.rightButtons.cue.material;
                                    djc.rightButtons.play.material = materials.transparentWhite;
                                    djc.rightButtons.cue.material = materials.transparentWhite;
                                    songInfo.setLeftSong(songInfo.rightSong);
                                    songInfo.clearRightSong();
                                    //setControllerSpheres(true);
                                })
                               .onUpdate(function() {
                                   player.position.z = this.v;
                               }).start();
               player.position.z = 0;
           }
       }
       else { // vertical movement
           slider.mesh.position.z = -sliderVal;
           if ((midiVal >= 127) && (slider.prevMidi <= 127)) {
               var tween = new TWEEN.Tween({v: player.position.x})
                               .to({v: -16}, 300)
                               .easing(TWEEN.Easing.Cubic.In)
                               .onStart(function() {
                                   djc.leftButtons.play.material = materials.transparentWhite;
                                   djc.rightButtons.play.material = materials.transparentWhite;
                                   djc.leftButtons.cue.material = materials.transparentWhite;
                                   djc.rightButtons.cue.material = materials.transparentWhite;
                                   songInfo.clearLeftSong();
                                   songInfo.clearRightSong();
                                })
                               .onUpdate(function() {
                                   player.position.x = this.v;
                               }).start();
               //player.position.x = -16;
           }
           else if ((midiVal <= 127) && (slider.prevMidi >= 127)) {
               var tween = new TWEEN.Tween({v: player.position.x})
                               .to({v: 0}, 300)
                               .easing(TWEEN.Easing.Cubic.In)
                                .onStart(function() {
                                    djc.leftButtons.play.material = materials.transparentWhite;
                                    djc.rightButtons.play.material = materials.transparentWhite;
                                    djc.leftButtons.cue.material = materials.transparentWhite;
                                    djc.rightButtons.cue.material = materials.transparentWhite;
                                    songInfo.clearRightSong();
                                    songInfo.clearLeftSong();
                                })
                               .onUpdate(function() {
                                   player.position.x = this.v;
                               }).start();
               //player.position.x = 0;
           }
       }
       slider.prevMidi = midiVal;
   }

   djc.xSlider = spawnSlider(.3, .9, 1.13, -16.5, -1.13, 1.13);
   djc.ySlider = spawnSlider(.9, .3, 0, -17.75, 17.75, 19.8);
   djc.lSlider = spawnSlider(.9, .3, -1.4, -19.2, 17.75, 19.8);
   djc.rSlider = spawnSlider(.9, .3, 1.4, -19.2, 17.75, 19.8);

   function spawnSlider(width, length, x, y, min, max) {
       var s = {};
       s.horizontal = width < length;    // check orientation
       s.mesh = createSliderPiece(width, length, x, y);
       s.range = [min, max];
       s.prevMidi = s.horizontal ? 255 : 0;
       return s;
   }
   function midiToSlider(midiVal, sliderRange) {
       midiRange = [0, 255];
       return ( midiVal - midiRange[ 0 ] ) * ( sliderRange[ 1 ] - sliderRange[ 0 ] ) / ( midiRange[ 1 ] - midiRange[ 0 ] ) + sliderRange[ 0 ];
   }
   function createSliderPiece(width, length, x, y) {
       var sliderPiece = new THREE.Mesh(new THREE.BoxGeometry(width, 0.22, length), materials.transparentWhite);
       sliderPiece.position.set(x, -4.7, y);
       djc.mesh.add(sliderPiece);
       return sliderPiece;
   }
   function createButton(width, length, x, y) {
       var button = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, length), materials.transparentWhite);
       button.position.set(x, -4.85, y);
       djc.mesh.add(button);
       return button;
   }
   function createKnob(radius, x, y) {
       var knob = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .8, 32), materials.transparentWhite);
       knob.position.set(x, -4.6, y);
       return knob;
   }
   return djc;
})();

//Before the BIGBANG
init();
//After the BIGBANG

/*
* WebSockets Socket.io client code
*/

socket.on('connect', function(){
   console.log("connect!");
   if(guidat)
       socket.emit('control', guidat);
});

socket.on('v', function(data){
       console.log("move vertical: %d", data)
       djControls.setSliderValue(djControls.ySlider, data*2);
});

socket.on('h', function(data){
       console.log("move horizontal: %d", data)
       djControls.setSliderValue(djControls.xSlider, 255-data*2);
});

socket.on('t', function(data){
       console.log(data)
       var buttons;
       if (data.side == 'l') {
           buttons = djControls.leftButtons;
           songInfo.setLeftSong(data.filename);
       }
       else if (data.side == 'r') {
           buttons = djControls.rightButtons;
           songInfo.setRightSong(data.filename);
       }
       if (data.action == 'play') {
           buttons.play.material = materials.basicGreen;
           buttons.cue.material = materials.transparentWhite;
       } else if (data.action == 'pause') {
           buttons.play.material = materials.basicBlue;
           buttons.cue.material = materials.transparentWhite;
       } else if (data.action == 'cue') {
           buttons.play.material = materials.transparentWhite
           buttons.cue.material = materials.basicRed;
       }
});

socket.on('b', function(data) {
    console.log(data);
    songInfo.setBrowsingSong(data);
});

socket.on('apply', function (data) {
   //Add testing controls handled by dat gui
   guidat.scale = data;
});

socket.on('movePlayer', function(data){
       if(data.u && controls)
           player.translateZ( -data.u);
       else if(data.b && controls)
           player.translateZ(data.b);
       else if(data.l && controls)
           player.translateX(-data.l);
       else if(data.r && controls)
           player.translateX(data.r);
});

/*
* Three.js
*/

function init() {
   scene = new THREE.Scene();

   //Camera
   camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 5000);
   camera.target = new THREE.Vector3( 0, 150, 0 );
   camera.position.set(0, 10, 0);

   //Playa' please!
   player = new THREE.Mesh( geometries.playerGeometry, materials.basicBlack );
   player.position.set(0,10,-12.2);
   player.add(camera);
   scene.add(player);

   //FPS Control
   if(!controls){
       fps = new THREE.FirstPersonControls(player, socket, camera);
       fps.mouseEnabled = false;
   }

   renderer = new THREE.WebGLRenderer();
   element = renderer.domElement;
   container = document.getElementById('webglviewer');
   container.appendChild(element);

   //Stereo effect
   effect = new THREE.StereoEffect(renderer);

   //Device events
   window.addEventListener('deviceorientation', setOrientationControls, true);

   //Display fps
   stats = new Stats();
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.zIndex = 100;
   stats.domElement.style.bottom = '0px';
   stats.domElement.style.right = '0px';
   container.appendChild( stats.domElement );

   //Worlds elements
   initWorldMap();

   //GUI Control
   guidat = new function(){
       this.scale = 1;
       this.stereo = false;
       this.testSphereX = -20;
       this.testSphereY = 12;
       this.testSphereZ = 0;
       this.xSlider = 0;
       this.ySlider = 0;
       //Add more control variables
   }

   //Map
   document.body.appendChild( container );

   var debugCanvas = document.createElement( 'canvas' );
   debugCanvas.width = 305;
   debugCanvas.height = 180;
   debugCanvas.style.position = 'absolute';
   debugCanvas.style.bottom = '10px';
   debugCanvas.style.left = '50%';
   debugCanvas.style.marginLeft = '-136px';
   debugCanvas.style.visibility = 'hidden';

   container.appendChild( debugCanvas );

   debugContext = debugCanvas.getContext( '2d' );
   debugContext.setTransform(1,0,0,1,136,64);
   debugContext.strokeStyle = '#FFFFFF';

   //Cube for drawing canvas
   mapTexture = new THREE.Texture(debugCanvas);
   mapTexture.minFilter = THREE.LinearFilter;
   cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, map: mapTexture });

   mapCube = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), cubeMaterial);
   mapCube.scale.set(10, 0.5, 0.01);
   mapCube.position.set(0, 10, -100);
   //player.add(mapCube);

   // Canvas for writing song names
   var songCanvas = document.createElement('canvas');
   songCanvas.width = 512;
   songCanvas.height = 512;
   songCanvas.style.position = 'absolute';
   songCanvas.style.bottom = '10px';
   songCanvas.style.left = '0%';
   songCanvas.style.visibility = 'hidden';
   container.appendChild(songCanvas);

   songContext = songCanvas.getContext('2d');
   songContext.font = "12px Monospace";
   songContext.fillStyle = "rgba(255,255,255,0.95)";
   songContext.fillText('Browsing:', 120, 50);
   //songContext.fillText('House of the Rising Sun', 120, 69);
   songContext.fillText('L:', 55, 499);
   songContext.fillText('R:', 305, 499);
   songInfo.context = songContext;


   var songTexture = new THREE.Texture(songCanvas);
   mapTexture.minFilter = THREE.LinearFilter;
   songMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, map: songTexture });
   songPlane = new THREE.Mesh(new THREE.BoxGeometry(55, 55, 12), songMaterial);
   //mapCube.scale.set(200, 0.5, 0.01);
   songPlane.position.set(0, -7, -50);
   player.add(songPlane);

   // DJ Controller Box
   var djtexture = THREE.ImageUtils.loadTexture('textures/controller.png');
   djtexture.minFilter = THREE.LinearFilter;
   var djmaterial = new THREE.MeshBasicMaterial({color:0xffffff, map:djtexture});
   var geometry = new THREE.PlaneBufferGeometry(20, 12);
   djbox = new THREE.Mesh(geometry, djmaterial);
   djbox.rotation.x = -Math.PI/2;
   djbox.position.set(0, -5, -22);
   player.add(djbox);
   player.add(djControls.mesh);

   addGUI(guidat);

   //Track sphere
   var spheresGrid = new THREE.Mesh();
   scene.add(spheresGrid);
   spawnSphere(2.8,-20,5,6.1,true, spheresGrid);
   spawnSphere(2.8,-20,5,-6.1,true, spheresGrid);
   spawnSphere(2.8,-20,5,-18.3,true, spheresGrid);

   // ones in front
   spawnSphere(2.8,-36,5,-18.3,true, spheresGrid);
   spawnSphere(2.8,-36,5,-6.1,true, spheresGrid);
   spawnSphere(2.8,-36,5,6.1,true, spheresGrid);

   clock = new THREE.Clock();

   animate();

}

function initWorldMap(){
   //Scenes hemilight - the sky is red inside FL
   //var hemiLight = new THREE.HemisphereLight( 0x9E1A1A, 0x9E1A1A, 1 );
   var hemiLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0.2 );
   hemiLight.position.y = 500;
   scene.add( hemiLight );
   //this.scene.add(new THREE.AmbientLight());

   //Mighty Skydome
   var vertexShader = document.getElementById( 'vertexShader' ).textContent;
   var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
   var uniforms = {
       topColor: 	 { type: "c", value: new THREE.Color( 0x000000 ) },
       bottomColor: { type: "c", value: new THREE.Color( 0x000000 ) },
       offset:		 { type: "f", value: 400 },
       exponent:	 { type: "f", value: 0.6 }
   };
   uniforms.topColor.value.copy( hemiLight.color );

   var skyGeo = new THREE.SphereGeometry( 1000, 32, 15 );
   var skyMat = new THREE.ShaderMaterial( {
       uniforms: uniforms,
       vertexShader: vertexShader,
       fragmentShader: fragmentShader,
       side: THREE.BackSide
   } );

   var sky = new THREE.Mesh( skyGeo, skyMat );
   scene.add( sky );

   //Infinite grid
   var floorTexture = THREE.ImageUtils.loadTexture('textures/grid.jpg');
   floorTexture.wrapS = THREE.RepeatWrapping;
   floorTexture.wrapT = THREE.RepeatWrapping;
   floorTexture.repeat = new THREE.Vector2(50, 50);
   floorTexture.anisotropy = renderer.getMaxAnisotropy();

   var floorMaterial = new THREE.MeshPhongMaterial({
       color: 0xffffff,
       specular: 0xffffff,
       shininess: 1,
       shading: THREE.FlatShading,
       map: floorTexture
   });

   var geometry = new THREE.PlaneBufferGeometry(5000, 5000);

   var floor = new THREE.Mesh(geometry, floorMaterial);
   floor.rotation.x = -Math.PI / 2;
   //scene.add(floor);

   for(var i=0; i<2048; i++)
       spawnCube(getRandomInt(1,10),getRandomInt(-1000,1000),getRandomInt(120,600),getRandomInt(-1000,1000));
   for(var i=0; i<24; i++)
       spawnSphere(getRandomInt(6,16),getRandomInt(-1000,1000),getRandomInt(500,1000),getRandomInt(-1000,1000), false);
}

/*
* Animate and Render
*/

function animate() {
   var time = Date.now();

   //animateBlock(time);
   songMaterial.map.needsUpdate = true;
   requestAnimationFrame(animate);
   //track.panner.setPosition(player.position.x, player.position.y, player.position.z);

   update(clock.getDelta());
   render(clock.getDelta());
}

function update(dt) {
   if(stats) stats.update();
   resize();

   camera.updateProjectionMatrix();
   TWEEN.update();
   if(controls)
       controls.update(dt);
   else
       fps.update(dt);

   // // Canvas 2D Map
   // debugContext.clearRect( -136, -64, 274, 128 );
   //
   // debugContext.beginPath();
   //
   // // camera
   // debugContext.rect( -player.position.z+143, (player.position.x-74)/2.5, 4, 4 );
   // debugContext.closePath();
   // debugContext.stroke();
   //
   // // Tracks
   // for (var i=0; i<spheres.length; i++){
   //     var sphere = spheres[i];
   //     drawDebugSphere(sphere, 'white');
   // }
   //
   //
   // controllerQuadrant = whichQuad();
   // var whichSphere;
   // switch (controllerQuadrant) {
   //     case 0:
   //         drawDebugSphere(spheres[0], 'red');
   //         drawDebugSphere(spheres[1], 'red');
   //         whichSphere = 1;
   //         break;
   //     case 1:
   //         drawDebugSphere(spheres[1], 'red');
   //         drawDebugSphere(spheres[2], 'red');
   //         whichSphere = 2;
   //         break;
   //     case 2:
   //         drawDebugSphere(spheres[4], 'red');
   //         drawDebugSphere(spheres[5], 'red');
   //         whichSphere = 4;
   //         break;
   //     case 3:
   //         drawDebugSphere(spheres[3], 'red');
   //         drawDebugSphere(spheres[4], 'red');
   //         whichSphere = 3;
   //         break;
   //     default:
   // }
   // drawDebugControllerOutline(-spheres[whichSphere].position.z,
   //                             spheres[whichSphere].position.x, 'red');
}

function render(dt) {
   if(isMobile || guidat.stereo)
       effect.render(scene, camera);
   else
       renderer.render(scene, camera);
}

/*
* Helper Functions
*/

function pauseTrack(id){
   tracks[id].source.disconnect();
}

function unpauseTrack(id){
   tracks[id].source.connect(tracks[id].volume)
}


/*
* Util functions
*/

function sendMessage(data){
    console.log(data)
    Object.keys(data).forEach(function(key) {
        data[key] = Math.round(data[key]*10)/10;
    });
    socket.emit('update', data);
}

function addGUI(datObj){
    var gui = new dat.GUI();
    //var customContainer = document.getElementById('guiDat');
    document.body.appendChild(gui.domElement);
    gui.add(datObj, 'stereo', true);
    gui.add(datObj, 'scale', 0.1, 40).onChange(function(v){
        sendMessage(v);
    });
   //  gui.add(datObj, 'testSphereX', -40, 10).onChange(function(v) {
   //      testSphere.position.x = v;
   //  });
   //  gui.add(datObj, 'testSphereY', 0, 20).onChange(function(v) {
   //      testSphere.position.y = v;
   //  });
   //  gui.add(datObj, 'testSphereZ', -20, 20).onChange(function(v) {
   //      testSphere.position.z = v;
   //  });
    gui.add(datObj, 'xSlider', 0, 255).onChange(function(v) {
        djControls.setSliderValue(djControls.xSlider, 255-v);
    });
    gui.add(datObj, 'ySlider', 0, 255).onChange(function(v) {
        djControls.setSliderValue(djControls.ySlider, v);
    });
}

function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if(effect)
        effect.setSize(width, height);
}

function fullscreen() {
   if (container.requestFullscreen) {
       container.requestFullscreen();
   } else if (container.msRequestFullscreen) {
       container.msRequestFullscreen();
   } else if (container.mozRequestFullScreen) {
       container.mozRequestFullScreen();
   } else if (container.webkitRequestFullscreen) {
       container.webkitRequestFullscreen();
   }
}

function getURL(url, callback) {
   var xmlhttp = new XMLHttpRequest();
   xmlhttp.onreadystatechange = function() {
       if (xmlhttp.readyState == 4) {
           if (xmlhttp.status == 200)
               callback(JSON.parse(xmlhttp.responseText));
           else
               console.log('We had an error, status code: ', xmlhttp.status);
       }
   }
   xmlhttp.open('GET', url, true);
   xmlhttp.send();
}

function depCamera(){
   controls = new THREE.OrbitControls(camera, element);
   controls.target.set(
     camera.position.x + 0.15,
     camera.position.y,
     camera.position.z
   );
   controls.noPan = true;
   controls.noZoom = true;
}

function sendConsole(val){
   eval(val);
}

/*
* Keyboard control
*/

window.addEventListener('keydown', function(e) {
       switch(e.keyCode) {
           case 32:
               if(fps) fps.mouseEnabled = !fps.mouseEnabled;
           break;
       }
});
