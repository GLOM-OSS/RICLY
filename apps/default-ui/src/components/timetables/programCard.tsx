import { Box, Chip, Typography } from '@mui/material';
import { Program } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useIntl } from 'react-intl';

export default function ProgramCard({
  program: { start_date, end_date, hall_name, fullname, subject_name },
  forTeacher,
}: {
  program: Program;
  forTeacher?: boolean;
}) {
  const { formatDate, formatTime, formatMessage } = useIntl();

  return subject_name === 'default_ui_break' ? (
    <Box
      sx={{
        backgroundColor: theme.common.backgroundPrimary,
        height: '50px',
        display: 'grid',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ textAlign: 'center' }}>
        {formatMessage({ id: 'break' })}
      </Typography>
    </Box>
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
      <Typography variant="body2">{'IRT3'}</Typography>
    </Box>
  );
}
