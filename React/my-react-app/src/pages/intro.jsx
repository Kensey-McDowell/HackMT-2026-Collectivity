import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Book from "../assets/book";
import Chain from "../assets/chain";
import Armillary from "../assets/armillary";
import "./intro.css";

// Assets
import img1 from "../assets/images/art_collection.jpg";
import img2 from "../assets/images/card_playing.jpg";
import img3 from "../assets/images/coin_collection.jpg";
import img4 from "../assets/images/library_reading.jpg";
import img5 from "../assets/images/music_cds.jpg";
import img6 from "../assets/images/Retro_game.jpg";
import img7 from "../assets/images/sneaker_collection.jpg";
import img8 from "../assets/images/stamp_collection.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function CanvasWrapper({ children, ...props }) {
  return (
    <Canvas
      {...props}
      frameloop="always"
      dpr={[1, 1.5]}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      {children}
    </Canvas>
  );
}

export default function Home() {
  const componentRef = useRef(null);
  const trackRef = useRef(null);
  const scrollRef = useRef(0);

  const [activeScene, setActiveScene] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    let ctx = gsap.context(() => {
      gsap.set(".scene", { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(".scene-1", { autoAlpha: 1, pointerEvents: "all" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: "top top",
          end: "+=1500%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            // Book flip progress
            if (p <= 0.25) scrollRef.current = gsap.utils.normalize(0, 0.25, p);
            // Update active scene
            let current = 1;
            if (p > 0.25 && p <= 0.5) current = 2;
            if (p > 0.5 && p <= 0.75) current = 3;
            if (p > 0.75) current = 4;
            if (activeScene !== current) setActiveScene(current);
          },
        },
      });

      tl.to({}, { duration: 3 })
        .to(".scene-1", { autoAlpha: 0, duration: 2 })
        // Scene 2
        .to(".scene-2", { autoAlpha: 1, duration: 1 }, "<")
        .to({}, { duration: 9 })
        .to(".scene-2", { autoAlpha: 0, x: -100, duration: 2 })
        // Scene 3
        .to(".scene-3", { autoAlpha: 1, duration: 1 }, "<")
        .to({}, { duration: 9 })
        .to(".scene-3", { autoAlpha: 0, scale: 0.8, duration: 2 })
        // Image track
        .to("#image-track-scene", { autoAlpha: 1, pointerEvents: "all", duration: 2 })
        .fromTo(
          "#image-track",
          { x: "100vw" },
          { x: "-350vw", duration: 10, ease: "none" }
        )
        // Final
        .to(".final-scene", { autoAlpha: 1, pointerEvents: "all", duration: 2 });
    }, componentRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={componentRef} className="master-container">
      {/* Scene 1: BOOK */}
      <section className="scene scene-1">
        <div className="canvas-wrapper">
          <CanvasWrapper camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <Environment preset="lobby" />
            <Book scrollRef={scrollRef} visible={activeScene === 1} />
          </CanvasWrapper>
        </div>
        <div className="text-container">
          <h1 className="tagline"></h1>
        </div>
      </section>

      {/* Scene 2: Chain */}
      <section className="scene scene-2">
        <div className="canvas-wrapper">
          <CanvasWrapper camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={1} />
            <pointLight position={[5, 5, 5]} intensity={2} />
            <Environment preset="city" />
            <Chain visible={activeScene === 2} />
          </CanvasWrapper>
        </div>
        <div className="text-container">
          <h1 className="tagline"></h1>
        </div>
      </section>

      {/* Scene 3: Armillary */}
      <section className="scene scene-3">
        <div className="canvas-wrapper">
          <CanvasWrapper camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <Environment preset="warehouse" />
            <Armillary visible={activeScene === 3} />
          </CanvasWrapper>
        </div>
        <div className="text-container">
          <h1 className="tagline"></h1>
        </div>
      </section>

      {/* Scene 4: Parallax Image Track */}
      <section className="scene" id="image-track-scene">
        <div id="image-track" ref={trackRef}>
          {images.map((src, i) => (
            <div key={i} className="image-frame">
              <img src={src} className="image" alt="" />
            </div>
          ))}
        </div>
      </section>

      {/* Scene 5: Final Reveal */}
      <section className="scene final-scene">
        <h1 className="hero-title">COLLECTIVITY</h1>
        <p className="sub-hero">THE CURATOR'S PROTOCOL</p>
        <div className="auth-group">
          <button className="btn-warm">Sign In</button>
          <button className="btn-warm outline">Enter Vault</button>
        </div>
      </section>
    </div>
  );
}