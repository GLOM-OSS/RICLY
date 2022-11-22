import { DeleteOutline } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Student } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ConfirmDeleteDialog from './confirmDeleteDialog';

export default function StudentCard({
  student: { fullname, email, classroom_code, student_id },
}: {
  student: Student;
}) {
  const { formatMessage } = useIntl();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteStudent = () => {
    setIsConfirmDialogOpen(true);
  };
  return (
    <>
      <ConfirmDeleteDialog
        closeDialog={() => {
          setIsConfirmDialogOpen(false);
        }}
        student_id={student_id}
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
        <TableCell>{classroom_code}</TableCell>
        <TableCell>
          <Tooltip arrow title={formatMessage({ id: 'deleteStudent' })}>
            <IconButton color="primary" size="small" onClick={deleteStudent}>
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
}
