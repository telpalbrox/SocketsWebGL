var scene, renderer, plane;
var geometry = new THREE.BoxGeometry(40, 40, 40);

function createScene() {
	//Create the scene
	scene = new THREE.Scene();

	//We add an ambient light
	scene.add( new THREE.AmbientLight( 0x505050 ) );

	//And now we add a directional light
	var light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.castShadow = true;

	light.shadowCameraNear = camera.near;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = camera.fov;

	light.shadowBias = -0.00022;
	light.shadowDarkness = 0.5;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	scene.add(light);
}

function createRenderer() {
	plane = new THREE.Mesh(
	    new THREE.PlaneBufferGeometry( 5000, 5000, 8, 8 ),
	    new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
	);
	plane.visible = false;
	scene.add(plane);

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	renderer.shadowMapEnabled = false;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	renderer.shadowCameraNear = camera.near;
	renderer.shadowCameraFar = camera.far;
	renderer.shadowCameraFov = camera.fov;
}

createScene();
createRenderer();