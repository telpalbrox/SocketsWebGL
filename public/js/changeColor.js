actualColor = {	r: 0, g: 0, b: 0 }

$('#changeColor').change(function(color) {
	actualColor = hexToRgbFloat(this.value);

	if (changeColor) {
		porcentaje = 0;
    	creciendo = true;

    	originalR = actualColor.r;
    	originalG = actualColor.g;
    	originalB = actualColor.b;

    	socket.emit('change object color', actualColor, objects.indexOf(changeColor));
	}
});

function deleteCube() {
	if (changeColor) {
		//Eliminamos el seleccionado
		var index = objects.indexOf(changeColor);
		objects.splice(index, 1);
		scene.remove(changeColor);

		//Reseteamos variables
		changeColor = false;
		porcentaje = 0;
    	creciendo = true;

    	socket.emit('delete object', index);
	}
}

function hexToRgbInt(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexToRgbFloat(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var flotante = 256.0;
    return result ? {
        r: parseInt(result[1], 16) / flotante,
        g: parseInt(result[2], 16) / flotante,
        b: parseInt(result[3], 16) / flotante
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}