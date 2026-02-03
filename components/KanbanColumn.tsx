'use client';

import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import React from 'react';

type KanbanColumnProps = {
  id: string;
  type?: 'STATUS' | 'USER'; // 👈 DITAMBAH
  title?: React.ReactNode;  // 👈 OPTIONAL
  children: React.ReactNode;
};


export default function KanbanColumn({
  id,
  title,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'STATUS',   // ⬅️ INI KRUSIAL
      status: id,
    },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 280,
        minHeight: '70vh',
        backgroundColor: isOver
          ? 'rgba(124,124,255,0.15)'
          : 'background.paper',
        borderRadius: 2,
        p: 2,
        transition: '0.2s',
      }}
    >
      <Typography sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
