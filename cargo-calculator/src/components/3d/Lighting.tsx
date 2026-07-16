export function Lighting() {
  return (
    <>
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.25}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={24}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-3, 3, -2]} intensity={0.55} color={0xf8fbff} />
      <directionalLight position={[0, 2.5, -5]} intensity={0.85} color={0xe0f2fe} />
      <ambientLight intensity={0.38} />
      <pointLight position={[0, 2.35, -0.8]} intensity={0.65} color={0xffffee} distance={8} />
    </>
  );
}
