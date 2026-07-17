import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Project } from "../../types";

interface ProjectCard3DProps {
    project: Project;
    position: [number, number, number];
    onClick: (project: Project) => void;
}

// Troika text has no line-clamp equivalent, so truncate manually to approximate it.
const truncate = (text: string, max: number) =>
    text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

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
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
            meshRef.current.rotation.y,
            hovered ? 0.3 : 0,
            0.08
        );
        // Scale punch on hover — makes interactivity unmistakable at canvas scale
        const targetScale = hovered ? 1.1 : 1;
        meshRef.current.scale.setScalar(
            THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
        );
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
                    emissiveIntensity={hovered ? 1.2 : 0.08}
                />

                <Text
                    position={[0, 0.55, 0.06]}
                    fontSize={0.22}
                    maxWidth={2.6}
                    lineHeight={1.1}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    color="#A7FFEB"
                    outlineWidth={0.006}
                    outlineColor="#001A14"
                >
                    {truncate(project.title, 40)}
                </Text>

                <Text
                    position={[0, 0.15, 0.06]}
                    fontSize={0.1}
                    letterSpacing={0.15}
                    anchorX="center"
                    anchorY="middle"
                    color="#A7FFEB"
                    fillOpacity={0.85}
                >
                    {project.category}
                </Text>

                <Text
                    position={[0, -0.35, 0.06]}
                    fontSize={0.09}
                    maxWidth={2.6}
                    lineHeight={1.3}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    color="#FFFFFF"
                    fillOpacity={0.7}
                >
                    {truncate(project.description, 90)}
                </Text>
            </mesh>
        </group>
    );
};
