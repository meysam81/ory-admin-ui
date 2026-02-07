import { useBreakpoints as _useBreakpoints, breakpointsTailwind } from "@vueuse/core"

export function useBreakpoints() {
  const bp = _useBreakpoints(breakpointsTailwind)

  return {
    /** Raw Tailwind breakpoint reactives */
    sm: bp.greaterOrEqual("sm"),
    md: bp.greaterOrEqual("md"),
    lg: bp.greaterOrEqual("lg"),
    xl: bp.greaterOrEqual("xl"),

    /** Semantic helpers */
    isMobile: bp.smaller("md"), // < 768
    isTablet: bp.between("md", "lg"), // 768–1023
    isDesktop: bp.greaterOrEqual("lg"), // >= 1024
  }
}
