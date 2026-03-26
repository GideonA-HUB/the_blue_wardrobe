"use client";

import React from "react";
import { AnimatedMarqueeHero } from "./ui/AnimatedMarqueeHero";

// Fashion design images for the marquee
const FASHION_IMAGES = [
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQGI7TpMaNnjIkFSJ7kl0cjdIzh5yBx2co1GzD0SAw0uOnUb0drnvZ-E9gnA4sG9ZbXdDPyduQSRKfgsaoovZYKz6l5C4XU4mVFQXBG1MnYVDSaR359PFjBhAAXFiOVuocixPRuWwQYPHOZh4hKgSPxqTcx4_E_TFryuAMCxEB0n9OuZVs_0K38VxH/s1920/shopping-g02e09667b_1920.jpg",
  "https://i.pinimg.com/736x/ae/0e/bd/ae0ebde1f3dbef79fe86ca5f8e4c4325.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.0xA3JO2uS99ivDWLAf2zmAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.S0k_f36FFHFS0XWqyBwGsgHaJL?w=736&h=913&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://i.pinimg.com/originals/f2/c7/fb/f2c7fb7c9f114fd2751bf489b4407278.jpg",
  "https://tse2.mm.bing.net/th/id/OIP.LfO2Ez9mk4yihfe3kx-l-AHaHa?w=800&h=800&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.6TaDgTnr9F2P0IXGFKgscgHaM9?w=682&h=1194&rs=1&pid=ImgDetMain&o=7&rm=3",
];

export default function AnimatedHero() {
  return (
    <AnimatedMarqueeHero
      tagline="Discover Timeless Elegance"
      title={
        <>
          THE BLUE
          <br />
          WARDROBE
        </>
      }
      description="Rare fabrics. Timeless design. Global luxury. Experience our exclusive collections crafted with attention to detail and the finest materials."
      images={FASHION_IMAGES}
    />
  );
}
