
import * as React from "react"

// Definindo vários breakpoints para maior flexibilidade
export const BREAKPOINTS = {
  XSMALL: 480,  // para telas muito pequenas
  MOBILE: 640,  // sm
  TABLET: 768,  // md
  DESKTOP: 1024, // lg
  LARGE: 1280   // xl
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.MOBILE;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE);
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export function useIsXSmall() {
  const [isXSmall, setIsXSmall] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.XSMALL;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsXSmall(window.innerWidth < BREAKPOINTS.XSMALL);
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isXSmall;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP);
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isTablet;
}

export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.DESKTOP;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < BREAKPOINTS.DESKTOP);
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobileOrTablet;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < BREAKPOINTS.XSMALL) return 'xsmall';
    if (width < BREAKPOINTS.MOBILE) return 'mobile';
    if (width < BREAKPOINTS.TABLET) return 'tablet';
    if (width < BREAKPOINTS.DESKTOP) return 'desktop';
    return 'large';
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.XSMALL) {
        setBreakpoint('xsmall');
      } else if (width < BREAKPOINTS.MOBILE) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.TABLET) {
        setBreakpoint('tablet');
      } else if (width < BREAKPOINTS.DESKTOP) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('large');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
