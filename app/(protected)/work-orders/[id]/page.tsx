'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../../lib/api';
import {
  Container, Typography, Paper, Box, Divider, TextField, MenuItem,
  Button, Grid, Stack, IconButton, Avatar, Card, CardContent, alpha,
  Tooltip,Dialog,
} from '@mui/material';
import {
  Edit, Save, Cancel, CloudUpload, Delete, Send,
  BuildCircle, Schedule, Person, Description, History
} from '@mui/icons-material';

import StatusChip from '../../../../components/StatusChip';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [wo, setWo] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({ title: '', description: '', priority: '', assetId: '', assignedTo: '', dueDate: '' });
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [usedParts, setUsedParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [qty, setQty] = useState(1);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
const [previewImage, setPreviewImage] = useState<string | null>(null);


  // ================= INIT & LOAD =================
 useEffect(() => {
  const user = getUserFromToken();
  const userRole = user?.role ?? null;
  setRole(userRole);

  if (id) {
    loadWO();
    loadParts();
    loadAttachments();
    loadComments();
    api.get('/spare-parts').then(res => setSpareParts(res.data));

    // 🔐 HANYA ADMIN & SUPERVISOR
    if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
      loadTechnicians();
    }
  }
}, [id]);


  const loadComments = async () => {
    const res = await api.get(`/work-orders/${id}/comments`);
    setComments(res.data);
  };

  const loadWO = async () => {
    loadComments();
    const res = await api.get('/work-orders');
    const found = res.data.find((w: any) => w.id === id);
    if (!found) return;
    setWo(found);
    setStatus(found.status);
    setForm({
      title: found.title,
      description: found.description || '',
      priority: found.priority,
      assetId: found.assetId || '',
      assignedTo: found.assignedTo || '',
      dueDate: found.dueDate ? found.dueDate.split('T')[0] : '',
    });
  };

  const loadParts = async () => {
    const res = await api.get(`/work-orders/${id}/parts`);
    setUsedParts(res.data);
  };

  const loadAttachments = async () => {
    const res = await api.get(`/work-orders/${id}/attachments`);
    setAttachments(res.data);
  };

  const loadTechnicians = async () => {
    const res = await api.get('/users');
    setTechnicians(res.data.filter((u: any) => u.role === 'TECHNICIAN'));
  };

  // ================= HANDLERS =================
  const postStatusComment = async (newStatus: string) => {
    const statusLabel = newStatus.replace('_', ' ');
    await api.post(`/work-orders/${id}/comments`, {
      message: `System: Status updated to ${statusLabel}`,
    });
    loadComments();
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await api.post(`/work-orders/${id}/comments`, { message: commentText });
    setCommentText('');
    loadComments();
  };

  const saveEdit = async () => {
    await api.patch(`/work-orders/${id}`, form);
    setEditMode(false);
    loadWO();
  };

  const addPart = async () => {
    if (!selectedPart || qty <= 0) return;
    await api.post(`/work-orders/${id}/parts`, { sparePartId: selectedPart, quantity: qty });
    setSelectedPart(''); setQty(1); loadParts();
  };

  const removePart = async (usageId: string) => {
    await api.delete(`/work-orders/parts/${usageId}`);
    loadParts();
  };

  const uploadAttachment = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/work-orders/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFile(null); loadAttachments();
  };

  const openPreview = (url: string) => {
  setPreviewImage(url);
  setPreviewOpen(true);
};

