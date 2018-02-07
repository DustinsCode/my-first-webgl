#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 colors;

void main() {
	gl_FragColor = vec4(colors, 1.0);
}
