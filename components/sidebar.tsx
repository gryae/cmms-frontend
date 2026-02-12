'use client';

import {
  Drawer, List, ListItemButton, ListItemText, Toolbar,
  Box, Button, ListItemIcon, Typography, Avatar, Divider, alpha, Stack
} from '@mui/material';
import {
  Dashboard, PrecisionManufacturing, Assignment, 
  People, Logout
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromToken } from '../lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Import ini buat logo

import { registerPush } from '@/lib/push';
import api from '@/lib/api';

const drawerWidth = 260;
// Warna biru gear dari logo kamu
const BRAND_BLUE = '#00A3E0'; 

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = getUserFromToken();
   
    if (userData) {
      setUser(userData);
    }


    async function initPush() {
    try {
      const subscription = await registerPush(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);

      if (subscription) {
        await api.post('/push/subscribe', { subscription });
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

    initPush();

  }, []);

  const menu = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN','USER'],
    },
    {
      label: 'Assets',
      path: '/assets',
      icon: <PrecisionManufacturing />,
      roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN','USER'],
    },
    {
      label: 'Work Orders',
      path: '/work-orders',
      icon: <Assignment />,
      roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN','USER'],
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
          bgcolor: '#0B0F19', 
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      {/* BRAND LOGO SECTION */}
      <Toolbar sx={{ my: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Box penampung logo PNG */}
          <Box 
            sx={{ 
              width: 40, // Sedikit lebih besar agar logo PNG terlihat jelas
              height: 40, 
              bgcolor: 'rgba(255, 255, 255, 0.05)', // Background tipis saja
              borderRadius: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden', // Supaya gambar nggak keluar kotak
              border: `1px solid ${alpha(BRAND_BLUE, 0.3)}`,
              p: 0.5 // Padding biar logo nggak mepet ke pinggir kotak
            }}
          >
            <Image 
              src="/LAPOR.png" 
              alt="Logo" 
              width={30} 
              height={30} 
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={0.5} color="white" sx={{ fontSize: '1.1rem' }}>
            LAPOR<span style={{ color: BRAND_BLUE }}>SKKKJ</span>
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
                    bgcolor: isActive ? alpha(BRAND_BLUE, 0.1) : 'transparent',
                    color: isActive ? BRAND_BLUE : alpha('#fff', 0.6),
                    '&:hover': {
                      bgcolor: alpha(BRAND_BLUE, 0.05),
                      color: BRAND_BLUE,
                      '& .MuiListItemIcon-root': { color: BRAND_BLUE }
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActive ? BRAND_BLUE : 'inherit',
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
                bgcolor: BRAND_BLUE, // Avatar pakai warna biru logo
                fontSize: '0.8rem',
                fontWeight: 700 
              }}>
                {user.name ? user.name[0].toUpperCase() : '?'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap color="white">
                  {user.name ? user.name.split('@')[0] : 'User'}
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