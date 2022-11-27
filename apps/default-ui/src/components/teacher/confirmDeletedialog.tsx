import { ReportRounded } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { deleteTeachers } from '../../services/teachers.service';

export default function ConfirmDeleteDialog({
  isDialogOpen,
  closeDialog,
  element,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  element: string;
}) {
  const { formatMessage } = useIntl();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const logout = () => {
    setIsDeleting(true);
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'deleting' }) });
    deleteTeachers([element])
      .then(() => {
        notif.dismiss();
        closeDialog();
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={logout}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'errorDeletingTeacher' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
        setIsDeleting(false);
      });
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => (isDeleting ? null : closeDialog)}
    >
      <DialogTitle>
        {formatMessage({
          id: 'deleteTeacher',
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessage({ id: 'confirmDeleteTeacherMessage' })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          disabled={isDeleting}
          onClick={closeDialog}
        >
          {formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isDeleting}
          onClick={logout}
          autoFocus
        >
          {formatMessage({ id: 'delete' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
