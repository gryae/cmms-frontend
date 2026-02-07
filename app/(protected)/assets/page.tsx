'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../lib/api';

import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Box, TextField, InputAdornment, IconButton, 
  Tooltip, Chip, Stack, alpha, TableContainer, Avatar, TableSortLabel, Grid
} from '@mui/material';
import {
  Add, DeleteOutline, Visibility, 
  Business, LocationOn, CalendarToday, Inventory,
  FileUpload, FileDownload, CheckCircle, Description, RestartAlt, Search
} from '@mui/icons-material';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [role, setRole] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // ================= STATE FILTERING & SORTING =================
  const [colFilters, setColFilters] = useState({
    name: '',
    location: '',
    year: ''
  });
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');

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

  // ================= LOGIC FILTER & SORT CORE =================
  useEffect(() => {
    let result = [...assets];

    // Column Specific Logic (Name or Code)
    if (colFilters.name) {
      const q = colFilters.name.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.code.toLowerCase().includes(q)
      );
    }
    // Location Logic (Branch or specific Location)
    if (colFilters.location) {
      const q = colFilters.location.toLowerCase();
      result = result.filter(a => 
        (a.branch?.toLowerCase().includes(q)) || 
        (a.location?.toLowerCase().includes(q))
      );
    }
    // Year Logic
    if (colFilters.year) {
      result = result.filter(a => a.procurementYear?.toString().includes(colFilters.year));
    }

    // Sort Logic
    result.sort((a, b) => {
      let aVal = a[orderBy] || '';
      let bVal = b[orderBy] || '';
      
      if (order === 'desc') {
        return aVal < bVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    setFiltered(result);
  }, [colFilters, assets, order, orderBy]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleColFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColFilters({
      ...colFilters,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setColFilters({ name: '', location: '', year: '' });
    setOrder('asc');
    setOrderBy('name');
  };

  // ================= ACTIONS =================
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
    <Container maxWidth="xl" sx={{ mt: 3, pb: 6 }}>
      {/* HEADER SECTION - Styled like Work Orders */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Assets Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track school facility assets in real-time.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={exportCsv}
            sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
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
                sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: file ? 'white' : 'white' }}
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
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(124, 124, 255, 0.4)' }}
              >
                New Asset
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* FILTER PANEL - UI Synced with Work Orders */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', bgcolor: alpha('#fff', 0.02) }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>ASSET NAME / CODE</Typography>
            <TextField 
                fullWidth size="small" name="name" placeholder="Search name or code..." 
                value={colFilters.name} onChange={handleColFilterChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>LOCATION / BRANCH</Typography>
            <TextField 
                fullWidth size="small" name="location" placeholder="Search branch or room..." 
                value={colFilters.location} onChange={handleColFilterChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} 
            />
          </Grid>
          <Grid item xs={8} md={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>PROCUREMENT YEAR</Typography>
            <TextField 
                fullWidth size="small" name="year" placeholder="e.g. 2023" 
                value={colFilters.year} onChange={handleColFilterChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} 
            />
          </Grid>
          <Grid item xs={4} md={1}>
            <Button fullWidth variant="outlined" onClick={resetFilters} sx={{ height: '40px', borderRadius: '10px', borderColor: alpha('#fff', 0.1), color: 'white' }}>
                <RestartAlt />
            </Button>
          </Grid>
        </Grid>
        
        {file && (
            <Box sx={{ mt: 2 }}>
                <Chip icon={<Description />} label={file.name} onDelete={() => setFile(null)} variant="outlined" sx={{ borderRadius: '8px', color: 'white' }} />
            </Box>
        )}
      </Paper>

      {/* ASSET TABLE - UI Synced with Work Orders */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: alpha('#121212', 0.6), overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha('#7C7CFF', 0.08) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>
                  Asset Info
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'branch'} direction={orderBy === 'branch' ? order : 'asc'} onClick={() => handleSort('branch')}>
                  Branch / Location
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'procurementYear'} direction={orderBy === 'procurementYear' ? order : 'asc'} onClick={() => handleSort('procurementYear')}>
                  Procurement
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                    <Avatar variant="rounded" sx={{ bgcolor: alpha('#7C7CFF', 0.1), color: '#7C7CFF', width: 42, height: 42 }}>
                      <Inventory />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        {asset.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7C7CFF', fontFamily: 'monospace', fontWeight: 700, bgcolor: alpha('#7C7CFF', 0.05), px: 0.5 }}>
                        {asset.code}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{asset.branch}</Typography>
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
                    sx={{ borderRadius: '6px', fontWeight: 600, bgcolor: alpha('#fff', 0.05), color: 'text.secondary' }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => router.push(`/assets/${asset.id}`)} sx={{ color: 'white' }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {role === 'ADMIN' && (
                      <Tooltip title="Delete Asset">
                        <IconButton 
                          size="small" 
                          sx={{ color: alpha('#f44336', 0.7), '&:hover': { bgcolor: alpha('#f44336', 0.1), color: '#f44336' } }}
                          onClick={() => deleteAsset(asset.id)}
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