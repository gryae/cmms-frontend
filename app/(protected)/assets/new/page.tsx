'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Paper, Typography, Box, TextField, Button,
  Grid, InputAdornment, Divider, Stack, alpha, IconButton
} from '@mui/material';
import {
  ArrowBackIosNew, Inventory, QrCode, Business,
  LocationOn, EventAvailable, Save, Close
} from '@mui/icons-material';
import api from '../../../../lib/api';

export default function NewAssetPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    code: '',
    branch: '',
    location: '',
    procurementYear: '',
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.code) {
      alert('Name and Code are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/assets', {
        ...form,
        procurementYear: Number(form.procurementYear),
      });
      router.push('/assets');
    } catch (err) {
      console.error(err);
      alert('Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Tombol Back yang Elegan */}
      <Button
        startIcon={<ArrowBackIosNew sx={{ fontSize: '14px !important' }} />}
        onClick={() => router.back()}
        sx={{ mb: 3, borderRadius: '10px', fontWeight: 600, color: 'text.secondary' }}
      >
        Back to List
      </Button>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: '24px', 
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dekorasi Aksen Warna di Atas */}
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '6px', 
          bgcolor: 'primary.main', opacity: 0.8 
        }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
              Add New Asset
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details below to register a new facility asset.
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', 
              width: 56, height: 56, borderRadius: '16px' 
            }}
          >
            <Inventory fontSize="large" />
          </Avatar>
        </Stack>

        <Divider sx={{ mb: 4, opacity: 0.6 }} />

        <Grid container spacing={3}>
          {/* Baris 1: Nama & Kode */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Asset Identity</Typography>
            <TextField
              fullWidth
              label="Asset Name"
              placeholder="e.g. MacBook Pro M3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Inventory sx={{ color: 'primary.main' }} /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              required
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Unique Code</Typography>
            <TextField
              fullWidth
              label="Asset Code"
              placeholder="ASST-001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><QrCode sx={{ color: 'primary.main' }} /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              required
            />
          </Grid>

          {/* Baris 2: Branch & Location */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Branch Office</Typography>
            <TextField
              fullWidth
              label="Branch"
              placeholder="e.g. Jakarta South"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Business /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Specific Location</Typography>
            <TextField
              fullWidth
              label="Location"
              placeholder="e.g. Server Room, 2nd Floor"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>

          {/* Baris 3: Procurement Year */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Procurement Information</Typography>
            <TextField
              fullWidth
              label="Procurement Year"
              type="number"
              placeholder="YYYY"
              value={form.procurementYear}
              onChange={(e) => setForm({ ...form, procurementYear: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EventAvailable /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2, 
            mt: 6,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button
            variant="text"
            color="inherit"
            onClick={() => router.back()}
            sx={{ px: 4, borderRadius: '12px', fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={submit}
            disabled={loading}
            sx={{ 
              px: 6, 
              borderRadius: '12px', 
              fontWeight: 800,
              boxShadow: (theme) => `0 10px 20px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
              textTransform: 'none'
            }}
          >
            {loading ? 'Processing...' : 'Save Asset'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

// Tambahkan Avatar ke import material UI jika belum ada
import { Avatar } from '@mui/material';