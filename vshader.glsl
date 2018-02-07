attribute vec4 vertexPos; //each incoming vertex is (x,y)
uniform vec4 u_Translation;
void main() {
	gl_PointSize = 1.0;
	gl_Position = vertexPos + u_Translation;
}
