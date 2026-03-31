'use client';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const { theme } = useTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		console.log('🎯 DottedSurface: Initializing Three.js scene...');
		
		// Responsive particle counts based on screen size
		const getParticleCounts = () => {
			const width = window.innerWidth;
			if (width < 640) { // mobile
				return { AMOUNTX: 20, AMOUNTY: 30, SEPARATION: 100, SIZE: 4 };
			} else if (width < 1024) { // tablet
				return { AMOUNTX: 30, AMOUNTY: 45, SEPARATION: 125, SIZE: 6 };
			} else { // desktop
				return { AMOUNTX: 40, AMOUNTY: 60, SEPARATION: 150, SIZE: 8 };
			}
		};

		let { AMOUNTX, AMOUNTY, SEPARATION, SIZE } = getParticleCounts();
		console.log(`📊 DottedSurface: Creating ${AMOUNTX}x${AMOUNTY} particles (${AMOUNTX * AMOUNTY} total)`);

		try {
			// Scene setup
			const scene = new THREE.Scene();
			scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

			const camera = new THREE.PerspectiveCamera(
				60,
				window.innerWidth / window.innerHeight,
				1,
				10000,
			);
			camera.position.set(0, 355, 1220);

			const renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true,
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
			
			// Get container dimensions instead of window dimensions
			const container = containerRef.current;
			const width = container?.clientWidth || window.innerWidth;
			const height = container?.clientHeight || window.innerHeight;
			
			console.log(`📐 DottedSurface: Container size: ${width}x${height}`);
			renderer.setSize(width, height);
			renderer.setClearColor(scene.fog.color, 0);

			containerRef.current.appendChild(renderer.domElement);
			console.log('✅ DottedSurface: Canvas appended to container');

			// Create particles
			const particles: THREE.Points[] = [];
			const positions: number[] = [];
			const colors: number[] = [];

			// Create geometry for all particles
			const geometry = new THREE.BufferGeometry();

			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
					const y = 0; // Will be animated
					const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

					positions.push(x, y, z);
					if (theme === 'dark') {
						colors.push(200, 200, 200);
					} else {
						colors.push(30, 58, 138); // Use brand blue color for light theme
					}
				}
			}

			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute(positions, 3),
			);
			geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

			// Create material with much higher visibility
			const material = new THREE.PointsMaterial({
				size: SIZE * 3, // Triple the size for visibility
				vertexColors: true,
				transparent: true,
				opacity: 1.0, // Full opacity for maximum visibility
				sizeAttenuation: true,
			});

			// Create points object
			const points = new THREE.Points(geometry, material);
			scene.add(points);
			console.log('✅ DottedSurface: Particles added to scene');

			let count = 0;
			let animationId: number;

			// Animation function with performance optimization
			const animate = () => {
				animationId = requestAnimationFrame(animate);

				const positionAttribute = geometry.attributes.position;
				const positions = positionAttribute.array as Float32Array;

				let i = 0;
				for (let ix = 0; ix < AMOUNTX; ix++) {
					for (let iy = 0; iy < AMOUNTY; iy++) {
						const index = i * 3;

						// Animate Y position with sine waves - reduced amplitude for mobile
						const amplitude = window.innerWidth < 640 ? 25 : 50;
						positions[index + 1] =
							Math.sin((ix + count) * 0.3) * amplitude +
							Math.sin((iy + count) * 0.5) * amplitude;

						i++;
					}
				}

				positionAttribute.needsUpdate = true;

				renderer.render(scene, camera);
				count += 0.1;
			};

			console.log('🎬 DottedSurface: Starting animation...');
			animate();

			// Handle window resize with responsive particle updates
			const handleResize = () => {
				const newCounts = getParticleCounts();
				const needsRebuild = newCounts.AMOUNTX !== AMOUNTX || newCounts.AMOUNTY !== AMOUNTY;
				
				if (needsRebuild) {
					// Clean up existing scene
					if (sceneRef.current) {
						cancelAnimationFrame(sceneRef.current.animationId);
						sceneRef.current.scene.traverse((object) => {
							if (object instanceof THREE.Points) {
								object.geometry.dispose();
								if (Array.isArray(object.material)) {
									object.material.forEach((material) => material.dispose());
								} else {
									object.material.dispose();
								}
							}
						});
						sceneRef.current.renderer.dispose();
					}
					
					// Recreate with new counts
					AMOUNTX = newCounts.AMOUNTX;
					AMOUNTY = newCounts.AMOUNTY;
					SEPARATION = newCounts.SEPARATION;
					SIZE = newCounts.SIZE;
					
					// Reinitialize geometry and material
					const newPositions: number[] = [];
					const newColors: number[] = [];
					
					for (let ix = 0; ix < AMOUNTX; ix++) {
						for (let iy = 0; iy < AMOUNTY; iy++) {
							const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
							const y = 0;
							const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
							
							newPositions.push(x, y, z);
							if (theme === 'dark') {
								newColors.push(200, 200, 200);
							} else {
								newColors.push(30, 58, 138);
							}
						}
					}
					
					geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
					geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
					material.size = SIZE;
				}

				// Update camera aspect ratio and renderer size based on container
				const container = containerRef.current;
				const width = container?.clientWidth || window.innerWidth;
				const height = container?.clientHeight || window.innerHeight;
				
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize(width, height);
			};

			// Debounce resize handler for performance
			let resizeTimeout: NodeJS.Timeout;
			const debouncedResize = () => {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(handleResize, 250);
			};

			window.addEventListener('resize', debouncedResize);

			// Store references
			sceneRef.current = {
				scene,
				camera,
				renderer,
				particles: [points],
				animationId,
				count,
			};

			// Cleanup function
			return () => {
				window.removeEventListener('resize', debouncedResize);
				clearTimeout(resizeTimeout);

				if (sceneRef.current) {
					cancelAnimationFrame(sceneRef.current.animationId);

					// Clean up Three.js objects
					sceneRef.current.scene.traverse((object) => {
						if (object instanceof THREE.Points) {
							object.geometry.dispose();
							if (Array.isArray(object.material)) {
								object.material.forEach((material) => material.dispose());
							} else {
								object.material.dispose();
							}
						}
					});
					sceneRef.current.renderer.dispose();
				}
				
				// Recreate with new counts
				AMOUNTX = newCounts.AMOUNTX;
				AMOUNTY = newCounts.AMOUNTY;
				SEPARATION = newCounts.SEPARATION;
				SIZE = newCounts.SIZE;
				
				// Reinitialize geometry and material
				const newPositions: number[] = [];
				const newColors: number[] = [];
				
				for (let ix = 0; ix < AMOUNTX; ix++) {
					for (let iy = 0; iy < AMOUNTY; iy++) {
						const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
						const y = 0;
						const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
						
						newPositions.push(x, y, z);
						if (theme === 'dark') {
							newColors.push(200, 200, 200);
						} else {
							newColors.push(30, 58, 138);
						}
					}
				}
				
				geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
				geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
				material.size = SIZE;
			}

			// Update camera aspect ratio and renderer size based on container
			const currentContainer = containerRef.current;
			const currentWidth = currentContainer?.clientWidth || window.innerWidth;
			const currentHeight = currentContainer?.clientHeight || window.innerHeight;
			
			camera.aspect = currentWidth / currentHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(currentWidth, currentHeight);
		};

		// Debounce resize handler for performance
		let resizeTimeout: NodeJS.Timeout;
		const debouncedResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(handleResize, 250);
		};

		window.addEventListener('resize', debouncedResize);

		// Start animation
		animate();

		// Store references
		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: [points],
			animationId,
			count,
		};

		// Cleanup function
		return () => {
			window.removeEventListener('resize', debouncedResize);
			clearTimeout(resizeTimeout);

			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);

				// Clean up Three.js objects
				sceneRef.current.scene.traverse((object) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				});

				sceneRef.current.renderer.dispose();

				if (containerRef.current && sceneRef.current.renderer.domElement) {
					containerRef.current.removeChild(
						sceneRef.current.renderer.domElement,
					);
				}
			}
		} catch (error) {
			console.error('❌ DottedSurface: Error initializing Three.js:', error);
		}
	}, [theme]);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none absolute inset-0 -z-10', className)}
			{...props}
		/>
	);
}
