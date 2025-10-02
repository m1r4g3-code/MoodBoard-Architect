import React, { useRef, useEffect, useCallback } from 'react';

interface AnimatedBackgroundProps {
  theme: 'light' | 'dark';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  const getThemeColors = useCallback(() => {
    if (theme === 'dark') {
      return {
        background: '#1a1a1f',
        starColors: ['rgba(224, 224, 224, 0.6)', 'rgba(138, 79, 255, 0.5)', 'rgba(51, 198, 171, 0.5)'],
      };
    } else {
      return {
        background: '#f9fafb',
        starColors: ['rgba(107, 114, 128, 0.5)', 'rgba(138, 79, 255, 0.4)', 'rgba(51, 198, 171, 0.4)'],
      };
    }
  }, [theme]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };

    const starCount = Math.floor((canvas.width * canvas.height) / 5000);
    starsRef.current = [];
    const colors = getThemeColors().starColors;

    for (let i = 0; i < starCount; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        size: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        opacityDirection: 1,
      });
    }
  }, [getThemeColors]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { background } = getThemeColors();
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < starsRef.current.length; i++) {
      const star = starsRef.current[i];
      const speed = star.z / (canvas.width * 2);
      
      const dx = (mouseRef.current.x - canvas.width / 2) / (canvas.width / 2);
      const dy = (mouseRef.current.y - canvas.height / 2) / (canvas.height / 2);

      star.x -= speed + (dx * speed * 1.5);
      star.y -= dy * speed * 1.5;

      if (star.x < -star.size) {
        star.x = canvas.width + star.size;
        star.y = Math.random() * canvas.height;
      }
      if (star.y < -star.size) {
        star.y = canvas.height + star.size;
        star.x = Math.random() * canvas.width;
      }
      if (star.y > canvas.height + star.size) {
        star.y = -star.size;
        star.x = Math.random() * canvas.width;
      }

      // Twinkling effect
      if (star.opacityDirection) {
        star.opacity += 0.002;
        if (star.opacity > 0.8) star.opacityDirection = 0;
      } else {
        star.opacity -= 0.002;
        if (star.opacity < 0.2) star.opacityDirection = 1;
      }
      
      context.beginPath();
      const colorParts = star.color.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
      if (colorParts) {
        context.fillStyle = `rgba(${colorParts[1]}, ${colorParts[2]}, ${colorParts[3]}, ${star.opacity})`;
      } else {
        context.fillStyle = star.color;
      }
      context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      context.fill();
    }
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, [getThemeColors]);

  useEffect(() => {
    let resizeTimeout: number;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            init();
            animate();
        }, 200);
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    init();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [init, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const colors = getThemeColors().starColors;
    starsRef.current.forEach(star => {
      star.color = colors[Math.floor(Math.random() * colors.length)];
    });
  }, [theme, getThemeColors]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, width: '100vw', height: '100vh', display: 'block' }} />;
};

export default AnimatedBackground;
