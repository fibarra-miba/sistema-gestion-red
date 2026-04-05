import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar, { sidebarWidth } from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh", // 🔥 permite crecer correctamente
        bgcolor: "background.default",
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Topbar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          ml: { lg: `${sidebarWidth}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 🔥 separador del Topbar */}
        <Toolbar sx={{ minHeight: 72 }} />

        {/* 🔥 CONTENIDO REAL */}
        <Box
          sx={{
            px: { xs: 2, md: 3, lg: 4 },
            py: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;