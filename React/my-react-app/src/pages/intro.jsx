import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Book from "../assets/book";
import Chain from "../assets/chain";
import "./intro.css";

// Assets
import img1 from "../assets/images/art_collection.png";
import img2 from "../assets/images/card_playing.png";
import img3 from "../assets/images/coin_collection.png";
import img4 from "../assets/images/library_reading.png";
import img5 from "../assets/images/music_collection.png";
import img6 from "../assets/images/Retro_game.png";
import img7 from "../assets/images/sneaker_collection.png";
import img8 from "../assets/images/stamp_collection.png";

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
  const navigate = useNavigate();

  const [activeScene, setActiveScene] = useState(1);

  const handleNavigation = (path) => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.killTweensOf("*");
    navigate(path);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    let ctx = gsap.context(() => {
      gsap.set(".scene", { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(".scene-1", { autoAlpha: 1, pointerEvents: "all" });
      gsap.set(".unique-text-overlay", { autoAlpha: 0, y: 30 });
      gsap.set(".final-scene", { autoAlpha: 0, pointerEvents: "none" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: "top top",
          end: "+=2000%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: () => {
            const t = tl.time();

            // BOOK ANIMATION INPUT
            if (t < tl.labels.chainStart) {
              scrollRef.current = gsap.utils.normalize(
                0,
                tl.labels.chainStart,
                t
              );
            } else {
              scrollRef.current = 1;
            }

            // SCENE SWITCHING
            if (t < tl.labels.chainStart) setActiveScene(1);
            else if (t < tl.labels.imagesStart) setActiveScene(2);
            else setActiveScene(3);
          }
        },
      });

      // TIMELINE
      tl.addLabel("bookHold")
        .to({}, { duration: 2 })

        .addLabel("chainStart")
        .to(".scene-1", { autoAlpha: 0, duration: 2 })
        .to(".scene-2", { autoAlpha: 1, pointerEvents: "all", duration: 2 }, "<")

        .to({}, { duration: 4 })

        .addLabel("chainEnd")
        .to(".scene-2", { autoAlpha: 0, duration: 2 })

        .addLabel("imagesStart")
        .to("#image-track-scene", { autoAlpha: 1, pointerEvents: "all", duration: 2 }, "<")
        .to(".unique-text-overlay", { autoAlpha: 1, y: 0, duration: 1 });

      // ⭐ PARALLAX IMAGE TRACK ⭐
      images.forEach((_, i) => {
        const depth = i * 0.12; // deeper = slower

        // FRAME PARALLAX (outer movement)
        tl.fromTo(
          `.image-frame:nth-child(${i + 1})`,
          { x: 100 * (1 + depth) + "vw" },
          { x: -350 * (1 + depth * 0.5) + "vw", duration: 12, ease: "none" },
          "imagesStart"
        );

        // INTERNAL IMAGE DRIFT (inner movement)
        tl.to(
          `.image-frame:nth-child(${i + 1}) .image`,
          {
            xPercent: -10 * (i + 1),
            ease: "none",
            duration: 12
          },
          "imagesStart"
        );
      });

      // TEXT FADE OUT
      tl.to(".unique-text-overlay", { autoAlpha: 0, y: -20, duration: 1 }, "-=6.5")

        // FADE OUT TRACK
        .to("#image-track-scene", { autoAlpha: 0, duration: 1.5 }, "<")

        .addLabel("finalStart")
        .to(".final-scene", { autoAlpha: 1, pointerEvents: "all", duration: 1.5 }, "<");
    }, componentRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
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
          <h1 className="tagline">Every object has a story</h1>
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
          <h1 className="tagline">A history of trust</h1>
        </div>
      </section>

      {/* Scene 3: Image Track */}
      <section className="scene" id="image-track-scene">
        <div
          className="unique-text-overlay"
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            textAlign: "center",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <h1 className="tagline">Unique lives here</h1>
        </div>

        <div id="image-track" ref={trackRef}>
          {images.map((src, i) => (
            <div key={i} className="image-frame">
              <img src={src} className="image" alt="" />
            </div>
          ))}
        </div>
      </section>

      {/* Scene 4: Final Reveal */}
      <section className="scene final-scene" style={{ zIndex: 20 }}>
        <h1 className="hero-title">COLLECTIVITY</h1>
        <p className="sub-hero">COLLECT. CONNECT. CHERISH.</p>
        <div className="auth-group">
          <button className="btn-warm" onClick={() => handleNavigation("/registration")}>
            Sign In
          </button>
          <button className="btn-warm outline" onClick={() => handleNavigation("/social")}>
            Enter Vault
          </button>
        </div>
      </section>
    </div>
  );
}

