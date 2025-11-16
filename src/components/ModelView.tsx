import { Suspense } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  useGLTF,
  Bounds,
  Html,
} from "@react-three/drei";
import CanvasErrorBoundary from "./CanvasErrorBoundary";

interface ModelViewProps {
  url: string; // всегда .glb
  quality?: "full" | "thumb";
}

const GLBModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

export default function ModelView({
  url,
  quality = "full",
}: ModelViewProps): ReactNode {
  return (
    <CanvasErrorBoundary fallbackText="Ошибка загрузки модели">
      <Canvas camera={{ position: [2.5, 2, 2.5], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Suspense
          fallback={
            <Html center>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </Html>
          }
        >
          {quality === "full" ? (
            <Bounds fit clip observe>
              <GLBModel url={url} />
            </Bounds>
          ) : (
            <Center>
              <GLBModel url={url} />
            </Center>
          )}
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.1} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
