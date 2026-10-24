"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Core() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.18;
    g.rotation.x += delta * 0.05;
    // ease toward the pointer for a parallax tilt
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * 0.35, 0.05);
    g.position.y = THREE.MathUtils.lerp(g.position.y, state.pointer.y * 0.25, 0.05);
    if (inner.current) inner.current.rotation.y -= delta * 0.4;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#1d3c86" metalness={0.6} roughness={0.25} flatShading emissive="#0a1a3f" />
      </mesh>
      {[2.3, 2.75].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2.4 + i * 0.5, i * 0.6, 0]}>
          <torusGeometry args={[r, 0.008, 8, 160]} />
          <meshBasicMaterial color={i ? "#7dd3fc" : "#ffffff"} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ count = 900 }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // seeded PRNG (mulberry32) keeps the star field identical across renders
    let seed = 0x5eed;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + rand() * 4.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y -= delta * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#bae6fd" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={40} color="#38bdf8" />
      <pointLight position={[-5, -3, 2]} intensity={25} color="#ffffff" />
      <Core />
      <Particles />
    </Canvas>
  );
}