const closePreview = () => {
  setPreviewOpen(false);
  setPreviewImage(null);
};


  const StatusCard = ({ label, value, color }: any) => {
    const active = status === value;
    return (
      <Box
        onClick={async () => {
          if (active) return;
          await api.patch(`/work-orders/${id}/status`, { status: value });
          await postStatusComment(value);
          setStatus(value);
          loadWO();
        }}
        sx={{
          flex: 1, p: 2, cursor: 'pointer', borderRadius: 2, textAlign: 'center',
          border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
          bgcolor: active ? alpha(color, 0.1) : 'background.paper',
          transition: '0.2s',
          '&:hover': { bgcolor: alpha(color, 0.2) },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: active ? color : 'text.secondary' }}>{label}</Typography>
      </Box>
    );
  };

  if (!wo) return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="xl" sx={{ pb: 5 }}>
      {/* TOP HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <StatusChip status={wo.status} />
            <Typography variant="caption" sx={{ bgcolor: alpha('#7C7CFF', 0.1), px: 1, py: 0.5, borderRadius: 1, color: '#7C7CFF', fontWeight: 'bold' }}>
              #{wo.id.slice(-6).toUpperCase()}
            </Typography>
          </Stack>
          {editMode ? (
            <TextField fullWidth variant="standard" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} sx={{ input: { fontSize: '2rem', fontWeight: 800 } }} />
          ) : (
            <Typography variant="h3" fontWeight={800}>{wo.title}</Typography>
          )}
        </Box>

        {role && ['ADMIN', 'SUPERVISOR'].includes(role) && (
          <Button
            variant={editMode ? "contained" : "outlined"}
            startIcon={editMode ? <Save /> : <Edit />}
            onClick={() => { if (editMode) saveEdit(); setEditMode(!editMode); }}
            color={editMode ? "success" : "primary"}
          >
            {editMode ? 'Save Changes' : 'Edit WO'}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* LEFT COLUMN: DETAILS & PARTS */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* MAIN INFO */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" /> Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  {editMode ? (
                    <TextField select fullWidth size="small" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <MenuItem value="LOW">LOW</MenuItem><MenuItem value="MEDIUM">MEDIUM</MenuItem><MenuItem value="HIGH">HIGH</MenuItem>
                    </TextField>
                  ) : (
                    <Typography fontWeight={600}>{wo.priority}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  {editMode ? (
                    <TextField type="date" fullWidth size="small" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  ) : (
                    <Typography fontWeight={600}>{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  {editMode ? (
                    <TextField multiline rows={3} fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  ) : (
                    <Typography>{wo.description || 'No description provided.'}</Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* STATUS UPDATE BRIDGE */}
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#7C7CFF', 0.02) }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Workflow Status</Typography>
              <Stack direction="row" spacing={2}>
                <StatusCard label="OPEN" value="OPEN" color="#2196f3" />
                <StatusCard label="IN PROGRESS" value="IN_PROGRESS" color="#ff9800" />
                <StatusCard label="DONE" value="DONE" color="#4caf50" />
              </Stack>
            </Paper>

            {/* SPARE PARTS */}
            {/* <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildCircle color="primary" /> Spare Parts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField select label="Part" size="small" fullWidth value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
                  {spareParts.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</MenuItem>)}
                </TextField>
                <TextField type="number" label="Qty" size="small" sx={{ width: 80 }} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                <Button variant="contained" onClick={addPart}>Add</Button>
              </Box>
              <Stack spacing={1}>
                {usedParts.map(p => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: alpha('#fff', 0.03) }}>
                    <Typography variant="body2">{p.sparePart.name} <b>× {p.quantity}</b></Typography>
                    <IconButton size="small" color="error" onClick={() => removePart(p.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Stack>
            </Paper> */}
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: ASSIGNEE, ATTACHMENTS, COMMENTS */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* ASSIGNEE */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Assignee</Typography>
              {editMode ? (
                <TextField select fullWidth size="small" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <MenuItem value="">Unassigned</MenuItem>
                  {technicians.map(t => <MenuItem key={t.id} value={t.id}>{t.email}</MenuItem>)}
                </TextField>
              ) : (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{wo.assignee?.email?.[0].toUpperCase() || '?'}</Avatar>
                  <Typography>{wo.assignee?.email || 'Not Assigned'}</Typography>
                </Stack>
              )}
            </Paper>

            {/* ATTACHMENTS */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Attachments</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button component="label" fullWidth variant="outlined" startIcon={<CloudUpload />} sx={{ borderStyle: 'dashed' }}>
                  Select File
                  <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </Button>
                {file && <Button variant="contained" onClick={uploadAttachment}>Upload</Button>}
              </Stack>
              <Grid container spacing={1}>
                {attachments.map(a => (
                  <Grid item xs={4} key={a.id}>
                    <Tooltip title={a.fileName}>
<Box
  component="img"
  src={a.url}
  onClick={() => openPreview(a.url)}
  sx={{
    width: '100%',
    height: 60,
    borderRadius: 1,
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'zoom-in',
    transition: '0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  }}
/>

                    </Tooltip>
                    <Dialog
  open={previewOpen}
  onClose={closePreview}
  maxWidth="lg"
>
  <Box
    sx={{
      position: 'relative',
      bgcolor: 'black',
    }}
  >
    <IconButton
      onClick={closePreview}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: 'white',
        zIndex: 10,
      }}
    >
      <Cancel />
    </IconButton>

    {previewImage && (
      <Box
        component="img"
        src={previewImage}
        sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    )}
  </Box>
</Dialog>

                  </Grid>
                ))}
              </Grid>
              
            </Paper>

            {/* COMMENTS SECTION */}
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', height: 500 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History fontSize="small" /> Activity Log
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1 }}>
                {comments.map((c) => (
                  <Box key={c.id} sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: c.message.startsWith('System:') ? alpha('#7C7CFF', 0.05) : alpha('#fff', 0.03) }}>
                    <Typography variant="caption" color="primary" fontWeight={700}>{c.user.email.split('@')[0]}</Typography>
                    <Typography variant="body2" sx={{ my: 0.5 }}>{c.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleTimeString()}</Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth placeholder="Add comment..." size="small" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <IconButton color="primary" onClick={submitComment}><Send /></IconButton>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}