export const cameraTransition = {
  active: true,
  startedAt: 0,
};

export function startCameraTransition() {
  cameraTransition.active = true;
  cameraTransition.startedAt = performance.now();
}

export function cancelCameraTransition() {
  cameraTransition.active = false;
}
