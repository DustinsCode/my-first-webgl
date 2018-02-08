var xAdd = 0.0;
var yAdd = 0.0;
var time = Date.now();
var lastUpdate = 0;
var myColor;
var newColors = [Math.random(),Math.random(),Math.random()];
var canvas;
var gl;
var vertices;
var random = true;
var p = 1.0;
var pUp = false;
var color1 = [170/256, 244/256, 66/256];
var color2 = [244/256, 66/256, 173/256];
console.log(newColors);

/**
* Some code from http://www.informit.com/articles/article.aspx?p=2111395&seqNum=3
* was used as a reference to figure out how translations work.
*
* @author Dustin Thurston
**/
function main() {

    this.canvas = document.getElementById("my-canvas");
    this.gl= WebGLUtils.setupWebGL(this.canvas);
    let depthSlider = document.getElementById("incr");
    let depth = depthSlider.value;

    let animSelect = document.getElementById("menu");

    // x1, y1, x2, y2, x3, y3
    this.vertices = [-0.8, -0.6, 0.7, -0.6, -0.5, 0.7];
    let a = [this.vertices[0], this.vertices[1]];
    let b = [this.vertices[2], this.vertices[3]];
    let c = [this.vertices[4], this.vertices[5]];
    this.vertices = createGasket(a, b, c, depth);

    drawProgram(this.gl, this.canvas, this.vertices);
    requestAnimFrame(animRedraw);

    animSelect.addEventListener('change', event => {
       //console.log("change");
        if(this.random === true)
            this.random = false;
        else
            this.random = true;
    });
    // noinspection JSAnnotator
    depthSlider.addEventListener('change', event => {
        depth = depthSlider.value;
        this.vertices = createGasket(a,b,c,depth)
        drawProgram(gl, canvas, this.vertices);
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
        drawProgram(gl, canvas, vertices);
        //window.requestAnimationFrame(drawProgram(gl, canvas, vertices));
    });
}

function drawProgram(gl, canvas, vertices) {
    //Load the shader pair. 2nd arg is vertex shader, 3rd is frag shader
    ShaderUtils.loadFromFile(this.gl, "vshader.glsl", "fshader.glsl")
        .then((prog) => {

            gl.useProgram(prog);
            //Use black RGB=(0,0,0) for the clear color
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            //setup the viewport
            gl.viewport(0, 0, canvas.width, canvas.height);

            // Clear the color buffer
            gl.clear(gl.COLOR_BUFFER_BIT);
            myColor = gl.getUniformLocation(prog, 'colors');
            gl.uniform3fv(myColor, newColors);

            //Handles Translations
            var u_Translation = gl.getUniformLocation(prog, 'u_Translation');
            gl.uniform4f(u_Translation, xAdd, yAdd, 0.0, 0.0);

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
                this.vertices.length / 2);
            /* number of vertices to draw */

        });
    //window.requestAnimFrame(animRedraw);
}

function animRedraw(time){

    if(time - lastUpdate > 100) {
        if(random){
            newColors = [Math.random(), Math.random(), Math.random()];
        }else{
            newColors = interpolation();
        }
        drawProgram(this.gl, this.canvas, this.vertices);
        lastUpdate = time;
    }
    window.requestAnimFrame(animRedraw);
}

function interpolation(){
    if(this.pUp){
        this.p += 0.05;
    }else{
        this.p -= 0.05
    }


    if(this.p <= 0.0){
        this.pUp = true;
        color1 = [Math.random(), Math.random(), Math.random()];
    }else if(this.p >= 1.0){
        color2 = [Math.random(), Math.random(), Math.random()];
        this.pUp = false;
    }
    var r1 = color1[0];
    var g1 = color1[1];
    var b1 = color1[2];
    var r2 = color2[0];
    var g2 = color2[1];
    var b2 = color2[2];

    r = this.p*r1 + (1-this.p)*r2;
    g = this.p*g1 + (1-this.p)*g2;
    b = this.p*b1 + (1-this.p)*b2;

    return [r, g, b];
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
