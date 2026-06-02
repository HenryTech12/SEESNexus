import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { Project } from "../../types";

interface ProjectCard3DProps {
    project: Project;
    position: [number, number, number];
    onClick: (project: Project) => void;
}

export const ProjectCard3D: React.FC<ProjectCard3DProps> = ({
    project,
    position,
    onClick,
}) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y =
            position[1] + Math.sin(time + position[0]) * 0.1;
        if (hovered) {
            meshRef.current.rotation.y = THREE.MathUtils.lerp(
                meshRef.current.rotation.y,
                0.2,
                0.1
            );
        } else {
            meshRef.current.rotation.y = THREE.MathUtils.lerp(
                meshRef.current.rotation.y,
                0,
                0.1
            );
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => onClick(project)}
            >
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial
                    color={hovered ? "#004D40" : "#002D22"}
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#A7FFEB"
                    emissiveIntensity={hovered ? 0.5 : 0.1}
                />

                <Html transform distanceFactor={5} position={[0, 0, 0.06]}>
                    <div className="w-[300px] h-[200px] flex flex-col items-center justify-center text-white pointer-events-none p-4 select-none">
                        <h3 className="text-xl font-bold mb-2 text-center text-glow-mint">
                            {project.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-sees-mint/20 rounded border border-sees-mint/30 uppercase tracking-widest mb-4">
                            {project.category}
                        </span>
                        <p className="text-[10px] text-center opacity-70 line-clamp-2">
                            {project.description}
                        </p>
                    </div>
                </Html>
            </mesh>
        </group>
    );
};
