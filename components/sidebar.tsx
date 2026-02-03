'use client';

import {
  Drawer, List, ListItemButton, ListItemText, Toolbar,
  Box, Button, ListItemIcon, Typography, Avatar, Divider, alpha, Stack
} from '@mui/material';
import {
  Dashboard, PrecisionManufacturing, Assignment, 
  People, Logout, Engineering
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromToken } from '../lib/api';
import { useEffect, useState } from 'react';

const drawerWidth = 260;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Inisialisasi dengan null untuk menghindari mismatch hydration
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = getUserFromToken();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const menu = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'],
    },
    {
      label: 'Assets',
      path: '/assets',
      icon: <PrecisionManufacturing />,
      roles: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Work Orders',
      path: '/work-orders',
      icon: <Assignment />,
      roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'],
    },
    {
      label: 'Users',
      path: '/users',
      icon: <People />,
      roles: ['ADMIN'],
    },
  ];

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Cegah render apapun di server untuk sinkronisasi state client
  if (!mounted) return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#0B0F19', // Dark Theme Professional
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      {/* BRAND LOGO */}
      <Toolbar sx={{ my: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box 
            sx={{ 
              width: 35, height: 35, bgcolor: '#7C7CFF', 
              borderRadius: 1.5, display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(124, 124, 255, 0.4)'
            }}
          >
            <Engineering sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={1} color="white">
            Mainta<span style={{ color: '#7C7CFF' }}>INA</span>
          </Typography>
        </Stack>
      </Toolbar>

      <Box sx={{ overflow: 'auto', px: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* MENU ITEMS */}
        <List sx={{ flexGrow: 1 }}>
          {menu
            .filter(item => user && item.roles.includes(user.role))
            .map(item => {
              const isActive = pathname.startsWith(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.2,
                    transition: 'all 0.2s ease',
                    bgcolor: isActive ? alpha('#7C7CFF', 0.1) : 'transparent',
                    color: isActive ? '#7C7CFF' : alpha('#fff', 0.6),
                    '&:hover': {
                      bgcolor: alpha('#7C7CFF', 0.05),
                      color: '#7C7CFF',
                      '& .MuiListItemIcon-root': { color: '#7C7CFF' }
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActive ? '#7C7CFF' : 'inherit',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isActive ? 700 : 500 
                    }} 
                  />
                </ListItemButton>
              );
            })}
        </List>

        {/* PROFILE & LOGOUT SECTION */}
        <Box sx={{ pb: 4 }}>
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
          
          {user && (
            <Box sx={{ 
              p: 2, borderRadius: 3, 
              bgcolor: alpha('#fff', 0.03),
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Avatar sx={{ 
                width: 32, height: 32, 
                bgcolor: '#7C7CFF', 
                fontSize: '0.8rem',
                fontWeight: 700 
              }}>
                {user.email ? user.email[0].toUpperCase() : '?'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap color="white">
                  {user.email ? user.email.split('@')[0] : 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                  {user.role}
                </Typography>
              </Box>
            </Box>
          )}

          <Button
            variant="text"
            fullWidth
            startIcon={<Logout />}
            onClick={logout}
            sx={{   
              justifyContent: 'flex-start', 
              color: '#ff4444',
              px: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: alpha('#ff4444', 0.1) }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}