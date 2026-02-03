'use client';

import { Paper, Typography, Box } from '@mui/material';

type Props = {
  title: string;
  value: number | string;
  color?: string;
};

export default function StatCard({ title, value, color = '#6C63FF' }: Props) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      </Box>
      <Typography variant="h4" sx={{ mt: 1, color }}>
        {value}
      </Typography>
    </Paper>
  );
}
