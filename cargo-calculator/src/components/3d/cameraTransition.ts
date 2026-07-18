// Общее изменяемое состояние перехода камеры между режимами.
// Намеренно вынесено из React-стейта и zustand: читается/пишется каждый кадр,
// поэтому обновления через store вызывали бы лишние ре-рендеры.
//
// Как это работает:
// 1. startCameraTransition() вызывается при смене режима камеры/машины —
//    CameraController плавно ведёт камеру к пресету выбранного режима.
// 2. Как только камера доехала (или прошло время-страховка), active=false —
//    дальше камерой управляет только пользователь ( OrbitControls / WASD / джойстик ),
//    т.е. «свободная камера».
// 3. Любой ввод пользователя (drag мышью, колесо, клавиши движения) мгновенно
//    отменяет переход через cancelCameraTransition().
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
