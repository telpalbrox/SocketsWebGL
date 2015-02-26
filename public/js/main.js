var INITIAL_NUM_CUBES = 1;

var container, stats;
var objects = [];
var socket = io();
var boss;
var actualizador;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var lastMouse = new THREE.Vector2();
var displacement = new THREE.Vector2();
var offset = new THREE.Vector3();

var INTERSECTED, SELECTED;

//Change color vars
var changeColor = false; //cube
var originalR;
var originalG;
var originalB;

var actual = (new Date()).getTime();
var antiguo;
var tiempoPasado; //Tiempo pasado, en milisegundos, desde el último frame
var tiempoCambio = 1000; //Tiempo, en milisegundos, que tarda en cambiar el color
var porcentaje = 0;
var creciendo = true;

socket.on('update object', function(object, index) {
  var cubeToUpdate = objects[index];

  cubeToUpdate.position.set(object.position.x, object.position.y, object.position.z);
  cubeToUpdate.rotation.set(object.rotation._x, object.rotation._y, object.rotation._z);
});

socket.on('change object color', function(object, index) {
  var cubeToUpdate = objects[index];

  //check if the one changed is the selected
  if (changeColor && objects.indexOf(changeColor) == index) {
    originalR = object.r;
    originalG = object.g;
    originalB = object.b;
  } else {
    cubeToUpdate.material.color.r = object.r;
    cubeToUpdate.material.color.g = object.g;
    cubeToUpdate.material.color.b = object.b;
  }
});

socket.on('create object', function(object) {
  var cube = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: new THREE.Color(object.color.r, object.color.g, object.color.b)  } ) );
  cube.material.ambient = cube.material.color;

  cube.position.x = object.position.x;
  cube.position.y = object.position.y;
  cube.position.z = object.position.z;

  cube.rotation.x = object.rotation._x;
  cube.rotation.y = object.rotation._y;
  cube.rotation.z = object.rotation._z;

  cube.scale.x = object.scale.x;
  cube.scale.y = object.scale.y;
  cube.scale.z = object.scale.z;

  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(cube);
  objects.push(cube);
});

socket.on('delete object', function(index) {
  var toRemove = objects[index];
  scene.remove(toRemove);  
  objects.splice(index, 1);

  //check if the one deleted is the selected
  if (changeColor && objects.indexOf(changeColor) == -1) {
    //Reseteamos variables
    changeColor = false;
    porcentaje = 0;
    creciendo = true;
  }
});

$.get("connect", function(data) {
  init(data);
});

function init(boss) {
  container = document.getElementById('container');

  if (boss) {
    var objectsToEmit = initBoss();
    postInit();
    animate();
    emitObjects(objectsToEmit);
  } else {
    initNormal();
  }
}

function initBoss() {
  var objectsToEmit = [];

  for ( var i = 0; i < INITIAL_NUM_CUBES; i ++ ) {
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random()*0xffffff } ) );

    object.material.ambient = object.material.color;

    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600 - 300;
    object.position.z = Math.random() * 800 - 400;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() * 2 + 1;
    object.scale.y = Math.random() * 2 + 1;
    object.scale.z = Math.random() * 2 + 1;

    object.castShadow = true;
    object.receiveShadow = true;

    scene.add(object);
    objects.push(object);

    objectsToEmit.push({
      position : object.position,
      rotation : object.rotation,
      scale : object.scale,
      color : {
        r : object.material.color.r,
        g : object.material.color.g,
        b: object.material.color.b
      }
    });
  }

  return objectsToEmit;
}

function emitObjects(objects) {
  socket.emit('update objects', objects);
}

