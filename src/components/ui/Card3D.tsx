import React, { useRef, useState } from 'react';

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // max tilt angle in degrees
  glowColor?: string; // custom box shadow glow color on hover
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  maxTilt = 15,
  glowColor = 'rgba(99, 102, 241, 0.15)',
  className = '',
  style = {},
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Mouse coordinates relative to card element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalised coordinate mapping (-0.5 to 0.5)
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    // Rotation degrees (rotateX based on mouse Y-axis, rotateY based on mouse X-axis)
    const rx = -py * maxTilt;
    const ry = px * maxTilt;

    setTiltStyle({
      '--rx': `${rx}deg`,
      '--ry': `${ry}deg`,
      boxShadow: `0 15px 45px 0 ${glowColor}, 0 0 20px 0 rgba(255, 255, 255, 0.02)`,
      borderColor: 'var(--border-glass-hover)',
    } as React.CSSProperties);
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      '--rx': '0deg',
      '--ry': '0deg',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease',
    } as React.CSSProperties);
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        className="tilt-card glass-panel"
        style={{ ...style, ...tiltStyle }}
      >
        <div className="tilt-card-content">
          {children}
        </div>
      </div>
    </div>
  );
};
