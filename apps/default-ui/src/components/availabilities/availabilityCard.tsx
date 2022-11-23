import { DeleteOutline } from '@mui/icons-material';
import { Chip, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ConfirmDeleteDialog from './confirmDeleteDialog';
import {Availability} from '@ricly/interfaces'

export default function AvailabilityCard({
  availability: {
    availability_id,
    availability_date,
    start_time,
    end_time,
    is_used,
  },
}: {
  availability: Availability;
}) {
  const { formatMessage, formatDate, formatTime} =
    useIntl();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteAvailability = () => {
    setIsConfirmDialogOpen(true);
  };
  return (
    <>
      <ConfirmDeleteDialog
        closeDialog={() => {
          setIsConfirmDialogOpen(false);
        }}
        element={availability_id}
        isDialogOpen={isConfirmDialogOpen}
      />
      <TableRow
        sx={{
          borderBottom: `1px solid ${theme.common.lighterPrimary}`,
          borderTop: `1px solid ${theme.common.lighterPrimary}`,
          padding: `0 ${theme.spacing(4.625)}`,
          backgroundColor: theme.common.white,
        }}
      >
        <TableCell component="th" scope="row">
          {formatDate(availability_date, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          })}
        </TableCell>
        <TableCell>{`
        ${formatTime(start_time, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })} - 
        ${formatTime(end_time, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      `}</TableCell>
        <TableCell>
          <Chip
            label={formatMessage({
              id:
                new Date() > availability_date
                  ? 'overdue'
                  : is_used
                  ? 'scheduled'
                  : 'free',
            })}
            color={new Date() > availability_date ? 'error' : 'primary'}
          />
        </TableCell>
        <TableCell>
          <Tooltip arrow title={formatMessage({ id: 'deleteClassroom' })}>
            <IconButton
              color="primary"
              size="small"
              onClick={deleteAvailability}
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>{' '}
    </>
  );
}
