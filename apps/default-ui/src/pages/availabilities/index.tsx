import { FileDownloadOutlined, ReportRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Skeleton,
  Table,
  TableBody,
  Typography
} from '@mui/material';
import { Availability } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import AvailabilityCard from '../../components/availabilities/availabilityCard';
import NewAvailabilityDialog from '../../components/availabilities/newAvailabilityDialog';
import { useUser } from '../../contexts/UserContextProvider';

export default function Availabilities() {
  const { formatMessage } = useIntl();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [areAvailabilitiesLoading, setAreAvailabilitiesLoading] =
    useState<boolean>(false);

  const loadAvailabilities = () => {
    setAreAvailabilitiesLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL teachers HERE with data school_code
      if (random() > 5) {
        const newAvailabilities: Availability[] = [];
        setAvailabilities(newAvailabilities);
        setAreAvailabilitiesLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingAvailabilities' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadAvailabilities}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingAvailabilities' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const {
    user: { roles },
  } = useUser();
  useEffect(() => {
    if (roles.find(({ role }) => role === 'TEACHER')) {
      loadAvailabilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isNewAvailabilityDialogOpen, setIsNewAvailabilityDialogOpen] =
    useState<boolean>(false);
  return (
    <>
      <NewAvailabilityDialog
        isDialogOpen={isNewAvailabilityDialogOpen}
        closeDialog={() => setIsNewAvailabilityDialogOpen(false)}
      />
      <Box
        sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
      >
        <Box
          sx={{
            marginBottom: theme.spacing(3.75),
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            justifyItems: 'end',
          }}
        >
          <Typography variant="h3">
            {formatMessage({ id: 'availabilities' })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsNewAvailabilityDialogOpen(true)}
            sx={{ textTransform: 'none' }}
            disabled={isNewAvailabilityDialogOpen}
            size="small"
            endIcon={
              <FileDownloadOutlined
                sx={{
                  color: theme.common.white,
                }}
              />
            }
          >
            {formatMessage({ id: 'addAvailability' })}
          </Button>
        </Box>
        <Box
          sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}
        >
          <Typography
            sx={{
              backgroundColor: theme.common.CSK200,
              padding: `${theme.spacing(2)} ${theme.spacing(4.625)}`,
            }}
          >{`${formatMessage({ id: 'availabilities' })} (${
            availabilities.length
          })`}</Typography>
          <Scrollbars>
            <Table sx={{ minWidth: 650 }}>
              <TableBody>
                {areAvailabilitiesLoading ? (
                  [...new Array(10)].map((_, index) => (
                    <Skeleton
                      key={index}
                      height={70}
                      animation="wave"
                      sx={{
                        marginBottom: theme.spacing(0.5),
                        '&.MuiSkeleton-root': { transform: 'scale(1, 1)' },
                      }}
                    />
                  ))
                ) : availabilities.length === 0 ? (
                  <Typography variant="h5" sx={{ textAlign: 'center' }}>
                    {formatMessage({
                      id: 'noAvailabilitiesYet',
                    })}
                  </Typography>
                ) : (
                  availabilities
                    .sort((a, b) =>
                      new Date(a.availability_date) >
                      new Date(b.availability_date)
                        ? 1
                        : -1
                    )
                    .map((availability, index) => (
                      <AvailabilityCard
                        key={index}
                        availability={availability}
                      />
                    ))
                )}
              </TableBody>
            </Table>
          </Scrollbars>
        </Box>
      </Box>
    </>
  );
}