function initNormal() {
  $.get( "objects", function(data) {
    objectsO = data;
    for(i in objectsO) {
      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: new THREE.Color(objectsO[i].color.r, objectsO[i].color.g, objectsO[i].color.b)  } ) );
      object.material.ambient = object.material.color;

      object.position.x = objectsO[i].position.x;
      object.position.y = objectsO[i].position.y;
      object.position.z = objectsO[i].position.z;

      object.rotation.x = objectsO[i].rotation._x;
      object.rotation.y = objectsO[i].rotation._y;
      object.rotation.z = objectsO[i].rotation._z;

      object.scale.x = objectsO[i].scale.x;
      object.scale.y = objectsO[i].scale.y;
      object.scale.z = objectsO[i].scale.z;

      object.castShadow = true;
      object.receiveShadow = true;

      scene.add( object );
      objects.push(object);
    }

    postInit();
    animate();
  });
}

function postInit() {
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function degreeToRads(degree) {
  return degree*(Math.PI/180);
}

function onDocumentMouseMove( event ) {
  event.preventDefault();

  //Guardamos el valor de la posición anterior del ratón
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;

  //Obtenemos la posición nueva
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  //Obtenemos el desplazamiento (en porcentaje sobre 1)
  displacement.x = mouse.x - lastMouse.x;
  displacement.y = mouse.y - lastMouse.y;

  raycaster.setFromCamera( mouse, camera );

  if ( SELECTED ) {
    var intersects = raycaster.intersectObject( plane );
    if (!intersects[0]) return; //Quick, dirty fix

    SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
    moveObjectEmit(SELECTED);
    return;
  }

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) {
        INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
      }

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

      plane.position.copy( INTERSECTED.position );
      plane.lookAt( camera.position ); //El plano mira a la camara

    }

    container.style.cursor = 'pointer';

  } else {
    if ( INTERSECTED ) {
      INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
    }

    INTERSECTED = null;
    container.style.cursor = 'auto';
  }
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
  var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
  var intersects = raycaster.intersectObjects( objects );

  if (changeColor) {
    changeColor.material.color.r = originalR;
    changeColor.material.color.g = originalG;
    changeColor.material.color.b = originalB;

    changeColor = false; //clean erase color

    porcentaje = 0;
    creciendo = true;
  }

  if ( intersects.length > 0 ) {
    controls.enabled = false;

    SELECTED = intersects[ 0 ].object;
    changeColor = SELECTED; // Cube to change color

    originalR = SELECTED.material.color.r;
    originalG = SELECTED.material.color.g;
    originalB = SELECTED.material.color.b;

    var intersects = raycaster.intersectObject( plane );
    offset.copy( intersects[ 0 ].point ).sub( plane.position );

    container.style.cursor = 'move';
  }
}

function onDocumentMouseUp( event ) {
  event.preventDefault();
  controls.enabled = true;

  if ( INTERSECTED ) {
    plane.position.copy( INTERSECTED.position );
    moveObjectEmit(INTERSECTED);
    SELECTED = null;
  }

  container.style.cursor = 'auto';
}

function moveObjectEmit(object) {
  var index = objects.indexOf(object);
  socket.emit('update object', {position:object.position, rotation:object.rotation, color: object.material.color}, index);
}

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function functChangeColor() {
  changeColor.material.color.r = originalR + porcentaje;
  changeColor.material.color.g = originalG + porcentaje;
  changeColor.material.color.b = originalB + porcentaje;    
}

function functUpdateColor() {
  tiempoPasado = actual - antiguo;

  if (creciendo) {
    porcentaje += tiempoPasado / tiempoCambio;
    functChangeColor();

    if (porcentaje > 0.999) {
      creciendo = false;
      return;
    }
  } else {
    porcentaje -= tiempoPasado / tiempoCambio;
    functChangeColor();

    if (porcentaje < 0.001) {
      creciendo = true;
      return;
    }
  }
}

function render() {
  //Get time
  antiguo = actual;
  actual = (new Date()).getTime();

  //update color
  if (changeColor) {
    functUpdateColor();
  }

  //update rest
  controls.update();
  renderer.render( scene, camera );  
}
