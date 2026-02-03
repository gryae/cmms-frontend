'use client';

import { Chip } from '@mui/material';

export default function StatusChip({ status }: { status: string }) {
  const colorMap: any = {
    OPEN: 'warning',
    ASSIGNED: 'info',
    IN_PROGRESS: 'primary',
    DONE: 'success',
    CLOSED: 'default',
  };

  return (
    <Chip
      label={status.replace('_', ' ')}
      color={colorMap[status] || 'default'}
      size="small"
    />
  );
}
