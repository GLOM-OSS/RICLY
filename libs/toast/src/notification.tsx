import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { theme } from '@ricly/theme'; 
import { DoneAllRounded } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Id, toast } from 'react-toastify';
import { useIntl } from 'react-intl';

export class useNotification {
  toastId: Id;
  constructor() {
    this.toastId = uuidv4();
  }
  notify = ({ render }: { render: string | JSX.Element }) =>
    (this.toastId = toast.dark(
      <Typography variant="caption">{render}</Typography>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        icon: () => (
          <CircularProgress
            sx={{ color: theme.common.backgroundPrimary }}
            thickness={3}
            size={20}
          />
        ),
      }
    ));

  dismiss = () => toast.dismiss(this.toastId);

  update = ({
    type,
    render,
    closeButton,
    hideProgressBar,
    autoClose,
    icon,
  }: {
    render?: string | JSX.Element;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEFAULT' | 'INFO';
    autoClose?: false | number;
    closeButton?: false | JSX.Element;
    hideProgressBar?: boolean;
    icon?: JSX.Element | (() => JSX.Element);
  }) =>
    toast.update(this.toastId, {
      type: toast.TYPE[type ?? 'SUCCESS'],
      render: <Typography variant="caption">{render ?? 'Success'}</Typography>,
      closeButton: closeButton ?? false,
      hideProgressBar: hideProgressBar ?? true,
      autoClose: autoClose ?? 5000,
      closeOnClick: true,
      icon:
        icon !== undefined ? icon : () => <DoneAllRounded color="success" />,
    });
}

export default useNotification;

export const ErrorMessage = ({
  retryFunction,
  notification,
  message,
}: {
  retryFunction: () => void;
  notification: useNotification;
  message: string;
}) => {
  const intl = useIntl();
  const { formatMessage } = intl;

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption">{message}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          justifyItems: 'center',
          marginTop: '10px',
        }}
      >
        <Button
          color="primary"
          size="small"
          variant="contained"
          onClick={() => {
            retryFunction();
            notification.dismiss();
          }}
          sx={{ ...theme.typography.caption }}
        >
          {formatMessage({ id: 'retry' })}
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => notification.dismiss()}
          sx={{
            ...theme.typography.caption,
            backgroundColor: theme.palette.error.dark,
            transition: '0.3s',
            '&:hover': {
              backgroundColor: theme.palette.error.main,
              transition: '0.3s',
            },
          }}
        >
          {formatMessage({ id: 'close' })}
        </Button>
      </Box>
    </Box>
  );
};

export interface NotificationInterface {
  notif: useNotification;
  usage: string;
}
export const filterNotificationUsage = (
  usage: string,
  notif: useNotification,
  notifications: NotificationInterface[]
) => {
  const newNotifs = notifications.filter(({ usage: usg, notif }) => {
    if (usage === usg) notif.dismiss();
    return usage !== usg;
  });
  return [...newNotifs, { usage, notif }];
};
