import {
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector2,
  VideoTexture,
} from 'three';
import { lerp, NCallbacks, scoped, vevet } from 'vevet';
import { addEventListener, IAddEventListener } from 'vevet-dom';
import { TProps } from './types';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import withParallaxShader from './shaders/withParallax.glsl';

const scale = 0.8;

export class Video {
  private get props() {
    return this._props;
  }

  private _startSize: { width: number; height: number };

  private _texture: VideoTexture;

  private _mesh: Points | Mesh;

  private _geometry: PlaneGeometry;

  private _material: ShaderMaterial;

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  private _listeners: IAddEventListener[] = [];

  private _mouse = {
    target: new Vector2(0, 0),
    current: new Vector2(0, 0),
  };

  private _mouseIntensity = { target: 0, current: 0 };

  constructor(private _props: TProps) {
    const { manager, video, aspect, depthPerspective } = _props;

    const startWidth = manager.width * scale;
    const startHeight = startWidth / aspect;

    // create geometry
    this._texture = new VideoTexture(video);

    // save initial sizes
    this._startSize = { width: startWidth, height: startHeight };

    // create geometry
    const points = 300;
    this._geometry = new PlaneGeometry(startWidth, startHeight, points, points);

    // create shader material
    this._material = new ShaderMaterial({
      vertexShader: withParallaxShader + vertexShader,
      fragmentShader: withParallaxShader + fragmentShader,
      transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_aspect: { value: startWidth / startHeight },
        u_mouse: { value: this._mouse.current },
        u_mouseIntensity: { value: this._mouseIntensity.current },
        u_map: { value: this._texture },
        u_depthPerspective: { value: depthPerspective },
      },
    });

    // create mesh
    this._mesh = new Points(this._geometry, this._material);
    manager.scene.add(this._mesh);

    // resize
    this._callbacks.push(manager.callbacks.add('resize', () => this._resize()));

    // render
    this._callbacks.push(manager.callbacks.add('render', () => this._render()));

    // mouse move
    this._listeners.push(
      addEventListener(window, 'mousemove', (evt) => this._onMouseMove(evt)),
    );
  }

  /** Resize the scene */
  private _resize() {
    const { _startSize: startSize, props } = this;

    const width = props.manager.width * scale;
    const height = width / props.aspect;

    // calculate mesh scale
    const widthScale = width / startSize.width;
    const heightScale = height / startSize.height;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);

    // uniforms
    this._material.uniforms.u_aspect.value = width / height;
  }

  /** Render the scene */
  private _render() {
    const { fpsMultiplier } = this.props.manager;
    const { uniforms } = this._material;

    this._mouse.current.lerp(this._mouse.target, 0.1 * fpsMultiplier);

    this._mouseIntensity.current = lerp(
      this._mouseIntensity.current,
      this._mouseIntensity.target,
      0.1 * fpsMultiplier,
    );

    this._mouseIntensity.target = lerp(
      this._mouseIntensity.target,
      0,
      0.2 * fpsMultiplier,
    );

    uniforms.u_time.value += 1 * fpsMultiplier;
    uniforms.u_mouseIntensity.value = this._mouseIntensity.current;

    this._mesh.rotation.y = this._mouse.current.x * Math.PI * 0.2;
    this._mesh.rotation.x = this._mouse.current.y * Math.PI * -0.05;
  }

  private _onMouseMove(evt: MouseEvent) {
    this._mouse.target = new Vector2(
      scoped(evt.clientX / vevet.viewport.width, [0.5, 1]),
      scoped(1 - evt.clientY / vevet.viewport.height, [0.5, 1]),
    );

    this._mouseIntensity.target = Math.min(
      this._mouseIntensity.target + 0.1,
      1,
    );
  }

  /** Destroy the scene */
  public destroy() {
    this.props.manager.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();
    this._texture.dispose();

    this._callbacks.forEach((event) => event.remove());
  }
}
