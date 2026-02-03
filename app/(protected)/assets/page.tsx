'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../lib/api';

import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Box, TextField, InputAdornment, IconButton, 
  Tooltip, Chip, Stack, alpha, TableContainer, Avatar
} from '@mui/material';
import {
  Search, Add, DeleteOutline, Visibility, 
  Business, LocationOn, CalendarToday, Inventory,
  FileUpload, FileDownload, CheckCircle, Description
} from '@mui/icons-material';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const user = getUserFromToken();
    setRole(user?.role ?? '');
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
      setFiltered(res.data);
    } catch (err) { console.error("Load assets failed"); }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      assets.filter((a) =>
        [a.name, a.code, a.branch, a.location]
          .join(' ')
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [search, assets]);

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await api.delete(`/assets/${id}`);
    loadAssets();
  };

  const exportCsv = async () => {
    const res = await api.get('/assets/export/csv', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-${new Date().toLocaleDateString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importCsv = async () => {
    if (!file) return alert('Select CSV file first');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/assets/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { uploaded, skipped } = res.data;
      alert(`✅ Uploaded: ${uploaded}\n⚠️ Skipped: ${skipped}`);
      setFile(null);
      loadAssets();
    } catch (err) { alert("Import failed!"); }
  };

  const isActionAuthorized = ['ADMIN', 'SUPERVISOR'].includes(role);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* HEADER SECTION */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-1.5px', color: 'text.primary' }}>
            Assets Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track school facility assets in real-time.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={exportCsv}
            sx={{ borderRadius: '12px', fontWeight: 600, textTransform: 'none' }}
          >
            Export
          </Button>

          {isActionAuthorized && (
            <>
              <Button
                variant={file ? "contained" : "outlined"}
                color={file ? "success" : "inherit"}
                component="label"
                startIcon={file ? <CheckCircle /> : <FileUpload />}
                sx={{ borderRadius: '12px', fontWeight: 600, textTransform: 'none' }}
              >
                {file ? "File Ready" : "Choose CSV"}
                <input hidden type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </Button>

              {file && (
                <Button variant="contained" color="primary" onClick={importCsv} sx={{ borderRadius: '12px', fontWeight: 700 }}>
                  Upload Now
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/assets/new')}
                sx={{ 
                  borderRadius: '12px', px: 3, fontWeight: 700, textTransform: 'none',
                  boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                New Asset
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* FILTER & STATS BAR */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: alpha('#fff', 0.02) }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by name, code, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { borderRadius: '12px' },
              bgcolor: 'background.paper'
            }}
          />
          {file && (
            <Chip 
              icon={<Description />} 
              label={file.name} 
              onDelete={() => setFile(null)}
              variant="outlined"
              sx={{ py: 2.5, px: 1, borderRadius: '10px', fontWeight: 600 }}
            />
          )}
        </Stack>
      </Paper>

      {/* ASSET TABLE */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.5) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Asset Info</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Branch / Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Procurement</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, pr: 4 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((asset) => (
              <TableRow 
                key={asset.id} 
                hover 
                onClick={() => router.push(`/assets/${asset.id}`)}
                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar variant="rounded" sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', width: 42, height: 42 }}>
                      <Inventory />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                        {asset.name}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: alpha('#3b82f6', 0.05), px: 0.5 }}>
                        {asset.code}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={500}>{asset.branch}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">{asset.location || '-'}</Typography>
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip 
                    label={asset.procurementYear} 
                    size="small" 
                    icon={<CalendarToday sx={{ fontSize: '14px !important' }} />}
                    sx={{ borderRadius: '6px', fontWeight: 600, bgcolor: alpha('#000', 0.03) }}
                  />
                </TableCell>

                <TableCell align="right" sx={{ pr: 3 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="View Details">
                      <IconButton size="small" color="inherit">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {role === 'ADMIN' && (
                      <Tooltip title="Delete Asset">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                          sx={{ '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    No assets found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}