import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function OvalChain({ visible }) {
  const group = useRef();
  const links = useRef([]);
  const localTime = useRef(0);

  useFrame((state, delta) => {
    if (!visible || !group.current) return;

    // Advance only while visible
    localTime.current += delta;

    const t = localTime.current;

    links.current.forEach((link, i) => {
      if (!link) return;

      const wave = Math.sin(t * 2 + i * 0.4) * 0.3;
      const waveZ = Math.cos(t * 1.5 + i * 0.3) * 0.1;

      link.position.y = wave;
      link.position.z = waveZ;

      const flip = i % 2 === 0 ? 0 : Math.PI;
      const isEven = i % 2 === 0;
      link.rotation.z =
        (isEven ? 0 : Math.PI) +
        Math.cos(t * 2 + i * 0.4) * 0.2;
      link.rotation.y = Math.sin(t + i) * 0.1;
    });
  });

  return (
    <group ref={group} visible={visible} scale={1.35}>
      {Array.from({ length: 16 }).map((_, i) => {
        const isEven = i % 2 === 0;

        return (
          <mesh
            key={i}
            ref={(el) => (links.current[i] = el)}
            position={[i * 0.38 - 2.8, 0, 0]}
            rotation={[isEven ? 0 : Math.PI / 2, 0, 0]}
            scale={[1.8, 1, 1]}
          >
            <torusGeometry args={[0.2, 0.035, 16, 48]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1}
              roughness={0.08}
              envMapIntensity={2.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}