varying vec2 vUv;
varying float depth;

uniform vec2 u_mouse;
uniform float u_mouseIntensity;
uniform sampler2D u_map;
uniform float u_depthPerspective;

void main() {
  vUv = uv;
  vec3 transformed = vec3(position);
  
  vec2 coords = withParallax(vUv, u_mouse);

  vec2 mapUv = vec2(coords.x * 0.5, coords.y);
  vec4 mapColor = texture2D(u_map, mapUv);

  // pinch
  vec2 center = vec2(0.5, 0.5);
  float pinch = distance(center, vUv);
  pinch = pinch * pinch;
  
  // pinch deform
  transformed.z += pinch * u_depthPerspective / 3.0;
  
  // depth
  depth = (mapColor.r + mapColor.g, mapColor.b) / 3.0;
  transformed.z += depth * u_depthPerspective;

  // hover depth
  float hoverCircle = distance(u_mouse, vUv);
  hoverCircle = 1.0 - smoothstep(0.0, 1.0, hoverCircle);
  transformed.z += hoverCircle * u_mouseIntensity * u_depthPerspective * depth;
  
  // output
  gl_PointSize = max(30.0 * depth, 3.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}