'use client';

import { useEffect, useState } from 'react';
import api, { getUserFromToken } from '../../../lib/api';
import {
  Container, Typography, Box, Paper, Select, MenuItem, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Stack, Divider, alpha, Tooltip, Chip
} from '@mui/material';
import {
  DeleteOutline, PersonAdd, Security, MailOutline, 
  AdminPanelSettings, SupervisorAccount, Engineering
} from '@mui/icons-material';

const ROLES = ['ADMIN', 'TECHNICIAN','USER'];

// Helper untuk icon berdasarkan role
const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'ADMIN': return <AdminPanelSettings sx={{ fontSize: 18, color: '#f44336' }} />;
    case 'SUPERVISOR': return <SupervisorAccount sx={{ fontSize: 18, color: '#2196f3' }} />;
    case 'USER': return <SupervisorAccount sx={{ fontSize: 18, color: '#2196f3' }} />;
    default: return <Engineering sx={{ fontSize: 18, color: '#4caf50' }} />;
  }
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'TECHNICIAN', name:''});

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.role !== 'ADMIN') {
      window.location.href = '/dashboard';
      return;
    }
    load();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Cannot delete this user');
    }
  };

  const createUser = async () => {
    if (!form.email || !form.password) return alert('Fill all fields');
    try {
      await api.post('/users', form);
      setOpen(false);
      setForm({ email: '', password: '', role: 'TECHNICIAN',name:'' });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>User Management</Typography>
          <Typography variant="body2" color="text.secondary"> Manage access levels and system permissions </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
        >
          Add New User
        </Button>
      </Box>

      {/* USERS LIST TABLE-STYLE */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Table Header */}
        <Box sx={{ px: 3, py: 2, bgcolor: alpha('#fff', 0.02), display: { xs: 'none', md: 'flex' }, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{ flex: 2 }} variant="caption" fontWeight={700} color="text.secondary">USER INFO</Typography>
          <Typography sx={{ flex: 1 }} variant="caption" fontWeight={700} color="text.secondary">PERMISSIONS</Typography>
          <Typography sx={{ flex: 1 }} variant="caption" fontWeight={700} color="text.secondary" textAlign="right">ACTIONS</Typography>
        </Box>

        {users.map((u, index) => (
          <Box key={u.id}>
            <Box sx={{ 
              p: 2.5, px: 3, 
              display: 'flex', flexWrap: 'wrap', 
              alignItems: 'center', 
              transition: '0.2s',
              '&:hover': { bgcolor: alpha('#fff', 0.01) }
            }}>
              {/* User Info */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 2, minWidth: 250 }}>
                <Avatar sx={{ bgcolor: alpha('#7C7CFF', 0.1), color: '#7C7CFF', fontWeight: 'bold' }}>
                  {u.email[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} variant="body1">{u.email}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MailOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">System Member</Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Role Selector */}
              <Box sx={{ flex: 1, minWidth: 150, my: { xs: 2, md: 0 } }}>
                <Select
                  size="small"
                  value={u.role}
                  disabled={u.role === 'ADMIN'}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  startAdornment={<Box sx={{ mr: 1, display: 'flex' }}><RoleIcon role={u.role} /></Box>}
                  sx={{ 
                    borderRadius: 2, 
                    fontSize: '0.875rem', 
                    fontWeight: 600,
                    minWidth: 160,
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                    bgcolor: alpha('#fff', 0.03)
                  }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ flex: 1, textAlign: 'right', minWidth: 100 }}>
                <Tooltip title={u.role === 'ADMIN' ? "Cannot delete Admin" : "Delete User"}>
                  <span>
                    <IconButton 
                      color="error" 
                      disabled={u.role === 'ADMIN'} 
                      onClick={() => deleteUser(u.id)}
                      sx={{ bgcolor: alpha('#f44336', 0.05), '&:hover': { bgcolor: alpha('#f44336', 0.15) } }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            {index < users.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
          </Box>
        ))}
      </Paper>

      {/* CREATE USER MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, width: '100%', maxWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Register a new team member and assign their role.
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              label="Email Address"
              fullWidth
              variant="filled"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
             <TextField
              label="name"
              fullWidth
              variant="filled"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="filled"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Box>
              <Typography variant="caption" sx={{ ml: 1, mb: 0.5, display: 'block' }} color="text.secondary">Assign Role</Typography>
              <Select
                fullWidth
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={createUser} sx={{ borderRadius: 2, px: 4 }}>Create User</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}