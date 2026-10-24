"use client";

import { createContext, useContext, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const HoverContext = createContext(false);

/** Aceternity-style 3D tilt card. Children use <CardItem translateZ> to float in depth. */
export function CardContainer({ children, className, containerClassName }: { children: ReactNode; className?: string; containerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 22;
    const y = (e.clientY - top - height / 2) / 22;
    el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  const onLeave = () => {
    setHovered(false);
    if (ref.current) ref.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <HoverContext.Provider value={hovered}>
      <div className={cn("flex items-center justify-center [perspective:1200px]", containerClassName)}>
        <div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className={cn("relative transition-transform duration-200 ease-out [transform-style:preserve-3d]", className)}
        >
          {children}
        </div>
      </div>
    </HoverContext.Provider>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>{children}</div>;
}

export function CardItem({
  as: Tag = "div",
  children,
  className,
  translateZ = 0,
  ...rest
}: { as?: ElementType; children: ReactNode; className?: string; translateZ?: number } & Record<string, unknown>) {
  const hovered = useContext(HoverContext);
  return (
    <Tag
      className={cn("transition-transform duration-200 ease-out", className)}
      style={{ transform: hovered ? `translateZ(${translateZ}px)` : "translateZ(0px)" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
