var camera;

function createCamera() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

	camera.position.z = 1000;
}

createCamera();