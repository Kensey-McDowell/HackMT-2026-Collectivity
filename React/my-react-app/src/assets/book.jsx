import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function Page({ index, totalPages, scrollRef, isCover = false }) {
  const pivot = useRef();

  const geometry = useMemo(() => {
    let geo;
    if (isCover) {
      geo = new THREE.BoxGeometry(2.1, 3.1, 0.05); 
      geo.translate(1.05, 0, 0); 
    } else {
      geo = new THREE.PlaneGeometry(2, 3, 25, 25);
      geo.translate(1, 0, 0);
    }
    return geo;
  }, [isCover]);

  useFrame(() => {
    if (!pivot.current) return;
    const progress = scrollRef.current;

    const pageT = THREE.MathUtils.clamp(
      (progress - index / (totalPages + 1)) * (totalPages + 1),
      0,
      1
    );

    pivot.current.rotation.y = -Math.PI * pageT;

    const landingLift = isCover ? 0 : pageT * 0.06; 
    pivot.current.position.z = (index * 0.001) + landingLift;

    if (!isCover) {
      const pos = geometry.attributes.position;
      const bend = Math.sin(pageT * Math.PI) * 0.4;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, Math.sin((x / 2) * Math.PI) * bend);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={pivot}>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color={isCover ? "#4b2e1e" : "#f5e9c8"} 
          side={THREE.DoubleSide} 
          roughness={isCover ? 0.7 : 0.85} 
        />
      </mesh>
    </group>
  );
}

export default function Book({ scrollRef }) {
  const pageCount = 10;

  return (
    <group rotation={[-Math.PI / 6, 0, 0]} position={[0.1, 0, 0]}>
      
      {/* BACK COVER */}
      <mesh position={[1.05, 0, -0.1]}>
        <boxGeometry args={[2.1, 3.1, 0.12]} />
        <meshStandardMaterial color="#351f14" roughness={0.9} />
      </mesh>

      {/* FRONT COVER & PAGES */}
      {Array.from({ length: pageCount + 1 }).map((_, i) => (
        <Page
          key={i}
          index={i}
          totalPages={pageCount}
          scrollRef={scrollRef}
          isCover={i === 0}
        />
      ))}

      {/* SPINE */}
      <mesh position={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.12, 0.12, 3.1, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2a180d" />
      </mesh>
    </group>
  );
}