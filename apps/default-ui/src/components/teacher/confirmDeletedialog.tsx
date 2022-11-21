import { ReportRounded } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import { useState } from 'react';
import { useIntl } from 'react-intl';

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
    setTimeout(() => {
      //TODO: CALL delete teacher here with data element_id
      if (random() > 5) {
        notif.dismiss();
        closeDialog();
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={logout}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'errorDeletingTeacher' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
        setIsDeleting(false);
      }
    }, 3000);
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
