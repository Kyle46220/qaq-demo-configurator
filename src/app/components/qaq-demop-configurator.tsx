import React, { useMemo } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider, SliderTrack, SliderRange, SliderThumb } from '@/components/ui/slider';

// Shared Valtio state for screen parameters
const state = proxy({
  screen_width: 1200,
  screen_height: 1800,
  screen_thickness: 8,
  border_margin: 30,
  pattern_spacing: 100,
  hole_diameter: 20,
  pattern_type: 'circle' as 'circle' | 'square' | 'hexagon',
});
type PatternType = typeof state.pattern_type;

export default function Home() {
  const snap = useSnapshot(state);

  // Compute number of holes and centering offsets
  const cols = Math.floor((snap.screen_width - 2 * snap.border_margin) / snap.pattern_spacing);
  const rows = Math.floor((snap.screen_height - 2 * snap.border_margin) / snap.pattern_spacing);
  const totalSpacingX = (cols - 1) * snap.pattern_spacing;
  const totalSpacingY = (rows - 1) * snap.pattern_spacing;
  const leftoverX = snap.screen_width - 2 * snap.border_margin - totalSpacingX;
  const leftoverY = snap.screen_height - 2 * snap.border_margin - totalSpacingY;
  const startX = -snap.screen_width / 2 + snap.border_margin + leftoverX / 2;
  const startY = snap.screen_height / 2 - snap.border_margin - leftoverY / 2;

  // Prepare hole positions
  const positions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (startX + i * snap.pattern_spacing) / 1000;
        const y = (startY - j * snap.pattern_spacing) / 1000;
        const z = snap.screen_thickness / 2000; // mid-thickness
        arr.push([x, y, z]);
      }
    }
    return arr;
  }, [snap.screen_width, snap.screen_height, snap.screen_thickness, snap.border_margin, snap.pattern_spacing]);

  return (
    <Card className="m-4 shadow-lg">
      <CardHeader>
        <CardTitle>Screen Configurator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[80vh]">
          {/* Controls Panel */}
          <div className="w-72 pr-4 overflow-y-auto">
            {/* Width */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Width (mm)</label>
              <Slider
                value={[snap.screen_width]}
                onValueChange={(val) => (state.screen_width = val[0])}
                min={500}
                max={3000}
                step={10}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Height */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Height (mm)</label>
              <Slider
                value={[snap.screen_height]}
                onValueChange={(val) => (state.screen_height = val[0])}
                min={500}
                max={3000}
                step={10}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Thickness */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Thickness (mm)</label>
              <Slider
                value={[snap.screen_thickness]}
                onValueChange={(val) => (state.screen_thickness = val[0])}
                min={1}
                max={50}
                step={1}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Border Margin */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Border Margin (mm)</label>
              <Slider
                value={[snap.border_margin]}
                onValueChange={(val) => (state.border_margin = val[0])}
                min={0}
                max={200}
                step={5}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Spacing */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Spacing (mm)</label>
              <Slider
                value={[snap.pattern_spacing]}
                onValueChange={(val) => (state.pattern_spacing = val[0])}
                min={10}
                max={500}
                step={5}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Hole Diameter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Hole Diameter (mm)</label>
              <Slider
                value={[snap.hole_diameter]}
                onValueChange={(val) => (state.hole_diameter = val[0])}
                min={1}
                max={200}
                step={1}
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            {/* Pattern Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pattern Type</label>
              <select
                value={snap.pattern_type}
                onChange={(e) => (state.pattern_type = e.target.value as PatternType)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>
          </div>
          {/* 3D Preview */}
          <div className="flex-1">
            <Canvas camera={{ position: [0, 0, 1.5] }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[1, 1, 1]} />
              <OrbitControls />

              {/* Panel mesh */}
              <mesh position={[0, 0, snap.screen_thickness / 2000]}>
                <boxBufferGeometry
                  args={[snap.screen_width / 1000, snap.screen_height / 1000, snap.screen_thickness / 1000]}
                />
                <meshStandardMaterial color="#ddd" />
              </mesh>

              {/* Hole pattern */}
              {positions.map((pos, idx) => (
                <mesh
                  key={idx}
                  position={pos}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderBufferGeometry
                    args={[
                      snap.hole_diameter / 2000,
                      snap.hole_diameter / 2000,
                      snap.screen_thickness / 1000 + 0.001,
                      32,
                    ]}
                  />
                  <meshStandardMaterial color="#444" />
                </mesh>
              ))}
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
