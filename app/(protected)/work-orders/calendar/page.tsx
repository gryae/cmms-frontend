'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../../lib/api';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // Untuk hover/click yang lebih responsif

import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Stack,
  alpha,
  IconButton,
} from '@mui/material';
import { ArrowBackIosNew, EventAvailable } from '@mui/icons-material';

// Helper warna untuk kalender agar konsisten
const STATUS_COLORS = {
  DONE: '#4caf50',
  IN_PROGRESS: '#ff9800',
  OPEN: '#2196f3',
  HIGH_PRIORITY: '#f44336'
};

export default function WorkOrderCalendarPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !['ADMIN', 'SUPERVISOR', 'TECHNICIAN'].includes(user.role)) {
      router.push('/work-orders');
      return;
    }
    setRole(user.role);
  }, []);

  useEffect(() => {
    if (!role) return;
    api.get('/work-orders').then((res) => setWorkOrders(res.data));
  }, [role]);

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => router.push('/work-orders')}
            sx={{ bgcolor: alpha('#fff', 0.05), borderRadius: 2 }}
          >
            <ArrowBackIosNew fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800}>Maintenance Schedule</Typography>
            <Typography variant="body2" color="text.secondary">Monitor deadlines and ongoing work orders</Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {Object.entries(STATUS_COLORS).map(([label, color]) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {label.replace('_', ' ')}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* CALENDAR CONTAINER */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 4, 
          border: '1px solid rgba(255,255,255,0.05)',
          bgcolor: 'background.paper',
          // Custom CSS untuk FullCalendar agar match dengan tema
          '& .fc': {
            '--fc-border-color': 'rgba(255,255,255,0.05)',
            '--fc-today-bg-color': alpha('#7C7CFF', 0.1),
            fontFamily: 'inherit',
          },
          '& .fc-col-header-cell': { py: 2, color: 'text.secondary', fontWeight: 600 },
          '& .fc-daygrid-day-number': { p: 1, fontSize: '0.9rem', color: 'text.secondary' },
          '& .fc-event': {
            borderRadius: '6px',
            border: 'none',
            p: '2px 4px',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            '&:hover': { transform: 'scale(1.02)' }
          },
          '& .fc-toolbar-title': { fontSize: '1.25rem !important', fontWeight: 700 },
          '& .fc-button-primary': {
            bgcolor: alpha('#fff', 0.05),
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': { bgcolor: alpha('#7C7CFF', 0.2) },
            '&:disabled': { bgcolor: 'transparent', opacity: 0.3 }
          },
          '& .fc-button-active': { bgcolor: '#7C7CFF !important' }
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="75vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          events={workOrders
            .filter((wo) => wo.dueDate)
            .map((wo) => ({
              id: wo.id,
              title: `[${wo.priority}] ${wo.title}`,
              date: wo.dueDate,
              backgroundColor: 
                wo.priority === 'HIGH' && wo.status !== 'DONE'
                ? STATUS_COLORS.HIGH_PRIORITY
                : STATUS_COLORS[wo.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.OPEN,
            }))}
          eventClick={(info) => {
            router.push(`/work-orders/${info.event.id}`);
          }}
          dayMaxEvents={true} // Jika terlalu banyak event, muncul "+more"
        />
      </Paper>
    </Container>
  );
}