varying vec2 vUv;
varying float depth;

uniform vec2 u_mouse;
uniform sampler2D u_map;

void main() {
  vec2 coords = withParallax(vUv, u_mouse);

  vec2 mapUv = vec2(0.5 + coords.x * 0.5, coords.y);
  vec3 mapColor = texture2D(u_map, mapUv).rgb;

  // alpha depending on depth
  float alphaDepth = max(depth * 2.0, 0.1);

  // crcle alpha
  vec2 center = vec2(0.5, 0.5);
  float circleAlpha = distance(center, vUv);
  circleAlpha = 1.0 - smoothstep(0.45, 0.5, circleAlpha);

  // alpha
  float alpha = alphaDepth * circleAlpha;

  // output
  gl_FragColor = vec4(mapColor, alpha);
}