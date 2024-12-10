import { vevet } from 'vevet';
import { WebglManager } from './webgl/Manager';
import { Video } from './Video';

const managerContainer = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(managerContainer, {
  rendererProps: {
    dpr: vevet.viewport.lowerDpr,
    antialias: false,
  },
  cameraProps: {
    perspective: 3000,
    far: 10000,
    near: 1,
  },
});

manager.play();

const video = document.createElement('video');
video.src = './compoite_mini.mp4';
video.autoplay = true;
video.loop = true;
video.muted = true;

video.addEventListener(
  'loadedmetadata',
  () =>
    new Video({
      manager,
      video,
      aspect: video.videoWidth / video.videoHeight / 2,
      depthPerspective: Math.sqrt(
        window.screen.width ** 2 + window.screen.height ** 2,
      ),
    }),
);

managerContainer.append(video);
