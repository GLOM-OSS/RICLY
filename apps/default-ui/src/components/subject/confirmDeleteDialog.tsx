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
import { useParams } from 'react-router';
import { removeClassroomsFromSubjects } from '../../services/subject.service';

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
  const { subject_id } = useParams();

  const removeClassroom = () => {
    setIsDeleting(true);
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'removing' }) });
    removeClassroomsFromSubjects(subject_id as string, [classroom_id])
      .then(() => {
        notif.dismiss();
        closeDialog();
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={removeClassroom}
              notification={notif}
              message={
                error?.message ||
                formatMessage({ id: 'errorRemovingClassroom' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsDeleting(false));
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
          onClick={removeClassroom}
          autoFocus
        >
          {formatMessage({ id: 'remove' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
