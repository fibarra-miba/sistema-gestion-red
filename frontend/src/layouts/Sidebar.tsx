// frontend/src/layouts/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';

const drawerWidth = 260;

const navItems = [
  { label: 'Dashboard', to: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Clientes', to: '/clientes', icon: <GroupsOutlinedIcon /> },
  { label: 'Planes', to: '/planes', icon: <RouterOutlinedIcon /> },
  { label: 'Contratos', to: '/contratos', icon: <DescriptionOutlinedIcon /> },
  { label: 'Pagos', to: '/pagos', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Instalaciones', to: '/instalaciones', icon: <BuildOutlinedIcon /> },
  { label: 'Soporte', to: '/soporte', icon: <SupportAgentOutlinedIcon /> },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export const sidebarWidth = drawerWidth;

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
            Sistema RED
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ISP Management
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <Box sx={{ px: 2, py: 2, flex: 1 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                '&.active': {
                  backgroundColor: 'rgba(79,140,255,0.14)',
                  color: 'text.primary',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}