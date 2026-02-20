'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';

import {
  Container, Typography, Paper, TextField, MenuItem,
  Button, Box, Grid, Stack, Divider, alpha, InputAdornment
} from '@mui/material';
import {
  Assignment, Description, PriorityHigh, Event, 
  Construction, Person, ArrowBack, Save
} from '@mui/icons-material';

type Asset = { id: string; name: string; location:string };
type Technician = { id: string; email: string ,name:string};

export default function NewWorkOrderPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assetId, setAssetId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/assets').then((res) => setAssets(res.data));
    api.get('/users').then((res) => {
      setTechs(res.data.filter((u: any) => u.role === 'TECHNICIAN'));
    });
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/work-orders', {
        title,
        description,
        priority,
        assetId: assetId || undefined,
        assignedTo: assignedTo || undefined,
        dueDate,
      });
      router.push('/work-orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Button 
          variant="text" 
          startIcon={<ArrowBack />} 
          onClick={() => router.back()}
          sx={{ color: 'text.secondary' }}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={800}>Create New WO</Typography>
      </Stack>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          border: '1px solid rgba(255,255,255,0.05)',
          bgcolor: 'background.paper' 
        }}
      >
        <Grid container spacing={3}>
          {/* General Information Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
              General Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Work Order Title"
              placeholder="e.g., Monthly HVAC Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Assignment fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              placeholder="Detail the task instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          {/* Logistics & Scheduling Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
              Logistics & Scheduling
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PriorityHigh fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="EMERGENCY" sx={{ color: 'error.main', fontWeight: 'bold' }}>EMERGENCY</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Target Asset"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Construction fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value=""><em>None / Unlinked</em></MenuItem>
              {assets.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name + " - " + a.location}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Assign Technician"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value=""><em>Leave Unassigned</em></MenuItem>
              {techs.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name + " - " + t.email}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={submit}
                disabled={!title || loading}
                sx={{ 
                  borderRadius: 2, 
                  px: 6,
                  bgcolor: 'primary.main',
                  boxShadow: `0 8px 16px ${alpha('#7C7CFF', 0.2)}`,
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {loading ? 'Creating...' : 'Create Work Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}