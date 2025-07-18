"use client"

import * as THREE from "three"
import { useEffect, useRef, useState } from "react"
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber"
import { useGLTF, useTexture, Environment, Lightformer } from "@react-three/drei"
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from "@react-three/rapier"
import { MeshLineGeometry, MeshLineMaterial } from "meshline"
import { useControls } from "leva"
import InvoiceInterface from "./Invoice"

extend({ MeshLineGeometry, MeshLineMaterial })

useGLTF.preload(
  "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb",
)

// Sample texture options - replace with your actual images
const textureOptions = {
  front: [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=512&h=512&fit=crop",
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg",
    "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1557683304-673a23048d34?w=512&h=512&fit=crop"
  ],
  back: [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop",
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg",
    "https://images.unsplash.com/photo-1557804506-669a67965ba1?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba2?w=512&h=512&fit=crop"
  ]
}

export default function App() {
  const { debug } = useControls({ debug: false })
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentTextures, setCurrentTextures] = useState({
    front: textureOptions.front[0],
    back: textureOptions.back[0]
  })

  return (
    <div className="relative h-screen bg-white w-full overflow-hidden">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-50 space-y-2">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="block w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
        >
          {isFlipped ? "🔄 Show Front" : "🔄 Show Back"}
        </button>
        
        <div className="bg-black bg-opacity-75 p-3 rounded-lg text-white text-sm">
          <div className="mb-2">
            <label className="block text-xs mb-1">Front Texture:</label>
            <select 
              value={currentTextures.front}
              onChange={(e) => setCurrentTextures(prev => ({...prev, front: e.target.value}))}
              className="w-full bg-gray-700 text-white p-1 rounded text-xs"
            >
              {textureOptions.front.map((url, i) => (
                <option key={i} value={url}>Front Design {i + 1}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs mb-1">Back Texture:</label>
            <select 
              value={currentTextures.back}
              onChange={(e) => setCurrentTextures(prev => ({...prev, back: e.target.value}))}
              className="w-full bg-gray-700 text-white p-1 rounded text-xs"
            >
              {textureOptions.back.map((url, i) => (
                <option key={i} value={url}>Back Design {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Interface - Background Layer */}
      <div className="absolute pt-14 inset-0 z-10">
        <InvoiceInterface />
      </div>

      {/* 3D Badge - Overlay Layer */}
      <div className="absolute inset h-[100vh] z-20 w-full -top-40 -right-[30%] z-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 13], fov: 25 }} className="pointer-events-auto">
          <ambientLight intensity={Math.PI} />
          <Physics debug={debug} interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band 
              isFlipped={isFlipped} 
              frontTexture={currentTextures.front}
              backTexture={currentTextures.back}
            />
          </Physics>
          <Environment background={false} blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Canvas>
      </div>
    </div>
  )
}

function Band({ maxSpeed = 50, minSpeed = 10, isFlipped, frontTexture, backTexture }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef()
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3()

  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  }

  const { nodes, materials } = useGLTF(
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb",
  )
  
  // Load both textures
  const bandTexture = useTexture(
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg",
  )
  const frontTex = useTexture(frontTexture)
  const backTex = useTexture(backTexture)
  
  const { width, height } = useThree((state) => state.size)

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
  )

  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)
  const [currentRotation, setCurrentRotation] = useState(0)
  const groupRef = useRef()

  // Create materials for front and back
  const frontMaterialRef = useRef()
  const backMaterialRef = useRef()

  useEffect(() => {
    // Configure textures
    frontTex.flipY = false
    backTex.flipY = false
    frontTex.wrapS = frontTex.wrapT = THREE.RepeatWrapping
    backTex.wrapS = backTex.wrapT = THREE.RepeatWrapping
  }, [frontTex, backTex])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab"
      return () => void (document.body.style.cursor = "auto")
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    // Animate card flip
    const targetRotation = isFlipped ? Math.PI : 0
    const rotationSpeed = 4

    if (Math.abs(currentRotation - targetRotation) > 0.01) {
      const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, delta * rotationSpeed)
      setCurrentRotation(newRotation)
      if (groupRef.current) {
        groupRef.current.rotation.y = newRotation
      }
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }

    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })

      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))

      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = "chordal"
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            ref={groupRef}
            scale={2.5}
            position={[0, -1.5, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* Front face */}
            <mesh geometry={nodes.card.geometry} position={[0, 0, 0.001]}>
              <meshPhysicalMaterial
                ref={frontMaterialRef}
                map={frontTex}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
                side={THREE.FrontSide}
              />
            </mesh>
            
            {/* Back face */}
            <mesh geometry={nodes.card.geometry} position={[0, 0, -0.001]} rotation={[0, Math.PI, 0]}>
              <meshPhysicalMaterial
                ref={backMaterialRef}
                map={backTex}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
                side={THREE.FrontSide}
              />
            </mesh>
            
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.5} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={bandTexture}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}