'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  SettingsSuggestOutlined,
  CommentOutlined,
  BuildOutlined,
  AccessTime,
} from '@mui/icons-material';

import api from '../../../lib/api';
import StatCard from '../../../components/StatCard';
import Section from '../../../components/Section';

// Logic Type tetap sama
type Summary = {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  overdue: number;
};

type FeedItem = {
  id: string;
  type: 'work_order_created' | 'comment';
  message: string;
  timestamp: string;
  workOrderId: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byStatus, setByStatus] = useState<Record<string, number> | null>(null);
  const [byPriority, setByPriority] = useState<Record<string, number> | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      const [summaryRes, statusRes, priorityRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/by-status'),
        api.get('/dashboard/by-priority'),
      ]);
      setSummary(summaryRes.data);
      setByStatus(statusRes.data);
      setByPriority(priorityRes.data);
    };

    const loadFeed = async () => {
      const res = await api.get('/dashboard/feed');
      setFeed(res.data);
    };

    loadAll();
    loadFeed();
    const interval = setInterval(() => {
      loadFeed();
      loadAll();
    },7000); // Refresh every 7 seconds
    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress color="primary" />
        <Container sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">Initializing Dashboard...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'white' }}>
            Maintenance Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time status of your facility equipment
          </Typography>
        </Box>
        <Chip 
          label="Live System" 
          color="success" 
          size="small" 
          onDelete={() => {}} 
          deleteIcon={<Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />}
          sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.1)', 
            color: '#4caf50',
            fontWeight: 'bold',
            '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.4 }, '100%': { opacity: 1 } }
          }} 
        />
      </Box>

      <Grid container spacing={3}>
        {/* KPI SECTION */}
        <Grid item xs={12} md={8}>
          <Section title="Key Metrics">
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <StatCard title="Total WO" value={summary.total} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="Open" value={summary.open} color="#FFA726" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="In Progress" value={summary.inProgress} color="#7C7CFF" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="Done" value={summary.done} color="#66BB6A" />
              </Grid>
            </Grid>
          </Section>

          {/* BREAKDOWN SECTION - Diatur horizontal agar balance */}
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Section title="By Status">
                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {byStatus && Object.entries(byStatus).map(([status, count]) => (
                    <Box key={status} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>{status}</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">{count}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / summary.total) * 100} 
                        sx={{ height: 6, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)' }} 
                      />
                    </Box>
                  ))}
                </Paper>
              </Section>
            </Grid>
            <Grid item xs={12} md={6}>
              <Section title="By Priority">
                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {byPriority && Object.entries(byPriority).map(([priority, count]) => (
                    <Box key={priority} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: priority === 'High' ? '#f44336' : '#7C7CFF' }} />
                        <Typography variant="body2">{priority}</Typography>
                      </Stack>
                      <Typography variant="subtitle2" sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, py: 0.5, borderRadius: 1 }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Section>
            </Grid>
          </Grid>
        </Grid>

        {/* LIVE ACTIVITY SECTION */}
        <Grid item xs={12} md={4}>
          <Section title="Live Activity Feed">
            <Paper
              elevation={0}
              sx={{
                p: 0,
                height: '75vh',
                overflowY: 'auto',
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.05)',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
              }}
            >
              {feed.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No recent activity</Typography>
                </Box>
              ) : (
                feed.map((f, index) => (
                  <Box
                    key={f.id}
                    onClick={() => router.push(`/work-orders/${f.workOrderId}`)}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      transition: '0.2s',
                      borderLeft: '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'rgba(124, 124, 255, 0.05)',
                        borderLeftColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: f.type === 'comment' ? 'rgba(124, 124, 255, 0.1)' : 'rgba(102, 187, 106, 0.1)', 
                        color: f.type === 'comment' ? '#7C7CFF' : '#66BB6A',
                        width: 40, height: 40 
                      }}>
                        {f.type === 'comment' ? <CommentOutlined fontSize="small" /> : <BuildOutlined fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.4, mb: 0.5 }}>
                          {f.message}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    {index !== feed.length - 1 && <Divider sx={{ mt: 2.5, opacity: 0.5 }} />}
                  </Box>
                ))
              )}
            </Paper>
          </Section>
        </Grid>
      </Grid>
    </Container>
  );
}