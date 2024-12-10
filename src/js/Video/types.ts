import { WebglManager } from '../webgl/Manager';

export type TProps = {
  manager: WebglManager;
  video: HTMLVideoElement;
  aspect: number;
  depthPerspective: number;
};