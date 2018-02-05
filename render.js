function main() {
    // noinspection JSAnnotator
    let canvas = document.getElementById("my-canvas");

    let depthSlider = document.getElementById("incr");
    let depth = depthSlider.value;
    //setupWebGL is defined in webgl-utils.js
    // noinspection JSAnnotator
    var gl = WebGLUtils.setupWebGL(canvas);
    var xAdd = 0.0;
    var yAdd = 0.0;

    drawProgram(gl,canvas,depth, xAdd, yAdd);
    // noinspection JSAnnotator
    depthSlider.addEventListener('change', event => {
        depth = depthSlider.value;
        drawProgram(gl,canvas,depth, xAdd, yAdd);
    });

    window.addEventListener('keydown', event => {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
            case 'W':
                if(yAdd <=1)
                    yAdd += 0.1;
                break;
            case 'A':
                if(xAdd >= -1)
                    xAdd += -0.1;
                break;
            case 'S':
                if(yAdd >= -1)
                    yAdd += -0.1;
                break;
            case 'D':
                if(xAdd <= 1)
                    xAdd += 0.1;
                break;
        }
        window.requestAnimationFrame(drawProgram(gl, canvas, depth, xAdd, yAdd));
    });
}

function drawProgram(gl, canvas, depth, xAdd, yAdd, newColors) {
    //Load the shader pair. 2nd arg is vertex shader, 3rd is frag shader
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then((prog) => {

            gl.useProgram(prog);
            //Use black RGB=(0,0,0) for the clear color
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            //setup the viewport
            gl.viewport(0, 0, canvas.width, canvas.height);

            // Clear the color buffer
            gl.clear(gl.COLOR_BUFFER_BIT);

            //Handles Translations
            var u_Translation = gl.getUniformLocation(prog, 'u_Translation');
            var u_Texture = gl.getUniformLocation(prog, 'u_Texture');
            gl.uniform4f(u_Translation, xAdd, yAdd, 0.0, 0.0);
            gl.uniform1i(u_Texture, 5);


    // x1, y1, x2, y2, x3, y3
            let vertices = [-0.8, -0.6, 0.7, -0.6, -0.5, 0.7];
            let a = [vertices[0], vertices[1]];
            let b = [vertices[2], vertices[3]];
            let c = [vertices[4], vertices[5]];
            vertices = createGasket(a, b, c, depth);
            //Create WebGL Buffer and Populate
            // noinspection JSAnnotator
            let vertexBuff = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);

            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

            //Obtain Reference to Vertex Shader Attribute
            // vertexPos is an attribute name in vertex Shader
            // noinspection JSAnnotator
            let posAttr = gl.getAttribLocation(prog, "vertexPos");
            gl.enableVertexAttribArray(posAttr);

            //Specify Layout of Shader Attribute
            gl.vertexAttribPointer(posAttr,
                2, /*each attr has TWO components (x,y) */
                gl.FLOAT, /*each component is a 32bit float*/
                false, /*data does not require normalization into "unit" range*/
                0, /*stride=0: the attr's are tightly packet*/
                0);
            /*offset=0: the first byte of the buffer is the actual data*/

            gl.drawArrays(gl.TRIANGLES,
                0, /* starting index in the array */
                vertices.length / 2);
            /* number of vertices to draw */

        });
}

function animRedraw(time){

    if(time - lastUpdate > 250) {

        lastUpdate = time;
    }

    window.requestAnimFrame(animRedraw(time));
}

/**
 * ~~~R E C U R S I V E  T R I A N G L E  D U D E~~~
 * @param a point A (x,y)
 * @param b point B (x,y)
 * @param c point C (x,y)
 * @param depth like simile deep or metaphor deep?
 * @returns {string[] | string | S[]}
 */
function createGasket (a, b, c, depth) {

	//if not base case
	if(depth > 0){
		//subtract 1 from depth
		depth -= 1;

		//calculate midpoints
		let midPoint1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
		let midPoint2 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
		let midPoint3 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];

		//Generate a triangle for
		let triangle1ish = createGasket(a, midPoint1, midPoint2, depth);
		let triangle2ish = createGasket(b, midPoint1, midPoint3, depth);
		let triangle3ish = createGasket(c, midPoint3, midPoint2, depth);

		return triangle1ish.concat(triangle2ish.concat(triangle3ish));

		//base case.  returns points of small triangle
	}else{
		return a.concat(b.concat(c));
	}
}
