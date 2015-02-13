var scene;

function createScene() {
	//Create the scene
	scene = new THREE.Scene();

	//We add an ambient light
	scene.add( new THREE.AmbientLight( 0x505050 ) );

	//And now we add a directional light
	var light = new THREE.SpotLight(0xffffff, 1.5);
	light.position.set(0, 500, 2000);
	light.castShadow = true;

	light.shadowCameraNear = 200;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;

	light.shadowBias = -0.00022;
	light.shadowDarkness = 0.5;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	scene.add(light);
}

createScene();