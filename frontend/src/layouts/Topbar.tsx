import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { sidebarWidth } from './Sidebar';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "../app/theme/ThemeContext";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1200,
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },

        // 🔥 EFECTO OPACO
        backgroundColor:
          mode === "dark"
            ? "rgba(10, 20, 40, 0.75)"
            : "rgba(255,255,255,0.75)",

        backdropFilter: "blur(10px)", // 🔥 blur glass
        WebkitBackdropFilter: "blur(10px)",

        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { lg: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Panel de gestión</Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema RED
          </Typography>
        </Box>

        <IconButton color="inherit" onClick={toggleTheme}>
          {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <IconButton color="inherit">
          <NotificationsNoneOutlinedIcon />
        </IconButton>

        <Avatar sx={{ width: 36, height: 36 }}>R</Avatar>
      </Toolbar>
    </AppBar>
  );
}