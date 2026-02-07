'use client';

import { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, TextField, Button, Box, Divider,
  Grid, Stack, alpha, IconButton, Tooltip, Avatar, Chip
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { 
  ArrowBack, Edit, Delete, Save, Close, 
  Inventory, Business, LocationOn, Event, History
} from '@mui/icons-material';

//INFO CARD
type infoCardProps = {
  label: string;
  value: any;
  icon: React.ReactNode;
  field: string;
  editMode: boolean;
  form:any;
  setForm: (v:any) => void;
};
const InfoCard = ({ label, value, icon, field,editMode,form,setForm }: any) => {
   return (
   <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>
      {editMode ? (
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={form[field] ?? ''}
          onChange={(e) => setForm((prev:any) => ({ ...prev, [field]: e.target.value }))}
          sx={{ bgcolor: alpha('#fff', 0.02) }}
        />
      ) : (
        <Typography variant="body1" fontWeight={600} sx={{ ml: 4 }}>
          {value || '-'}
        </Typography>
      )}
    </Box>
   );
};


export default function AssetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [asset, setAsset] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  const loadAsset = async () => {
    const res = await api.get(`/assets/${id}`);
    setAsset(res.data);
    setForm(res.data);
  };

  const save = async () => {
    await api.patch(`/assets/${id}`, form);
    setEditMode(false);
    loadAsset();
  };

  const remove = async () => {
    if (!confirm('Delete this asset? This action cannot be undone.')) return;
    await api.delete(`/assets/${id}`);
    router.push('/assets');
  };

  useEffect(() => {
    loadAsset();
  }, [id]);

  if (!asset) return null;

  

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER NAVIGATION */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push('/assets')}
          sx={{ color: 'text.secondary' }}
        >
          Back to Assets
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "inherit" : "primary"}
            startIcon={editMode ? <Close /> : <Edit />}
            onClick={() => setEditMode(!editMode)}
            sx={{ borderRadius: 2 }}
          >
            {editMode ? 'Cancel' : 'Edit Asset'}
          </Button>
          {!editMode && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Delete />} 
              onClick={remove}
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: ASSET INFO */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.05)',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Dekorasi Aksen Warna */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: 'primary.main' }} />
            
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                <Inventory fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>{asset.name}</Typography>
                <Typography variant="body2" color="primary" fontWeight={700}>{asset.code}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3, opacity: 0.5 }} />

            <InfoCard label="Asset Name" value={asset.name} field="name" icon={<Inventory sx={{ fontSize: 18, color: 'text.secondary' }} />} editMode={editMode} form={form} setForm={setForm} />
            <InfoCard label="Asset Code" value={asset.code} field="code" icon={<Inventory sx={{ fontSize: 18, color: 'text.secondary' }} />} editMode={editMode} form={form} setForm={setForm}/>
            <InfoCard label="Branch" value={asset.branch} field="branch" icon={<Business sx={{ fontSize: 18, color: 'text.secondary' }} />} editMode={editMode} form={form} setForm={setForm}/>
            <InfoCard label="Location" value={asset.location} field="location" icon={<LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />} editMode={editMode} form={form} setForm={setForm}/>
            <InfoCard label="Procurement Year" value={asset.procurementYear} field="procurementYear" icon={<Event sx={{ fontSize: 18, color: 'text.secondary' }} />} editMode={editMode} form={form} setForm={setForm}/>

            {editMode && (
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<Save />} 
                onClick={save}
                sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
              >
                Save Changes
              </Button>
            )}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: WORK ORDERS HISTORY */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <History color="primary" /> Maintenance History
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.05)',
              bgcolor: alpha('#fff', 0.01)
            }}
          >
            {asset.workOrders.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">No maintenance records found for this asset.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {asset.workOrders.map((wo: any) => (
                  <Paper
                    key={wo.id}
                    onClick={() => router.push(`/work-orders/${wo.id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: alpha('#fff', 0.03),
                      border: '1px solid transparent',
                      transition: '0.2s',
                      '&:hover': {
                        border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                        bgcolor: alpha('#3b82f6', 0.05),
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{wo.title}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {wo.id.substring(0,8)}</Typography>
                      </Box>
                      <Chip 
                        label={wo.status} 
                        size="small" 
                        color={wo.status === 'COMPLETED' ? 'success' : 'warning'} 
                        sx={{ fontWeight: 700, borderRadius: 1 }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}