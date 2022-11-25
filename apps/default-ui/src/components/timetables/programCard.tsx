import { Box, Chip, Typography } from '@mui/material';
import { Break, Program } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

export default function ProgramCard({
  program: { start_date, end_date, hall_name, fullname, subject_name },
}: {
  program: Program;
}) {
  const { formatDate, formatTime } = useIntl();

  return (
    <Box>
      {subject_name === 'default_ui_break' ? (
        <Box sx={{ backgroundColor: 'green' }}>Break</Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            rowGap: theme.spacing(2),
            alignItems: 'center',
            justifyItems: 'center',
            backgroundColor: theme.common.lighterPrimary,
            width: '250px',
            padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
            borderRadius: theme.spacing(1),
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography>
              {formatDate(start_date, {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              })}
            </Typography>
            <Typography>{`${formatTime(start_date)} - ${formatTime(
              end_date
            )}`}</Typography>
          </Box>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {subject_name}
          </Typography>
          <Chip label={`( ${hall_name} )`} color="error" size="small" />
          <Typography variant="body2">{fullname}</Typography>
        </Box>
      )}
    </Box>
  );
}
