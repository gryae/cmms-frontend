'use client';

import { Box, Typography } from '@mui/material';

export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
