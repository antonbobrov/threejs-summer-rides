vec2 withParallax(vec2 inUv, vec2 mouse) {
  float factor = 0.1;

  vec2 coords = inUv;
  coords -= vec2(0.5);
  coords /= 1.0 + factor * 2.0;
  coords += vec2(0.5);

  coords = vec2(
    coords.x + mouse.x * factor / 2.0, 
    coords.y - mouse.y * factor / 2.0
  );
  
  return coords;
}
