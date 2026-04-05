import type { ReactNode } from 'react';
import { Card, CardContent } from '@mui/material';

type ContentCardProps = {
  children: ReactNode;
};

export default function ContentCard({ children }: ContentCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {children}
      </CardContent>
    </Card>
  );
}