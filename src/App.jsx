import Image from "./assets/front.png";
import BandImage from "./assets/band.png";
import BackImage from "./assets/back.png";
import { useQueryState } from "nuqs";

import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useControls, Leva } from "leva";
import InvoiceInterface from "./Invoice";
import { generateBannerbearImage } from "./lib"; // Import the Bannerbear function

extend({ MeshLineGeometry, MeshLineMaterial });

useGLTF.preload(
  "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb"
);

// Function to generate Bannerbear URL with user data
function generateBannerbearURL(name, position) {
  const baseURL =
    "https://ondemand.bannerbear.com/simpleurl/Pa37MZkebYndyAorDp/image";

  // URL encode the values
  const encodedName = encodeURIComponent(name || "Name");
  const encodedPosition = encodeURIComponent(position || "Position");

  // Build the URL with message (name) and poste (position)
  return `${baseURL}/message/text/${encodedName}/poste/text/${encodedPosition}`;
}

// Simple Loading Screen Component
function LoadingScreen({ message = "Chargement..." }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {/* Simple Loading Spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>

        {/* Simple Loading Text */}
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  const { debug, flipInterval } = useControls({
    debug: false,
    flipInterval: {
      value: 5,
      min: 1,
      max: 15,
      step: 1,
      label: "Flip Interval (s)",
    },
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isUpdatingBadge, setIsUpdatingBadge] = useState(false);
  const [details, setDetails] = useQueryState("details");
  const [type] = useQueryState("type");
  const [redirecting, setRedirecting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Initial loading delay
  useEffect(() => {
    // Simulate loading time and allow components to initialize
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }, 2000); // 2 second delay

    return () => clearTimeout(loadingTimer);
  }, []);

  // Redirect to registration page if no details or invalid details
  useEffect(() => {
    // Only check for redirect after initial load is complete
    if (!initialLoadComplete) return;

    // Only redirect if there are truly no details and we've tried to parse them
    if (!details || details.trim() === "") {
      console.log("No details found in URL, redirecting to registration");
      setRedirecting(true);
      // Add a small delay to show redirect message
      setTimeout(() => {
        //window.location.href = "https://fanaf-register.vercel.app/register";
      }, 1500);
      return;
    }

    // If we have details but they're invalid, still try to show the page with default data
    // This prevents infinite redirects for malformed URLs
    console.log("Details parameter found:", details);
  }, [details, initialLoadComplete]);

  // Periodic card flipping with customizable interval
  useEffect(() => {
    // Only start flipping after initial load is complete
    if (!redirecting && !isLoading && initialLoadComplete) {
      const flipIntervalMs = flipInterval * 1000; // Convert to milliseconds
      const interval = setInterval(() => {
        setIsFlipped((prev) => !prev);
      }, flipIntervalMs);

      return () => clearInterval(interval);
    }
  }, [flipInterval, redirecting, isLoading, initialLoadComplete]);

  // Helper function to safely decode base64
  const safeAtob = (str) => {
    try {
      // First, try to decode URL-encoded characters
      const urlDecoded = decodeURIComponent(str);
      return atob(urlDecoded);
    } catch (error1) {
      try {
        // If URL decoding fails, try direct base64 decoding
        return atob(str);
      } catch (error2) {
        console.error("Base64 decode failed:", error2);
           //window.location.href = "https://fanaf-register.vercel.app/register";

      }
    }
  };

  // Parse customer data from details
  const customerData = useMemo(() => {
    const defaultData = {
      name: "",
      position: "",
      email: "",
      company: "",
      memberCount: 0,
      totalAmount: "...",
      isMember: true,
    };

    if (!safeAtob(details)) {
      console.log("No details provided, using default data");
      //window.location.href = "https://fanaf-register.vercel.app/register";
      alert("not")

      return defaultData;
    }

    try {
      // Log the raw details for debugging
      console.log("Raw details parameter:", details);

      // Safely decode the base64 string
      const decodedString = safeAtob(details);
      console.log("Decoded string:", decodedString);

      // Parse the JSON
      const parsedData = JSON.parse(decodedString);
      console.log("Parsed data:", parsedData);

      const creator = parsedData.creator;

      if (!creator) {
        console.warn("No creator data found in parsed details");
        return defaultData;
      }

      // Calculate pricing
      const isMember = type === "member" || parsedData.type === "member";
      const basePrice = isMember ? 350000 : 500000;
      let memberCount = 1;

      if (parsedData.member && Array.isArray(parsedData.member)) {
        memberCount = parsedData.member.length;
      }

      const totalAmountFCFA = basePrice * memberCount;

      const result = {
        name:
          `${creator.first_name || ""} ${creator.last_name || ""}`.trim() ||
          "Nom non fourni",
        position: creator.registration_data?.fonction || "Participant",
        email: creator.email || "",
        company: creator.company || "",
        memberCount,
        totalAmount: `${totalAmountFCFA.toLocaleString()} FCFA`,
        isMember,
        fullData: parsedData,
      };

      console.log("Final customer data:", result);
      return result;
    } catch (error) {
      console.error("Failed to parse details:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);

      // Log the details parameter for debugging
      console.log("Problematic details parameter:", details);
      console.log("Details length:", details?.length);
      console.log("Details type:", typeof details);

      return defaultData;
    }
  }, [details, type]);

  // State for badge data
  const [badgeData, setBadgeData] = useState({
    name: customerData.name,
    position: customerData.position,
  });

  // Update badge data when customer data changes
  useEffect(() => {
    setBadgeData({
      name: customerData.name,
      position: customerData.position,
    });
  }, [customerData.name, customerData.position]);


    // Show loading screen while loading, redirecting, or no details
  if (badgeData.name==="" && badgeData.position==="") {
    return (
      <>
        <Leva hidden />
        <LoadingScreen />
      </>
    );
  }


  // Generate dynamic Bannerbear URL based on user data
  const dynamicBannerbearURL = useMemo(() => {
    return generateBannerbearURL(badgeData.name, badgeData.position);
  }, [badgeData.name, badgeData.position]);

  // State for textures
  const [currentTextures, setCurrentTextures] = useState({
    front: Image, // Use dynamic URL
    back: BackImage,
  });

  // Update front texture when dynamic URL changes
  useEffect(() => {
    setCurrentTextures((prev) => ({
      ...prev,
      front: dynamicBannerbearURL,
    }));
  }, [dynamicBannerbearURL]);

  // Keep track of the next texture to avoid flickering
  const [nextFrontTexture, setNextFrontTexture] = useState(null);

  // Back texture options
  const backTextureOptions = [
    BackImage,
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba1?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba2?w=512&h=512&fit=crop",
  ];


  if (redirecting) {
    return (
      <>
        <Leva hidden />
        <LoadingScreen message="Redirection..." />
      </>
    );
  }

  return (
    <div className="relative h-screen bg-white w-full overflow-hidden">
      <Leva hidden={!debug} />

      {/* Invoice Interface - Background Layer */}
      <div className="absolute pt-14 inset-0 z-10">
        <InvoiceInterface customerData={customerData} />
      </div>

      {/* 3D Badge - Overlay Layer */}
      <div className="absolute inset h-[100vh] w-full -top-40 -right-[30%] z-20 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 13], fov: 25 }}
          className="pointer-events-auto"
        >
          <ambientLight intensity={Math.PI} />
          <Physics
            debug={debug}
            interpolate
            gravity={[0, -40, 0]}
            timeStep={1 / 60}
          >
            <Band
              isFlipped={isFlipped}
              frontTexture={currentTextures.front}
              backTexture={currentTextures.back}
              nextFrontTexture={nextFrontTexture}
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

      {/* Debug Information */}
      {debug && (
        <div className="absolute top-4 left-4 z-30 bg-black bg-opacity-50 text-white p-2 rounded">
          <p className="text-sm">
            Card: {isFlipped ? "Back" : "Front"} | Flip every: {flipInterval}s |
            {isUpdatingBadge && " Updating..."}
          </p>
          <p className="text-xs mt-1">
            Name: {badgeData.name} | Position: {badgeData.position}
          </p>
          <p className="text-xs mt-1 break-all">URL: {dynamicBannerbearURL}</p>
        </div>
      )}
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 10,
  isFlipped,
  frontTexture,
  backTexture,
  nextFrontTexture,
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();

  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };

  const { nodes, materials } = useGLTF(
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb"
  );

  // Load both textures
  const bandTexture = useTexture(BandImage);
  const frontTex = useTexture(frontTexture);
  const backTex = useTexture(backTexture);

  // Preload next texture to avoid flickering
  const nextTex = nextFrontTexture ? useTexture(nextFrontTexture) : null;

  const { width, height } = useThree((state) => state.size);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const groupRef = useRef();

  // Create materials for front and back
  const frontMaterialRef = useRef();
  const backMaterialRef = useRef();

  useEffect(() => {
    // Configure textures for proper scaling
    const textures = [frontTex, backTex, nextTex].filter(Boolean);
    textures.forEach((texture) => {
      texture.flipY = false;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Scale texture to cover the surface properly
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      texture.center.set(0, 0);
      texture.needsUpdate = true;
    });
  }, [frontTex, backTex, nextTex]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    // Animate card flip
    const targetRotation = isFlipped ? Math.PI : 0;
    const rotationSpeed = 4;

    if (Math.abs(currentRotation - targetRotation) > 0.01) {
      const newRotation = THREE.MathUtils.lerp(
        currentRotation,
        targetRotation,
        delta * rotationSpeed
      );
      setCurrentRotation(newRotation);
      if (groupRef.current) {
        groupRef.current.rotation.y = newRotation;
      }
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation()
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;

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
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            ref={groupRef}
            scale={2.5}
            position={[0, -1.5, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (
              e.target.releasePointerCapture(e.pointerId), drag(false)
            )}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              )
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
                map-wrapS={THREE.ClampToEdgeWrapping}
                map-wrapT={THREE.ClampToEdgeWrapping}
              />
            </mesh>

            {/* Back face */}
            <mesh
              geometry={nodes.card.geometry}
              position={[0, 0, -0.001]}
              rotation={[0, Math.PI, 0]}
            >
              <meshPhysicalMaterial
                ref={backMaterialRef}
                map={backTex}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
                side={THREE.FrontSide}
                map-wrapS={THREE.ClampToEdgeWrapping}
                map-wrapT={THREE.ClampToEdgeWrapping}
              />
            </mesh>

            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.5}
            />
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
  );
}
