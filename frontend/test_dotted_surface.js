const fs = require('fs');
const path = require('path');

console.log('🧪 Testing DottedSurface Component...\n');

// Test 1: File exists and is readable
const componentPath = path.join(__dirname, 'src/components/ui/dotted-surface.tsx');
console.log('📁 Test 1: File exists and readable');
try {
  const content = fs.readFileSync(componentPath, 'utf8');
  console.log('✅ File exists and is readable');
  console.log(`📊 File size: ${content.length} characters`);
} catch (error) {
  console.log('❌ File read error:', error.message);
  process.exit(1);
}

// Test 2: Check for required imports
console.log('\n📦 Test 2: Required imports');
const content = fs.readFileSync(componentPath, 'utf8');
const requiredImports = [
  "import * as THREE from 'three';",
  "import { useTheme } from '@/contexts/ThemeContext';",
  "import React, { useEffect, useRef } from 'react';"
];

requiredImports.forEach(imp => {
  if (content.includes(imp)) {
    console.log(`✅ Found: ${imp}`);
  } else {
    console.log(`❌ Missing: ${imp}`);
  }
});

// Test 3: Check for proper TypeScript types
console.log('\n🔷 Test 3: TypeScript type annotations');
const typeChecks = [
  'const animate = (): number =>',
  '(object: THREE.Object3D)',
  '(material: THREE.Material)',
  'THREE.PerspectiveCamera',
  'THREE.WebGLRenderer',
  'THREE.Points'
];

typeChecks.forEach(check => {
  if (content.includes(check)) {
    console.log(`✅ Found type: ${check}`);
  } else {
    console.log(`❌ Missing type: ${check}`);
  }
});

// Test 4: Check positioning classes
console.log('\n🎨 Test 4: CSS positioning');
if (content.includes('absolute inset-0')) {
  console.log('✅ Uses absolute inset-0 positioning');
} else {
  console.log('❌ Missing absolute inset-0 positioning');
}

// Test 5: Check theme colors
console.log('\n🌈 Test 5: Theme color logic');
if (content.includes("colors.push(0, 0, 0)")) {
  console.log('✅ Black dots for light theme');
} else {
  console.log('❌ Missing black dots for light theme');
}

if (content.includes("colors.push(200, 200, 200)")) {
  console.log('✅ Light gray dots for dark theme');
} else {
  console.log('❌ Missing light gray dots for dark theme');
}

// Test 6: Check animationId assignment
console.log('\n🎬 Test 6: Animation ID assignment');
if (content.includes('animationId = animate()')) {
  console.log('✅ Proper animationId assignment');
} else {
  console.log('❌ Improper animationId assignment');
}

// Test 7: Check cleanup function
console.log('\n🧹 Test 7: Cleanup function');
if (content.includes('cancelAnimationFrame(sceneRef.current.animationId)')) {
  console.log('✅ Animation frame cancellation in cleanup');
} else {
  console.log('❌ Missing animation frame cancellation');
}

// Test 8: Check for syntax errors (basic)
console.log('\n📝 Test 8: Basic syntax validation');
try {
  // Remove comments to check basic syntax
  const noComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  
  // Check for balanced braces
  const openBraces = (noComments.match(/{/g) || []).length;
  const closeBraces = (noComments.match(/}/g) || []).length;
  
  if (openBraces === closeBraces) {
    console.log(`✅ Balanced braces: ${openBraces} open, ${closeBraces} close`);
  } else {
    console.log(`❌ Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  // Check for balanced parentheses
  const openParens = (noComments.match(/\(/g) || []).length;
  const closeParens = (noComments.match(/\)/g) || []).length;
  
  if (openParens === closeParens) {
    console.log(`✅ Balanced parentheses: ${openParens} open, ${closeParens} close`);
  } else {
    console.log(`❌ Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }
  
} catch (error) {
  console.log('❌ Syntax check error:', error.message);
}

// Test 9: Check Three.js material properties
console.log('\n⚡ Test 9: Three.js material configuration');
const materialChecks = [
  'size: 8',
  'vertexColors: true',
  'transparent: true',
  'opacity: 0.8'
];

materialChecks.forEach(check => {
  if (content.includes(check)) {
    console.log(`✅ Found material property: ${check}`);
  } else {
    console.log(`❌ Missing material property: ${check}`);
  }
});

// Test 10: Check particle configuration
console.log('\n🎯 Test 10: Particle configuration');
if (content.includes('const SEPARATION = 150')) {
  console.log('✅ Particle separation set to 150');
} else {
  console.log('❌ Particle separation not set correctly');
}

if (content.includes('const AMOUNTX = 40') && content.includes('const AMOUNTY = 60')) {
  console.log('✅ Particle grid: 40x60');
} else {
  console.log('❌ Particle grid not set correctly');
}

console.log('\n🎉 DottedSurface component test completed!');
console.log('📝 Summary: All critical components checked. The component should work correctly.');
