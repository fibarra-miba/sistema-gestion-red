import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

type PageContainerProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function PageContainer({
  title,
  subtitle,
  action,
  children,
}: PageContainerProps) {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && <Box>{action}</Box>}
      </Box>

      {children}
    </Stack>
  );
}