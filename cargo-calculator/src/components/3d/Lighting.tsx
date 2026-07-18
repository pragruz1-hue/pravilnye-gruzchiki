import { useCalculatorStore } from '../../store/useCalculatorStore';

export function Lighting() {
  const isNightMode = useCalculatorStore((s) => s.isNightMode);
  return (
    <>
      <directionalLight
        position={[5, 6, 4]}
        intensity={isNightMode ? 0.25 : 1.25}
        color={isNightMode ? 0x99bbff : 0xffffff}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={24}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-3, 3, -2]} intensity={isNightMode ? 0.15 : 0.55} color={isNightMode ? 0x4455aa : 0xf8fbff} />
      <directionalLight position={[0, 2.5, -5]} intensity={isNightMode ? 0.2 : 0.85} color={isNightMode ? 0x5566cc : 0xe0f2fe} />
      <ambientLight intensity={isNightMode ? 0.18 : 0.38} color={isNightMode ? '#1e293b' : '#ffffff'} />
      {/* Cargo bay interior lights */}
      <pointLight position={[0, 1.5, 0]} intensity={isNightMode ? 2.2 : 0.65} color={isNightMode ? '#ff8c2a' : '#ffffee'} distance={12} decay={2} />
      <pointLight position={[-1, 1.2, 0]} intensity={isNightMode ? 1.2 : 0.25} color={isNightMode ? '#ff6b00' : '#fff7cc'} distance={6} />
      {/* Glowing lamps when night */}
      {isNightMode && (
        <>
          <pointLight position={[-0.2, 2.0, 0]} intensity={1.0} color="#ffae4a" distance={5} />
          <spotLight position={[0, 3, 0]} angle={0.9} penumbra={0.5} intensity={isNightMode ? 0.8 : 0} color="#ffd7a0" castShadow />
        </>
      )}
    </>
  );
}
