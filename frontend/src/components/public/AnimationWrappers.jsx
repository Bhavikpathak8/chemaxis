import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * =========================================================================
 * 1. HERO ENTRANCE ANIMATION (Framer Motion)
 * Staggered entrance: Heading fades in & moves upward ->
 * supporting text follows -> CTA buttons appear.
 * =========================================================================
 */
export function HeroEntrance({
  children,
  className = '',
  delay = 0.05,
  stagger = 0.16,
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroHeading({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function HeroText({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function HeroActions({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function HeroVisual({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * =========================================================================
 * 2. SCROLL REVEAL (Framer Motion / GSAP)
 * Sections and elements appear smoothly as visitors scroll down.
 * =========================================================================
 */
export function ScrollReveal({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'zoom'
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = '-40px 0px',
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: threshold });

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } };
      case 'down':
        return { initial: { opacity: 0, y: -28 }, animate: { opacity: 1, y: 0 } };
      case 'left':
        return { initial: { opacity: 0, x: 36 }, animate: { opacity: 1, x: 0 } };
      case 'right':
        return { initial: { opacity: 0, x: -36 }, animate: { opacity: 1, x: 0 } };
      case 'zoom':
        return { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 } };
      default:
        return { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } };
    }
  };

  const { initial, animate } = getOffset();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animate : initial}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Retain FadeUp for backwards-compatibility
export const FadeUp = ScrollReveal;

/**
 * Image Reveal on Scroll: image unclips and scales to 1.
 */
export function ImageReveal({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  delay = 0,
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' });

  if (prefersReduced) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={src} alt={alt} className={imgClassName} />
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
        transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
        className={imgClassName}
      />
    </div>
  );
}

/**
 * =========================================================================
 * 3. PRODUCT HOVER EFFECTS (CSS + Framer Motion)
 * Product images zoom slightly, cards lift up, and shadows become stronger.
 * =========================================================================
 */
export function ProductCardHover({
  children,
  className = '',
  lift = 8,
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={`product-card ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -lift }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`product-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Retain HoverLift for compatibility
export const HoverLift = ProductCardHover;

/**
 * Stagger container for card grids.
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = '',
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' });

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  yOffset = 20,
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: yOffset },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * =========================================================================
 * 5. NUMBER COUNTER (Scroll-Triggered)
 * Statistics count up smoothly when the section becomes visible in the viewport.
 * =========================================================================
 */
export function AnimatedCounter({
  target,
  value,
  prefix = '',
  suffix = '',
  duration = 1800,
}) {
  const numericTarget = Number(target !== undefined ? target : (value !== undefined ? value : 0)) || 0;
  const prefersReduced = useReducedMotion();
  const [val, setVal] = useState(prefersReduced ? numericTarget : 0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (prefersReduced) {
      setVal(numericTarget);
      return;
    }
    if (!isInView || numericTarget === 0) return;
    let startTime;
    let animId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * numericTarget;
      setVal(Number.isNaN(current) ? numericTarget : current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isInView, numericTarget, duration, prefersReduced]);

  const displayVal = Number.isNaN(val) ? numericTarget : val;

  return (
    <span ref={ref}>
      {prefix}
      {displayVal.toLocaleString('en-IN', { maximumFractionDigits: numericTarget % 1 !== 0 ? 1 : 0 })}
      {suffix}
    </span>
  );
}
