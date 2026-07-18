
interface Window {
  pgPlaySound?: (sound: 'add' | 'remove' | 'click' | 'snap') => void;
  __joystick?: { x: number; y: number };
}
