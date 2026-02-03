'use client';

import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import StatusChip from './StatusChip';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type WorkOrderCardProps = {
  wo: any;
  onDetail?: () => void;
  actions?: React.ReactNode;
};

export default function WorkOrderCard({
  wo,
  onDetail,
  actions,
}: WorkOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: wo.id,
    data: { wo },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
      }}
    >
      {/* 🔹 HEADER = DRAG HANDLE */}
      <Box
        {...listeners}
        {...attributes}
        sx={{
          cursor: 'grab',
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          {wo.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <StatusChip status={wo.status} />
          <Chip label={wo.priority} size="small" />
        </Box>

        {wo.asset && (
          <Typography
            variant="caption"
            sx={{ mt: 1, display: 'block' }}
          >
            Asset: {wo.asset.name}
          </Typography>
        )}
      </Box>

      {/* 🔹 FOOTER = BUTTON AREA (NO DRAG) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.5,
        }}
      >
        {/* DETAIL BUTTON */}
        <Typography
          variant="caption"
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            textDecoration: 'underline',
          }}
          onClick={onDetail}
        >
          Detail
        </Typography>

        {/* ACTION BUTTONS */}
        {actions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
