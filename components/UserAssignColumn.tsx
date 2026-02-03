'use client';

import { Box, Typography, Avatar } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';

type Props = {
  user: any;
};

export default function UserAssignColumn({ user }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: user.id,
    data: { type: 'USER', user },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 240,
        minHeight: '120px',
        backgroundColor: isOver
          ? 'rgba(124,124,255,0.15)'
          : 'background.paper',
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Avatar>{user.email[0].toUpperCase()}</Avatar>
        <Typography sx={{ fontWeight: 600 }}>
          {user.name || user.email}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Drop work order here
      </Typography>
    </Box>
  );
}
