import { DeleteOutline, KeyboardBackspaceOutlined } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { Subject } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import ConfirmDeleteSubjectDialog from './confirmDeleteSubjectDialog';

export default function SubjectCard({
  subject: {
    classrooms,
    subject_code,
    subject_id,
    subject_name,
    teacher_email,
  },
}: {
  subject: Subject;
}) {
  const { formatMessage } = useIntl();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteClassroom = () => {
    setIsConfirmDialogOpen(true);
  };
  const navigate = useNavigate();
  return (
    <>
      <ConfirmDeleteSubjectDialog
        closeDialog={() => {
          setIsConfirmDialogOpen(false);
        }}
        subject_id={subject_id}
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
          {subject_name}
        </TableCell>
        <TableCell>{subject_code}</TableCell>
        <TableCell>{teacher_email}</TableCell>
        <TableCell>
          {classrooms.length === 1
            ? classrooms[0].classroom_name
            : `(${classrooms.length} ${formatMessage({ id: 'classrooms' })})`}
        </TableCell>
        <TableCell>
          {classrooms.length > 1 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                justifyItems: 'end',
                alignItems: 'center',
                columnGap: theme.spacing(0.5),
              }}
            >
              <Tooltip arrow title={formatMessage({ id: 'deleteClassroom' })}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={deleteClassroom}
                >
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title={formatMessage({ id: 'seeClassrooms' })}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => navigate(subject_id)}
                >
                  <KeyboardBackspaceOutlined />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Tooltip arrow title={formatMessage({ id: 'deleteClassroom' })}>
              <IconButton
                color="primary"
                size="small"
                onClick={deleteClassroom}
              >
                <DeleteOutline />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>{' '}
    </>
  );
}
