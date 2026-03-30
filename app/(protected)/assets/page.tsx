'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../lib/api';

import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Box, TextField, InputAdornment, IconButton, 
  Tooltip, Chip, Stack, alpha, TableContainer, Avatar, TableSortLabel, Grid,
  TablePagination, Checkbox
} from '@mui/material';
import {
  Add, DeleteOutline, Visibility, 
  Business, LocationOn, CalendarToday, Inventory,
  FileUpload, FileDownload, CheckCircle, Description, RestartAlt, Search,
  ChevronLeft, ChevronRight
} from '@mui/icons-material';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [role, setRole] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // ================= STATE FILTERING & SORTING =================
  const [colFilters, setColFilters] = useState({ name: '', location: '', year: '' });
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');

  // ================= MULTIPLE SELECT & PAGINATION =================
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

    if (colFilters.name) {
      const q = colFilters.name.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.code.toLowerCase().includes(q)
      );
    }

    if (colFilters.location) {
      const q = colFilters.location.toLowerCase();
      result = result.filter(a => 
        (a.branch?.toLowerCase().includes(q)) || 
        (a.location?.toLowerCase().includes(q))
      );
    }

    if (colFilters.year) {
      result = result.filter(a => a.procurementYear?.toString().includes(colFilters.year));
    }

    result.sort((a, b) => {
      let aVal = a[orderBy] || '';
      let bVal = b[orderBy] || '';
      
      if (order === 'desc') return aVal < bVal ? 1 : -1;
      else return aVal > bVal ? 1 : -1;
    });

    setFiltered(result);
    setPage(0); // Reset page when filtering
  }, [colFilters, assets, order, orderBy]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleColFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColFilters({ ...colFilters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setColFilters({ name: '', location: '', year: '' });
    setOrder('asc');
    setOrderBy('name');
  };

  // ================= MULTI SELECT =================
  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(paginated.map(a => a.id)); // Select current page items
      setSelected(newSelected);
    } else {
      setSelected(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const deleteSelected = async () => {
    if (!selected.size) return alert("No assets selected!");
    if (!confirm(`Delete ${selected.size} selected assets?`)) return;

    try {
      await Promise.all(Array.from(selected).map(id => api.delete(`/assets/${id}`)));
      setSelected(new Set());
      loadAssets();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete selected assets");
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;

    try {
      await api.delete(`/assets/${id}`);
      loadAssets();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete asset');
    }
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
      const { created, skipped } = res.data;
      alert(`✅ Uploaded: ${created}\n⚠️ Skipped: ${skipped}`);
      setFile(null);
      loadAssets();
    } catch (err) { alert("Import failed!"); }
  };

  const isActionAuthorized = ['ADMIN', 'SUPERVISOR','USER','TECHNICIAN'].includes(role);

  // ================= PAGINATION DATA =================
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ mt: 3, pb: 6 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Assets Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Assets: {filtered.length}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" startIcon={<FileDownload />} onClick={exportCsv} sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}>
            Export
          </Button>

          {selected.size > 0 && (
            <Button variant="contained" color="error" startIcon={<DeleteOutline />} onClick={deleteSelected} sx={{ borderRadius: '12px', textTransform: 'none' }}>
              Delete Selected ({selected.size})
            </Button>
          )}

          {isActionAuthorized && (
            <>
              <Button
                variant={file ? "contained" : "outlined"}
                color={file ? "success" : "inherit"}
                component="label"
                startIcon={file ? <CheckCircle /> : <FileUpload />}
                sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
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

      {/* FILTER PANEL */}
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

      {/* ASSET TABLE */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: alpha('#121212', 0.6), overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha('#7C7CFF', 0.08) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>
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
              <TableCell padding="checkbox" align="center">
                <Checkbox
                  size="small"
                  checked={paginated.length > 0 && paginated.every(a => selected.has(a.id))}
                  onChange={handleSelectAllClick}
                  sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#7C7CFF' } }}
                />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((asset) => (
              <TableRow 
                key={asset.id} 
                hover 
                onClick={() => router.push(`/assets/${asset.id}`)}
                sx={{ 
                    cursor: 'pointer', 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: selected.has(asset.id) ? alpha('#7C7CFF', 0.04) : 'transparent'
                }}
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
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => router.push(`/assets/${asset.id}`)} sx={{ color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.05) } }}>
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

                <TableCell padding="checkbox" align="center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    size="small"
                    checked={selected.has(asset.id)}
                    onChange={() => handleSelect(asset.id)}
                    sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#7C7CFF' } }}
                  />
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    No assets found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* CUSTOM PAGINATION STYLING */}
        <Box sx={{ 
            px: 2, py: 1.5, 
            borderTop: '1px solid rgba(255,255,255,0.08)', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            bgcolor: alpha('#fff', 0.01)
        }}>
           <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
             Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} entries
           </Typography>

           <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage="Rows:"
            sx={{ 
                border: 'none',
                color: 'text.secondary',
                '& .MuiTablePagination-spacer': { display: 'none' },
                '& .MuiTablePagination-selectLabel': { fontSize: '12px', fontWeight: 600 },
                '& .MuiTablePagination-displayedRows': { display: 'none' },
                '& .MuiTablePagination-select': { borderRadius: '8px', bgcolor: alpha('#fff', 0.05), fontSize: '12px' },
                '& .MuiTablePagination-actions': { ml: 2 }
            }}
          />
        </Box>
      </TableContainer>
    </Container>
  );
}