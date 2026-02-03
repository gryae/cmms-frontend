'use client';

import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  EmailOutlined, 
  LockOutlined, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useState } from 'react';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Logic asli tetap dipertahankan
  const login = async () => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    window.location.href = '/dashboard';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #1e3a8a, #0f172a)', // Deep dark blue theme
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.05)', // Efek Transparan
            backdropFilter: 'blur(10px)', // Glassmorphism
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              fontWeight="800" 
              sx={{ color: '#fff', letterSpacing: -1 }}
            >
              Portal Login
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
              Silakan masuk untuk mengelola dashboard Anda
            </Typography>
          </Box>

          <Box component="form" noValidate>
            <TextField
              fullWidth
              placeholder="nama@email.com"
              label="Email"
              margin="normal"
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'primary.light' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                input: { color: 'white' }, 
                label: { color: 'rgba(255,255,255,0.7)' },
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              variant="filled"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'primary.light' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                input: { color: 'white' }, 
                label: { color: 'rgba(255,255,255,0.7)' },
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                mt: 2
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={login}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #1d4ed8)',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                },
              }}
            >
              Sign In
            </Button>

            <Typography 
              variant="caption" 
              display="block" 
              textAlign="center" 
              sx={{ mt: 3, color: 'rgba(255,255,255,0.4)' }}
            >
              © 2026 MaintINA. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}