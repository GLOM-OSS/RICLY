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
import { random } from '@ricly/utils';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';

export default function ConfirmDeleteDialog({
  isDialogOpen,
  closeDialog,
  classroom_id,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  classroom_id: string;
}) {
  const { formatMessage } = useIntl();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const {subject_id} = useParams()

  const logout = () => {
    setIsDeleting(true);
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'removing' }) });
    setTimeout(() => {
      //TODO: CALL api to remove classrom from subject list with data classroom_id, and subjet_id
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
              message={formatMessage({ id: 'errorRemovingClassroom' })}
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
          id: 'removeClassroom',
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessage({ id: 'confirmRemoveClassroomMessage' })}
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
          {formatMessage({ id: 'remove' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
