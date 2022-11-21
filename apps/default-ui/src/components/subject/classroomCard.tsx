import { DeleteOutline } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Classroom } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ConfirmDeleteDialog from './confirmDeleteDialog';

export default function ClassroomCard({
  classroom: {
    classroom_code,
    classroom_id, 
    classroom_name, 
  },
}: {
  classroom: Omit<Classroom, 'coordinator_email'>;
}) {
  const { formatMessage } = useIntl();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteClassroom = () => {
    setIsConfirmDialogOpen(true);
  };
  return (
    <>
      <ConfirmDeleteDialog
        closeDialog={() => {
          setIsConfirmDialogOpen(false);
        }}
        classroom_id={classroom_id}
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
          {classroom_name}
        </TableCell>
        <TableCell>{classroom_code}</TableCell>
        <TableCell>
          <Tooltip arrow title={formatMessage({ id: 'deleteClassroom' })}>
            <IconButton color="primary" size="small" onClick={deleteClassroom}>
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>{' '}
    </>
  );
}
