'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getUserFromToken } from '../../../../lib/api';
import {
  Container, Typography, Box, Button, Stack, alpha, Paper,
} from '@mui/material';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { ViewList, PeopleOutline } from '@mui/icons-material';

import KanbanColumn from '../../../../components/KanbanColumn';
import WorkOrderCard from '../../../../components/WorkOrderCard';
import UserAssignColumn from '../../../../components/UserAssignColumn';

const STATUSES = [
  { key: 'OPEN', label: 'Open', color: '#2196f3' },
  { key: 'ASSIGNED', label: 'Assigned', color: '#7C7CFF' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#ff9800' },
  { key: 'DONE', label: 'Done', color: '#4caf50' },
];

export default function KanbanPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [activeWo, setActiveWo] = useState<any>(null); // Untuk Drag Overlay

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadData = async () => {
    try {
      const [woRes, userRes] = await Promise.all([
        api.get('/work-orders'),
        api.get('/users'),
      ]);
      setWorkOrders(woRes.data);
      setTechs(userRes.data.filter((u: any) => u.role === 'TECHNICIAN'));
    } catch (err) {
      console.error("Failed to fetch Kanban data", err);
    }
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !['ADMIN', 'SUPERVISOR'].includes(user.role)) {
      router.push('/work-orders');
      return;
    }
    setRole(user.role);
    loadData();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveWo(event.active.data.current?.wo);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveWo(null);
    const { active, over } = event;
    if (!over) return;

    const wo = active.data.current?.wo;
    const overData = over.data.current;
    if (!wo || !overData) return;

    // 👷 DROP KE USER (ASSIGN)
    if (overData.type === 'USER') {
      await api.patch(`/work-orders/${wo.id}/assign`, { technicianId: over.id });
      loadData();
      return;
    }

    // 📌 DROP KE STATUS
    if (overData.type === 'STATUS') {
      const newStatus = over.id as string;
      if (wo.status === newStatus) return;
      
      await api.patch(`/work-orders/${wo.id}/status`, { status: newStatus });
      loadData();
    }
  };

  if (!role) return null;

  return (
    <Container maxWidth={false} sx={{ mt: 2, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        
        {/* HEADER AREA */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Kanban Board</Typography>
            <Typography variant="body2" color="text.secondary">Drag cards to update status or assign technicians</Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<ViewList />}
            onClick={() => router.push('/work-orders')}
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            List View
          </Button>
        </Box>

        {/* BOARD LAYOUT */}
        <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, minHeight: 0 }}>
          
          {/* LEFT: STATUS COLUMNS */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flex: 1, 
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }
          }}>
            {STATUSES.map((col) => (
              <Box key={col.key} sx={{ minWidth: 300, width: 300, display: 'flex', flexDirection: 'column' }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, mb: 2, borderRadius: 2, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderLeft: `4px solid ${col.color}`,
                    bgcolor: alpha(col.color, 0.05)
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: col.color }}>
                    {col.label.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ bgcolor: alpha('#fff', 0.05), px: 1, borderRadius: 1 }}>
                    {workOrders.filter(wo => wo.status === col.key).length}
                  </Typography>
                </Paper>

                <KanbanColumn id={col.key} type="STATUS">
                  <Stack spacing={2}>
                    {workOrders
                      .filter((wo) => wo.status === col.key)
                      .map((wo) => (
                        <WorkOrderCard 
                          key={wo.id} 
                          wo={wo} 
                          onDetail={() => router.push(`/work-orders/${wo.id}`)} 
                        />
                      ))}
                  </Stack>
                </KanbanColumn>
              </Box>
            ))}
          </Box>

          {/* RIGHT: TECHNICIAN PANEL */}
          <Box sx={{ 
            width: 280, 
            bgcolor: alpha('#161a22', 0.4), 
            borderRadius: 4, 
            p: 2, 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column'
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, px: 1 }}>
              <PeopleOutline color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>Assign Tech</Typography>
            </Stack>
            
            <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 0.5 }}>
              <Stack spacing={1.5}>
                {techs.map((u) => (
                  <UserAssignColumn key={u.id} user={u} />
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* DRAG OVERLAY (Agar kartu terlihat melayang saat ditarik) */}
        <DragOverlay>
          {activeWo ? (
            <Box sx={{ transform: 'rotate(3deg)', opacity: 0.8 }}>
              <WorkOrderCard wo={activeWo} />
            </Box>
          ) : null}
        </DragOverlay>

      </DndContext>
    </Container>
  );
} 