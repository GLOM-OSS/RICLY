import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { SchoolInterface } from 'libs/interfaces/src';
import { useIntl } from 'react-intl';

export default function ConfirmDeleteDialog({
  isDialogOpen,
  closeDialog,
  deleteSchool,
  school: { school_name, school_acronym },
  deleting
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  deleteSchool: () => void;
  school: SchoolInterface;
  deleting: boolean
}) {
  const { formatMessage } = useIntl();

  return (
    <Dialog open={isDialogOpen} onClose={() => (deleting ? null : closeDialog)}>
      <DialogTitle>
        {`${formatMessage({ id: 'delete' })} ${school_name}(${school_acronym}) ?`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessage({ id: 'confirmDeleteSchoolMessage' })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          disabled={deleting}
          onClick={closeDialog}
        >
          {formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={deleting}
          onClick={deleteSchool}
          autoFocus
        >
          {formatMessage({ id: 'delete' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
