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
import { useNavigate } from 'react-router';
import { useUser } from '../../contexts/UserContextProvider';

export default function LogoutDialog({
  isDialogOpen,
  closeDialog,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
}) {
  const { formatMessage } = useIntl();
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const navigate = useNavigate();
  const { userDispatch } = useUser();

  const logout = () => {
    setLoggingOut(true);
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'loggingOut' }) });
    setTimeout(() => {
      //TODO: CALL API HERE TO LOG USER OUT
      if (random() > 5) {
        userDispatch({ type: 'CLEAR_USER' });
        navigate('/');
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
              message={formatMessage({ id: 'errorLoggingOut' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
        setLoggingOut(false);
      }
    }, 3000);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => (loggingOut ? null : closeDialog)}
    >
      <DialogTitle sx={{ textTransform: 'uppercase' }}>
        {formatMessage({ id: 'areYouSureToLogout' })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessage({ id: 'logoutDialogMessage' })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          disabled={loggingOut}
          onClick={closeDialog}
        >
          {formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={loggingOut}
          onClick={logout}
          autoFocus
        >
          {formatMessage({ id: 'logout' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
