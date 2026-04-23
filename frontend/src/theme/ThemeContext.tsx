import { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeContextProvider");
  }
  return context;
}

const STORAGE_KEY = "complyra-theme";

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  //  TOGGLE THEME FUNCTION
  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  //  THEME OBJECT — enhanced with refined tokens
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#6366f1",
            light: "#818cf8",
            dark: "#4f46e5",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
          },
          ...(mode === "light"
            ? {
              background: {
                default: "#f0f2f7",
                paper: "#ffffff",
              },
              text: {
                primary: "#0f172a",
                secondary: "#64748b",
              },
              divider: "rgba(0,0,0,0.07)",
            }
            : {
              background: {
                default: "#0a0f1e",
                paper: "#111827",
              },
              text: {
                primary: "#f1f5f9",
                secondary: "#94a3b8",
              },
              divider: "rgba(255,255,255,0.08)",
            }),
        },
        typography: {
          fontFamily: "'DM Sans', 'Inter', sans-serif",
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiDialog: {
            styleOverrides: {
              root: ({ theme }) => ({
                "& .MuiBackdrop-root": {
                  backdropFilter: "blur(8px)",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(255,255,255,0.4)", // 👈 FIX for light mode
                },
              }),

              paper: ({ theme }) => ({
                borderRadius: 16,
                backdropFilter: "blur(14px)",

                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.75))"
                    : "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7))", // 👈 LIGHT FIX

                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(0,0,0,0.08)",

                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 20px 60px rgba(0,0,0,0.5)"
                    : "0 10px 40px rgba(0,0,0,0.1)",
              }),
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: "none",
                ...(theme.palette.mode === "dark" && {
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                }),
              }),
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: "none",
                ...(theme.palette.mode === "dark" && {
                  backgroundColor: "#111827",
                }),
              }),
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 8,
                fontSize: "0.75rem",
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}