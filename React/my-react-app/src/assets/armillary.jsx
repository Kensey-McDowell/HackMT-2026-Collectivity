import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Armillary({ visible }) {
  const groupRef = useRef()
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()

  const goldMaterial = (
    <meshStandardMaterial 
      color="#d4af37" 
      metalness={1} 
      roughness={0.1} 
      envMapIntensity={2} 
    />
  )

  useFrame((state) => {
    if (!visible) return
    const t = state.clock.elapsedTime

    // Entire group floats gently
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.1
    groupRef.current.rotation.y += 0.005

    // Each ring rotates at different speeds 
    ring1.current.rotation.x = t * 0.8
    ring1.current.rotation.y = t * 0.4

    ring2.current.rotation.y = t * -0.6
    ring2.current.rotation.z = t * 0.3

    ring3.current.rotation.z = t * 0.9
    ring3.current.rotation.x = t * -0.2
  })

  return (
    <group ref={groupRef} scale={visible ? 1 : 0}>
      {/* Central Core */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fff" emissive="#d4af37" emissiveIntensity={2} />
      </mesh>

      {/* Outer Ring 1 */}
      <mesh ref={ring1}>
        <torusGeometry args={[1.2, 0.03, 16, 100]} />
        {goldMaterial}
      </mesh>

      {/* Inner Ring 2*/}
      <mesh ref={ring2}>
        <torusGeometry args={[1.0, 0.03, 16, 100]} />
        {goldMaterial}
      </mesh>

      {/* Inner Ring 3 */}
      <mesh ref={ring3}>
        <torusGeometry args={[0.8, 0.03, 16, 100]} />
        {goldMaterial}
      </mesh>

      {/* Fixed Horizon Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  )
}