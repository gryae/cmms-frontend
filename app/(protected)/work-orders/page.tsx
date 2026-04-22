'use client';

import { useEffect, useState } from 'react';
import api, { getUserFromToken } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Box, Button, IconButton, Stack, Tooltip, TableContainer,
  alpha, TextField, InputAdornment, MenuItem, FormControl, Select, Grid, TableSortLabel,
  TablePagination, Checkbox, ListItemText, OutlinedInput, Chip
} from '@mui/material';
import {
  DeleteOutline, Add, DashboardOutlined, CalendarMonthOutlined,
  PlayArrowOutlined, CheckCircleOutline, AssignmentOutlined,
  Search, PersonOutline, RestartAlt,
} from '@mui/icons-material';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StatusChip from '../../../components/StatusChip';

export default function WorkOrdersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  
  // ================= STATE FILTERING & SORTING =================
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<string[]>([]);
  const [unitFilter, setUnitFilter] = useState<string[]>([]); // NEW: Unit Filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sort State
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');

  // ================= MULTIPLE SELECT & PAGINATION =================
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Opsi Unit sesuai request lo
  const unitOptions = ['TK', 'SD', 'SMP', 'SMA', 'NonUnit'];

  useEffect(() => {
    const user = getUserFromToken();
    setRole(user?.role ?? null);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/work-orders');
      setWorkOrders(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  // ================= LOGIC FILTERING & SORTING CORE =================
  useEffect(() => {
    let result = [...workOrders];

    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(wo => 
        wo.title?.toLowerCase().includes(q) || 
        wo.asset?.name?.toLowerCase().includes(q) ||
        wo.createdBy?.email?.toLowerCase().includes(q) ||
        wo.createdBy?.name?.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter.length > 0) {
      result = result.filter(wo => {
        const matchStatus = statusFilter.includes(wo.status);
        const matchOverdue = statusFilter.includes('OVERDUE') && wo.isOverdue;
        return matchStatus || matchOverdue;
      });
    }

    if (priorityFilter.length > 0) result = result.filter(wo => priorityFilter.includes(wo.priority));
    if (assigneeFilter.length > 0) result = result.filter(wo => wo.assignee?.email && assigneeFilter.includes(wo.assignee.email));
    if (creatorFilter.length > 0) result = result.filter(wo => wo.createdBy?.email && creatorFilter.includes(wo.createdBy.email));
    
    if (unitFilter.length > 0) {
      result = result.filter(wo => wo.unit && unitFilter.includes(wo.unit));
    }
    
    // Date Filter
    if (startDate) result = result.filter(wo => new Date(wo.createdAt) >= new Date(startDate));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(wo => new Date(wo.createdAt) <= end);
    }

    // Sorting Logic
    result.sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (orderBy === 'asset') { aValue = a.asset?.name || ''; bValue = b.asset?.name || ''; }
      if (orderBy === 'unit') { aValue = a.unit || ''; bValue = b.unit || ''; } // Sort by Unit langsung
      if (orderBy === 'assignee') { aValue = a.assignee?.email || ''; bValue = b.assignee?.email || ''; }
      if (orderBy === 'createdBy') { aValue = a.createdBy?.email || a.createdBy?.name || ''; bValue = b.createdBy?.email || b.createdBy?.name || ''; }

      if (order === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    setFilteredData(result);
    setPage(0); // Reset page setiap filter berubah
  }, [search, statusFilter, priorityFilter, assigneeFilter, creatorFilter, unitFilter, startDate, endDate, workOrders, order, orderBy]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setAssigneeFilter([]);
    setCreatorFilter([]);
    setUnitFilter([]);
    setStartDate('');
    setEndDate('');
    setOrder('desc');
    setOrderBy('createdAt');
  };

  const uniqueAssignees = Array.from(new Set(workOrders.map(wo => wo.assignee?.email).filter(Boolean)));
  const uniqueCreators = Array.from(new Set(workOrders.map(wo => wo.createdBy?.email).filter(Boolean)));

  // ================= MULTI SELECT HANDLERS =================
  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(new Set(paginated.map((wo: any) => wo.id)));
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
    if (!selected.size) return alert('No work orders selected!');
    if (!confirm(`Delete ${selected.size} selected work orders?`)) return;
    try {
      await Promise.all(Array.from(selected).map(id => api.delete(`/work-orders/${id}`)));
      setSelected(new Set());
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete selected work orders');
    }
  };

  // ================= PAGINATION DATA =================
  const paginated = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ================= ACTIONS =================
  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/work-orders/${id}/status`, { status });
    loadData();
  };

  const deleteWO = async (e: React.MouseEvent, wo: any) => {
    e.stopPropagation();
    if (wo.parts && wo.parts.length > 0) {
      alert('Cannot delete Work Order with consumed spare parts');
      return;
    }
    if (!confirm('Delete this Work Order?')) return;
    await api.delete(`/work-orders/${wo.id}`);
    loadData();
  };

const sendWhatsApp = (wo: any) => {
  const { assignee, asset, id, title, dueDate, unit } = wo; // Ambil unit dari wo
  const phone = assignee?.phoneNumber;

  if (!phone) {
    alert("Technician phone number not available");
    return;
  }

  const formattedDate = dueDate 
    ? new Date(dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) 
    : '-';

  const message = [
    `Halo Rekan *${assignee?.name || assignee?.email}*`,
    '',
    `Mohon bantuannya untuk pengecekan *Work Order #${id}*`,
    '',
    `*Detail WO:*`,
    ` Nama WO: ${title}`,
    ` Unit: ${unit || '-'}`, // Unit dari WO
    ` Asset: ${asset?.name || '-'}`,
    ` Deadline: ${formattedDate}`,
    '',
    `Terima kasih!`,
    '',
    `Link WO: ${window.location.origin}/work-orders/${id}`
  ].join('\n');

  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

  return (
    <Container maxWidth="xl" sx={{ mt: 3, pb: 6 }}>
      {/* HEADER & ACTIONS */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Work Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {filteredData.length} work orders
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {selected.size > 0 && (
            <Button variant="contained" color="error" startIcon={<DeleteOutline />} onClick={deleteSelected} sx={{ borderRadius: '12px', textTransform: 'none' }}>
              Delete Selected ({selected.size})
            </Button>
          )}

          {role && ['ADMIN', 'SUPERVISOR','USER'].includes(role) && (
            <Button
              variant="outlined"
              startIcon={<DashboardOutlined />}
              onClick={() => router.push('/work-orders/kanban')}
              sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
            >
              Kanban
            </Button>
          )}

          {role && ['ADMIN', 'SUPERVISOR', 'TECHNICIAN','USER'].includes(role) && (
            <Button
              variant="outlined"
              startIcon={<CalendarMonthOutlined />}
              onClick={() => router.push('/work-orders/calendar')}
              sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
            >
              Calendar
            </Button>
          )}

          {role && ['ADMIN', 'SUPERVISOR','USER'].includes(role) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/work-orders/new')}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(124, 124, 255, 0.4)' }}
            >
              New Order
            </Button>
          )}
        </Stack>
      </Box>
      

      {/* FILTER PANEL */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', bgcolor: alpha('#fff', 0.02) }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>SEARCH</Typography>
            <TextField fullWidth size="small" placeholder="Title, Asset, or Staff..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={6} md={1.2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>STATUS</Typography>
            <FormControl fullWidth size="small">
              <Select 
                multiple
                displayEmpty
                value={statusFilter} 
                onChange={(e) => setStatusFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                renderValue={(selected) => {
                  if (selected.length === 0) return <span style={{ opacity: 0.6 }}>All Status</span>;
                  return selected.join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="OPEN"><Checkbox size="small" checked={statusFilter.includes('OPEN')} /><ListItemText primary="Open" /></MenuItem>
                <MenuItem value="ASSIGNED"><Checkbox size="small" checked={statusFilter.includes('ASSIGNED')} /><ListItemText primary="Assigned" /></MenuItem>
                <MenuItem value="IN_PROGRESS"><Checkbox size="small" checked={statusFilter.includes('IN_PROGRESS')} /><ListItemText primary="In Progress" /></MenuItem>
                <MenuItem value="DONE"><Checkbox size="small" checked={statusFilter.includes('DONE')} /><ListItemText primary="Done" /></MenuItem>
                <MenuItem value="OVERDUE"><Checkbox size="small" checked={statusFilter.includes('OVERDUE')} /><ListItemText primary="⚠️ OVERDUE" sx={{ color: '#f44336' }} /></MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>PRIORITY</Typography>
            <FormControl fullWidth size="small">
              <Select 
                multiple
                displayEmpty
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                renderValue={(selected) => {
                  if (selected.length === 0) return <span style={{ opacity: 0.6 }}>All Priority</span>;
                  return selected.join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="LOW"><Checkbox size="small" checked={priorityFilter.includes('LOW')} /><ListItemText primary="Low" /></MenuItem>
                <MenuItem value="MEDIUM"><Checkbox size="small" checked={priorityFilter.includes('MEDIUM')} /><ListItemText primary="Medium" /></MenuItem>
                <MenuItem value="HIGH"><Checkbox size="small" checked={priorityFilter.includes('HIGH')} /><ListItemText primary="High" /></MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* UNIT FILTER (DIRECT FROM WO) */}
          <Grid item xs={6} md={1.2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>UNIT</Typography>
            <FormControl fullWidth size="small">
              <Select 
                multiple
                displayEmpty
                value={unitFilter} 
                onChange={(e) => setUnitFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                renderValue={(selected) => {
                  if (selected.length === 0) return <span style={{ opacity: 0.6 }}>All Units</span>;
                  return selected.join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                {unitOptions.map(u => (
                  <MenuItem key={u} value={u}>
                    <Checkbox size="small" checked={unitFilter.includes(u)} />
                    <ListItemText primary={u} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>ASSIGNEE</Typography>
            <FormControl fullWidth size="small">
              <Select 
                multiple
                displayEmpty
                value={assigneeFilter} 
                onChange={(e) => setAssigneeFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                renderValue={(selected) => {
                  if (selected.length === 0) return <span style={{ opacity: 0.6 }}>All Staff</span>;
                  return selected.map(s => s.split('@')[0]).join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                {uniqueAssignees.map((email: any) => (
                  <MenuItem key={email} value={email}>
                    <Checkbox size="small" checked={assigneeFilter.includes(email)} />
                    <ListItemText primary={email.split('@')[0]} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>CREATED BY</Typography>
            <FormControl fullWidth size="small">
              <Select 
                multiple
                displayEmpty
                value={creatorFilter} 
                onChange={(e) => setCreatorFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                renderValue={(selected) => {
                  if (selected.length === 0) return <span style={{ opacity: 0.6 }}>All Creators</span>;
                  return selected.map(s => s.split('@')[0]).join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                {uniqueCreators.map((email: any) => (
                  <MenuItem key={email} value={email}>
                    <Checkbox size="small" checked={creatorFilter.includes(email)} />
                    <ListItemText primary={email.split('@')[0]} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>FROM</Typography>
            <TextField fullWidth size="small" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={6} md={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>TO</Typography>
            <TextField fullWidth size="small" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} md={0.4}>
            <Button fullWidth variant="outlined" onClick={resetFilters} sx={{ height: '40px', borderRadius: '10px', borderColor: alpha('#fff', 0.1) }}><RestartAlt /></Button>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE SECTION */}
      {/* TABLE SECTION */}
      <TableContainer component={Paper} elevation={0} sx={{ 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.08)', 
        background: alpha('#121212', 0.6), 
        overflow: 'auto' // Pastikan overflow auto
      }}>
      <Table sx={{ minWidth: 1100 }}> {/* Set minWidth supaya tidak terlalu sempit */}
          <TableHead sx={{ bgcolor: alpha('#7C7CFF', 0.08) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                <TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>Title</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'priority'} direction={orderBy === 'priority' ? order : 'asc'} onClick={() => handleSort('priority')}>Priority</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>Status</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'asset'} direction={orderBy === 'asset' ? order : 'asc'} onClick={() => handleSort('asset')}>Asset</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'assignee'} direction={orderBy === 'assignee' ? order : 'asc'} onClick={() => handleSort('assignee')}>Assignee</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'unit'} direction={orderBy === 'unit' ? order : 'asc'} onClick={() => handleSort('unit')}>Unit</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleSort('createdAt')}>Created At</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'createdBy'} direction={orderBy === 'createdBy' ? order : 'asc'} onClick={() => handleSort('createdBy')}>Created By</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'dueDate'} direction={orderBy === 'dueDate' ? order : 'asc'} onClick={() => handleSort('dueDate')}>Due Date</TableSortLabel>
              </TableCell>

              {/* STICKY ACTIONS HEADER */}
              <TableCell
                align="right"
                sx={{ fontWeight: 700, position: 'sticky', right: 0, bgcolor: '#1c1c21', zIndex: 2, boxShadow: '-4px 0 8px rgba(0,0,0,0.3)' }}
              >
                Actions
              </TableCell>
              <TableCell padding="checkbox" align="center">
                <Checkbox
                  size="small"
                  checked={paginated.length > 0 && paginated.every((wo: any) => selected.has(wo.id))}
                  onChange={handleSelectAllClick}
                  sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#7C7CFF' } }}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((wo: any) => (
              <TableRow
                key={wo.id}
                hover
                onClick={() => router.push(`/work-orders/${wo.id}`)}
                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 }, bgcolor: selected.has(wo.id) ? alpha('#7C7CFF', 0.04) : 'transparent' }}
              >
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{wo.title}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: wo.priority === 'HIGH' ? '#f44336' : '#7C7CFF', boxShadow: `0 0 6px ${wo.priority === 'HIGH' ? '#f44336' : '#7C7CFF'}` }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{wo.priority}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusChip status={wo.status} />
                    {wo.isOverdue && <StatusChip status="OVERDUE" />}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssignmentOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{wo.asset?.name || '-'}</Typography>
                  </Stack>
                </TableCell>
                <TableCell><Typography variant="body2">{wo.assignee?.email?.split('@')[0] || wo.assignee?.name || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{wo.unit || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(wo.createdAt).toLocaleDateString()}</Typography></TableCell>
                <TableCell><Typography variant="body2">{wo.createdBy?.email?.split('@')[0] || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}</Typography></TableCell>

                {/* STICKY ACTIONS CELL */}
                <TableCell
                  align="right"
                  sx={{ position: 'sticky', right: 0, bgcolor: '#16161a', zIndex: 1, boxShadow: '-4px 0 8px rgba(0,0,0,0.3)' }}
                >
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                    {role === 'TECHNICIAN' && wo.status === 'ASSIGNED' && (
                      <Button size="small" variant="contained" startIcon={<PlayArrowOutlined />} onClick={() => updateStatus(wo.id, 'IN_PROGRESS')} sx={{ borderRadius: '8px', textTransform: 'none' }}>Start</Button>
                    )}
                    {role === 'TECHNICIAN' && wo.status === 'IN_PROGRESS' && (
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutline />} onClick={() => updateStatus(wo.id, 'DONE')} sx={{ borderRadius: '8px', textTransform: 'none' }}>Finish</Button>
                    )}
                    {wo.assignee?.phoneNumber && (
                      <IconButton size="small" sx={{ color: '#25D366' }} onClick={() => sendWhatsApp(wo)}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    )}
                    {role && ['ADMIN', 'SUPERVISOR', 'USER'].includes(role) && (
                      <IconButton size="small" sx={{ color: '#f44336' }} onClick={(e) => deleteWO(e, wo)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>

                {/* CHECKBOX */}
                <TableCell padding="checkbox" align="center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    size="small"
                    checked={selected.has(wo.id)}
                    onChange={() => handleSelect(wo.id)}
                    sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#7C7CFF' } }}
                  />
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    No work orders found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION FOOTER */}
        <Box sx={{
          px: 2, py: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          bgcolor: alpha('#fff', 0.01)
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Showing {filteredData.length === 0 ? 0 : page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </Typography>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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