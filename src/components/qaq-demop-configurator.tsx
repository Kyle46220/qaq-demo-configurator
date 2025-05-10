'use client'
import React, { useMemo } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

// Define constants for finishes
// const PATTERN_SPACING = 100; // Removed
const finishes = [
  { name: 'Magenta', color: '#80428f' },
  { name: 'Light Grey', color: '#D3D3D3' },
  { name: 'Bronze', color: '#CD7F32' },
];

// Shared Valtio state for screen parameters
const state = proxy({
  screen_width: 1200,
  screen_height: 1800,
  screen_thickness: 8,
  border_margin: 30,
  hole_diameter: 20,
  // pattern_type: 'circle' as 'circle' | 'square' | 'hexagon', // Removed
  finish_color: finishes[0].color,
});
// type PatternType = typeof state.pattern_type; // Removed

export default function Home() {
  const snap = useSnapshot(state);

  // Calculate available width and height for the pattern
  const availableWidth = snap.screen_width - 2 * snap.border_margin;
  const availableHeight = snap.screen_height - 2 * snap.border_margin;

  // Determine number of columns and rows
  const referenceUnit = snap.hole_diameter * 2;
  const cols = Math.max(1, referenceUnit > 0 ? Math.round(availableWidth / referenceUnit) : 1);
  const rows = Math.max(1, referenceUnit > 0 ? Math.round(availableHeight / referenceUnit) : 1);

  // Calculate dynamic pattern spacing for X and Y axes
  const patternSpacingX = cols > 1 ? availableWidth / cols : availableWidth; // If 1 col, effectively means it's centered
  const patternSpacingY = rows > 1 ? availableHeight / rows : availableHeight; // If 1 row, effectively means it's centered


  // Compute number of holes and centering offsets
  const totalSpacingX = (cols - 1) * patternSpacingX;
  const totalSpacingY = (rows - 1) * patternSpacingY;
  const leftoverX = availableWidth - totalSpacingX; // This is the space to be distributed on sides for centering
  const leftoverY = availableHeight - totalSpacingY; // This is the space to be distributed on top/bottom for centering
  const startX = -snap.screen_width / 2 + snap.border_margin + leftoverX / 2;
  const startY = snap.screen_height / 2 - snap.border_margin - leftoverY / 2;

  // Prepare hole positions
  const positions = useMemo(() => {
    const arr: [number, number, number][] = [];
    if (cols <= 0 || rows <= 0) return arr; // Should not happen with Math.max(1, ...)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // For a single column/row, its position should be the center of the available space.
        // The `startX` and `startY` already account for centering the block of holes.
        // If cols = 1, totalSpacingX = 0, leftoverX = availableWidth. startX is center.
        // The position of the first hole (i=0) is startX.
        const xPos = cols === 1 ? startX : startX + i * patternSpacingX;
        const yPos = rows === 1 ? startY : startY - j * patternSpacingY;

        const x = xPos / 1000;
        const y = yPos / 1000;
        const z = snap.screen_thickness / 2000; // mid-thickness
        arr.push([x, y, z]);
      }
    }
    return arr;
  }, [snap.screen_width, snap.screen_height, snap.screen_thickness, snap.border_margin, snap.hole_diameter, cols, rows, startX, startY, patternSpacingX, patternSpacingY]);

  // Helper function to handle CSV download
  const handleDownload = () => {
    handleDownloadLogic(snap);
  };

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
              <label className="block text-sm font-medium mb-1">Width: {snap.screen_width} mm</label>
              <Slider
                value={[snap.screen_width]}
                onValueChange={(val) => (state.screen_width = val[0])}
                min={500}
                max={1500}
                step={10}
              />
            </div>
            {/* Height */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Height: {snap.screen_height} mm</label>
              <Slider
                value={[snap.screen_height]}
                onValueChange={(val) => (state.screen_height = val[0])}
                min={500}
                max={3000}
                step={10}
              />
            </div>
            {/* Thickness */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Thickness: {snap.screen_thickness} mm</label>
              <Slider
                value={[snap.screen_thickness]}
                onValueChange={(val) => (state.screen_thickness = val[0])}
                min={6}
                max={25}
                step={1}
              />
            </div>
            {/* Border Margin */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Border Margin: {snap.border_margin} mm</label>
              <Slider
                value={[snap.border_margin]}
                onValueChange={(val) => (state.border_margin = val[0])}
                min={10}
                max={200}
                step={5}
              />
            </div>
            {/* Hole Diameter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Hole Diameter: {snap.hole_diameter} mm</label>
              <Slider
                value={[snap.hole_diameter]}
                onValueChange={(val) => (state.hole_diameter = val[0])}
                min={10}
                max={200}
                step={1}
              />
            </div>
            {/* Pattern Type - REMOVED
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
            */}
            {/* Finish - NEW */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Finish</label>
              <div className="flex space-x-2">
                {finishes.map((finish) => (
                  <button
                    key={finish.name}
                    onClick={() => (state.finish_color = finish.color)}
                    className={`w-10 h-10 rounded border-2 ${snap.finish_color === finish.color ? 'border-blue-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: finish.color }}
                    title={finish.name}
                  />
                ))}
              </div>
            </div>
            {/* Download Button */}
            <div className="mt-6">
              <Button 
                onClick={handleDownload} 
                className="w-full"
                style={{ backgroundColor: '#80428f' }}
              >
                Download Configuration
              </Button>
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
                <boxGeometry
                  args={[snap.screen_width / 1000, snap.screen_height / 1000, snap.screen_thickness / 1000]}
                />
                <meshStandardMaterial color={snap.finish_color} />
              </mesh>

              {/* Hole pattern */}
              {positions.map((pos, idx) => (
                <mesh
                  key={idx}
                  position={pos}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry
                    args={[
                      snap.hole_diameter / 2000,
                      snap.hole_diameter / 2000,
                      snap.screen_thickness / 1000 + 0.001,
                      32,
                    ]}
                  />
                  <meshStandardMaterial color="#fff" />
                </mesh>
              ))}
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to handle CSV download
const handleDownloadLogic = (snap: typeof state) => {
  const csvRows = [
    "Name,Unit,Expression,Value,Comments,Favorite" // Header
  ];

  const params = [
    { name: 'screen_width', unit: 'mm', value: snap.screen_width },
    { name: 'screen_height', unit: 'mm', value: snap.screen_height },
    { name: 'screen_thickness', unit: 'mm', value: snap.screen_thickness },
    { name: 'border_margin', unit: 'mm', value: snap.border_margin },
    { name: 'hole_diameter', unit: 'mm', value: snap.hole_diameter },
    { name: 'finish_color', unit: '', value: snap.finish_color } 
  ];

  params.forEach(p => {
    const expression = String(p.value);
    const val = String(p.value);
    csvRows.push(`${p.name},${p.unit},${expression},${val},,FALSE`);
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "fusion_parameters.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
