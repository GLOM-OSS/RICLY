import { Chip, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { TimeTable } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useIntl } from 'react-intl';
import { OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router';

export default function TimetableCard({
  timetable: { created_at, end_date, is_published, start_date },
}: {
  timetable: TimeTable;
}) {
  const navigate = useNavigate();
  const { formatMessage, formatDate, formatDateTimeRange } = useIntl();

  return (
    <TableRow
      sx={{
        borderBottom: `1px solid ${theme.common.lighterPrimary}`,
        borderTop: `1px solid ${theme.common.lighterPrimary}`,
        padding: `0 ${theme.spacing(4.625)}`,
        backgroundColor: theme.common.white,
      }}
    >
      <TableCell component="th" scope="row">
        {`${formatMessage({ id: 'createdOn' })} : ${formatDate(created_at, {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        })}`}
      </TableCell>
      <TableCell>
        {formatDateTimeRange(start_date, end_date, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      </TableCell>
      <TableCell>
        <Chip
          label={formatMessage({
            id: is_published ? 'published' : 'pending',
          })}
          color={is_published ? 'primary' : 'warning'}
        />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={() => navigate(`/timetables/${created_at.getTime()}`)}
        >
          <Tooltip title={`${formatMessage({ id: 'openTimeTable' })}`}>
            <OpenInNew />
          </Tooltip>
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
