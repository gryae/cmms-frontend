'use client';

import { useEffect, useState } from 'react';
import api, { getUserFromToken } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Box, Button, IconButton, Stack, Tooltip, TableContainer,
  alpha, TextField, InputAdornment, MenuItem, FormControl, Select, Grid, TableSortLabel
} from '@mui/material';
import {
  DeleteOutline, Add, DashboardOutlined, CalendarMonthOutlined,
  PlayArrowOutlined, CheckCircleOutline, AssignmentOutlined,
  Search, PersonOutline, RestartAlt
} from '@mui/icons-material';

import StatusChip from '../../../components/StatusChip';

export default function WorkOrdersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  
  // ================= STATE FILTERING & SORTING =================
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sort State
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');

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
        wo.title.toLowerCase().includes(q) || 
        wo.asset?.name?.toLowerCase().includes(q)
      );
    }

    // Status Filter (Including Overdue Logic)
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OVERDUE') {
        result = result.filter(wo => wo.isOverdue === true);
      } else {
        result = result.filter(wo => wo.status === statusFilter);
      }
    }

    if (priorityFilter !== 'ALL') result = result.filter(wo => wo.priority === priorityFilter);
    if (assigneeFilter !== 'ALL') result = result.filter(wo => wo.assignee?.email === assigneeFilter);
    
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

      // Deep access for nested objects
      if (orderBy === 'asset') { aValue = a.asset?.name || ''; bValue = b.asset?.name || ''; }
      if (orderBy === 'assignee') { aValue = a.assignee?.email || ''; bValue = b.assignee?.email || ''; }

      if (order === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    setFilteredData(result);
  }, [search, statusFilter, priorityFilter, assigneeFilter, startDate, endDate, workOrders, order, orderBy]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setOrder('desc');
    setOrderBy('createdAt');
  };

  const uniqueAssignees = Array.from(new Set(workOrders.map(wo => wo.assignee?.email).filter(Boolean)));

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

  return (
    <Container maxWidth="xl" sx={{ mt: 3, pb: 6 }}>
      {/* HEADER & ACTIONS */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Work Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage, track, and assign maintenance tasks efficiently.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {role && ['ADMIN', 'SUPERVISOR'].includes(role) && (
            <Button
              variant="outlined"
              startIcon={<DashboardOutlined />}
              onClick={() => router.push('/work-orders/kanban')}
              sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
            >
              Kanban
            </Button>
          )}
          
          {role && ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'].includes(role) && (
            <Button
              variant="outlined"
              startIcon={<CalendarMonthOutlined />}
              onClick={() => router.push('/work-orders/calendar')}
              sx={{ borderRadius: '12px', textTransform: 'none', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
            >
              Calendar
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/work-orders/new')}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(124, 124, 255, 0.4)' }}
          >
            New Order
          </Button>
        </Stack>
      </Box>

      {/* FILTER PANEL */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', bgcolor: alpha('#fff', 0.02) }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>SEARCH</Typography>
            <TextField fullWidth size="small" placeholder="Title or Asset..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>STATUS</Typography>
            <FormControl fullWidth size="small">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
                <MenuItem value="OVERDUE" sx={{ color: '#f44336', fontWeight: 'bold' }}>⚠️ OVERDUE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>PRIORITY</Typography>
            <FormControl fullWidth size="small">
              <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
                <MenuItem value="ALL">All Priority</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>ASSIGNEE</Typography>
            <FormControl fullWidth size="small">
              <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
                <MenuItem value="ALL">All Staff</MenuItem>
                {uniqueAssignees.map((email: any) => <MenuItem key={email} value={email}>{email.split('@')[0]}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>FROM</Typography>
            <TextField fullWidth size="small" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>TO</Typography>
            <TextField fullWidth size="small" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="outlined" onClick={resetFilters} sx={{ height: '40px', borderRadius: '10px', borderColor: alpha('#fff', 0.1) }}><RestartAlt /></Button>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE SECTION */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: alpha('#121212', 0.6), overflow: 'hidden' }}>
        <Table>
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
                <TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleSort('createdAt')}>Created At</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === 'dueDate'} direction={orderBy === 'dueDate' ? order : 'asc'} onClick={() => handleSort('dueDate')}>Due Date</TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((wo) => (
              <TableRow key={wo.id} hover onClick={() => router.push(`/work-orders/${wo.id}`)} sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}>
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
                      {wo.isOverdue && (
                        <StatusChip status="OVERDUE"/>
                      )}
                    </Stack>
                  </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssignmentOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{wo.asset?.name || '-'}</Typography>
                  </Stack>
                </TableCell>
                <TableCell><Typography variant="body2">{wo.assignee?.email?.split('@')[0] || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(wo.createdAt).toLocaleDateString()} ({wo.progressDays}d)</Typography></TableCell>
                <TableCell><Typography variant="body2" color={wo.isOverdue? 'error' : 'text.secondary'} fontWeight={wo.isOverdue?700:400}>{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}</Typography></TableCell>
    
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                    {role === 'TECHNICIAN' && wo.status === 'ASSIGNED' && (
                      <Button size="small" variant="contained" startIcon={<PlayArrowOutlined />} onClick={() => updateStatus(wo.id, 'IN_PROGRESS')} sx={{ borderRadius: '8px', textTransform: 'none' }}>Start</Button>
                    )}  
                    {role === 'TECHNICIAN' && wo.status === 'IN_PROGRESS' && (
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutline />} onClick={() => updateStatus(wo.id, 'DONE')} sx={{ borderRadius: '8px', textTransform: 'none' }}>Finish</Button>
                    )}
                    {role && ['ADMIN', 'SUPERVISOR'].includes(role) && (
                      <IconButton size="small" sx={{ color: alpha('#f44336', 0.7), '&:hover': { bgcolor: alpha('#f44336', 0.1), color: '#f44336' } }} onClick={(e) => deleteWO(e, wo)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}