import type { ReactNode } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';

type DataTableSectionProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function DataTableSection({
  title,
  subtitle,
  actions,
  children,
}: DataTableSectionProps) {
  return (
    <Box>
      {(title || actions) && (
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ px: 3, py: 2 }}
          >
            <Box>
              {title && <Typography variant="h6">{title}</Typography>}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            {actions && <Box>{actions}</Box>}
          </Stack>

          <Divider />
        </>
      )}

      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}