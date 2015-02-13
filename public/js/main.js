var container, stats;
var controls, renderer;
var objects = [], plane;
var objects2 = [];
var socket = io();
var boss;
var actualizador;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();

var INTERSECTED, SELECTED;

socket.on('update object', function(object, index) {
  objects[index].position.set(object.position.x, object.position.y, object.position.z);
  objects[index].rotation.set(object.rotation._x, object.rotation._y, object.rotation._z);
});

$.get("connect", function(data) {
  boss = data;
  console.log('soy boss?: ' + data);
  if(boss) {
    socket.emit('update objects', objects2);
  }
  init(boss);
  animate();
});

function init(boss) {
  container = document.createElement('div');
  document.body.appendChild(container);

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  var geometry = new THREE.BoxGeometry( 40, 40, 40 );

  if(boss) {
    for ( var i = 0; i < 200; i ++ ) {
      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffffff } ) );

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

      scene.add( object );

      objects.push( object );

      objects2.push({
        position : object.position,
        rotation : object.rotation,
        scale : object.scale
      });

    }

    postInit()

  } else {
    $.get( "objects", function(data) {
      objectsO = data;
      for(i in objectsO) {
        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
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
    });
  }
}

function postInit() {
  plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
  );
  plane.visible = false;
  scene.add( plane );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;

  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;

  container.appendChild( renderer.domElement );

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> + <a href="http://socket.io/" target="_blank">socket.io</a> | webgl + websockets - draggable cubes';
  container.appendChild( info );

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

function onDocumentMouseMove( event ) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  if ( SELECTED ) {
    var intersects = raycaster.intersectObject( plane );
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
      plane.lookAt( camera.position );
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
  socket.emit('update object', {position:object.position, rotation:object.rotation}, index);
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