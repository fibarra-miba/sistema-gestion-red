import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContextProvider } from "./theme/ThemeContext";
import type { ReactNode } from "react";
// import theme from './theme/theme';
// import { ThemeProvider, CssBaseline } from '@mui/material';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    </QueryClientProvider>
  );

};