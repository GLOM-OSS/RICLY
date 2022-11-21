import { DeleteOutline } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Teacher } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ConfirmDeleteDialog from './confirmDeletedialog';

export default function TeacherCard({
  teacher: {
    fullname,
    email,
    teacher_type,
    phone_number,
    hours_per_week,
    teacher_id,
  },
}: {
  teacher: Teacher;
}) {
  const { formatMessage } = useIntl();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteBuilding = () => {
    setIsConfirmDialogOpen(true);
  };
  return (
    <>
      <ConfirmDeleteDialog
        closeDialog={() => {
          setIsConfirmDialogOpen(false);
        }}
        element={teacher_id}
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
          {fullname}
        </TableCell>
        <TableCell>{email}</TableCell>
        <TableCell>{formatMessage({ id: teacher_type })}</TableCell>
        <TableCell>{phone_number}</TableCell>
        <TableCell>{`${hours_per_week}/${formatMessage({
          id: 'week',
        })}`}</TableCell>
        <TableCell>
          <Tooltip arrow title={formatMessage({ id: 'deleteSchool' })}>
            <IconButton color="primary" size="small" onClick={deleteBuilding}>
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>{' '}
    </>
  );
}
