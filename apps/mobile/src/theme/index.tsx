import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  darkColors,
  lightColors,
  motion,
  radius,
  shadow,
  spacing,
  touchTarget,
  typography,
  type ColorTokens,
} from './tokens';

export type Scheme = 'light' | 'dark';

export type Theme = {
  scheme: Scheme;
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  touchTarget: number;
  shadow: (level: 'sm' | 'md' | 'lg' | 'xl') => ReturnType<typeof shadow>;
};

function buildTheme(scheme: Scheme): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    typography,
    spacing,
    radius,
    motion,
    touchTarget,
    shadow: (level) => shadow(level, scheme),
  };
}

const ForcedSchemeContext = createContext<Scheme | null>(null);

/**
 * Ép một nhánh giao diện dùng theme cố định. Chỉ dùng khi có file override đã duyệt
 * trong design-system/yourspace/pages/ (cơ chế Master + Overrides).
 */
export function SchemeOverride({ scheme, children }: { scheme: Scheme; children: ReactNode }) {
  return <ForcedSchemeContext.Provider value={scheme}>{children}</ForcedSchemeContext.Provider>;
}

export function useTheme(): Theme {
  const system = useColorScheme();
  const forced = useContext(ForcedSchemeContext);
  const scheme: Scheme = forced ?? (system === 'dark' ? 'dark' : 'light');
  return useMemo(() => buildTheme(scheme), [scheme]);
}

export { lightColors, darkColors, typography, spacing, radius, motion, touchTarget };
export type { ColorTokens };
