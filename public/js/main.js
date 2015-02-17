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

socket.on('update object', function(object, index) {
  objects[index].position.set(object.position.x, object.position.y, object.position.z);
  objects[index].rotation.set(object.rotation._x, object.rotation._y, object.rotation._z);
});

<<<<<<< HEAD
=======
socket.on('create object', function(object, index) {
  objects.push(object);
});

socket.on('delete object', function(index) {
  objects.splice(index, 1);
});

/*$.get("connect", function(data) {
  boss = data;
  console.log('soy boss?: ' + data);
  init(boss);
  animate();
  if (boss) {
    socket.emit('update objects', objects2);
  }
});*/

>>>>>>> origin/master
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

  for ( var i = 0; i < 200; i ++ ) {
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

  if ( intersects.length > 0 ) {
    controls.enabled = false;

    SELECTED = intersects[ 0 ].object;

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

function render() {
  controls.update();
  renderer.render( scene, camera );
}
