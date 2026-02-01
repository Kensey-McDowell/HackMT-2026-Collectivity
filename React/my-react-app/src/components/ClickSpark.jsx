import { useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const ALLOWED_PATHS = [
  "/social",
  "/about",
  "/profile",
  "/settings",
  "/faq",
];

const ClickSpark = ({
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  children,
}) => {
  const { theme } = useSettings();
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const location = useLocation();
  const startTimeRef = useRef(null);

  // Determine spark color based on theme, including "system"
  const getSparkColor = () => {
    if (theme === "light") return "#4f46e5";
    if (theme === "dark") return "#c5a367";
    // system theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "#c5a367"
      : "#4f46e5";
  };

  // Resize canvas to always cover viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Easing function
  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t); // ease-out
      }
    },
    [easing]
  );

  // Animate sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const draw = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sparkColor = getSparkColor();

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [sparkSize, sparkRadius, duration, easeFunc, extraScale, theme]);

  // Handle click
  const handleClick = (e) => {
    if (!ALLOWED_PATHS.includes(location.pathname)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = e.clientX;
    const y = e.clientY;

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));

    sparksRef.current.push(...newSparks);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
      onClick={handleClick}
    >
      {children}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 9999,
        }}
      />
    </div>
  );
};

export default ClickSpark;