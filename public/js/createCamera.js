var camera, controls;

function createCamera() {
	camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 3200;
}

function createControls() {
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	renderer.shadowCameraNear = camera.near;
	renderer.shadowCameraFar = camera.far;
	renderer.shadowCameraFov = camera.fov;
}

createCamera();
createControls();