import { FileDownloadOutlined, ReportRounded } from '@mui/icons-material';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { Subscription } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import SubscriptionCard from '../../components/dashboard/subscriptionCard';
import { useUser } from '../../contexts/UserContextProvider';

export default function Dashboard() {
  const { formatMessage, formatNumber } = useIntl();
  const { school_code } = useParams();
  const { selected_school, userDispatch } = useUser();

  const navigate = useNavigate();

  const [isSchoolLoading, setIsSchoolLoading] = useState<boolean>(false);

  const loadSchoolData = () => {
    if (!selected_school) navigate('/-/schools');
    else {
      setIsSchoolLoading(true);
      setTimeout(() => {
        // TODO: CALL API TO GET SCHOOL DATA HERE with data school_code
        if (random() > 5) {
          const newSchool = {
            api_calls_left: 20,
            api_calls_used: 200,
            api_key: 'kskdksis',
            api_test_key: 'kdksowkekd',
            school_acronym: 'IAI',
            school_code: 'skdk',
            school_name: 'Universite des montagnes',
            test_api_calls_left: 10,
          };
          userDispatch({
            type: 'SELECT_SCHOOL',
            payload: { selected_school: newSchool },
          });
          setIsSchoolLoading(false);
        } else {
          const notif = new useNotification();
          notif.notify({ render: formatMessage({ id: 'loadingSchoolData' }) });
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={loadSchoolData}
                notification={notif}
                // TODO: message should come from backend api
                message={formatMessage({ id: 'failedLoadingSchoolData' })}
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
        }
      }, 3000);
    }
  };

  const [areSubscriptionsLoading, setAreSubscriptionsLoading] =
    useState<boolean>(false);
  const loadSubscriptions = () => {
    if (!selected_school) navigate('/-/schools');
    else {
      setAreSubscriptionsLoading(true);
      setTimeout(() => {
        // TODO: CALL API TO GET SCHOOL SUBSCRIPTIONS HERE with data school_code
        if (random() > 5) {
          const newSubscriptions: Subscription[] = [];
          setSubscriptions(newSubscriptions);
          setAreSubscriptionsLoading(false);
        } else {
          const notif = new useNotification();
          notif.notify({
            render: formatMessage({ id: 'loadingSubscriptions' }),
          });
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={loadSubscriptions}
                notification={notif}
                // TODO: message should come from backend api
                message={formatMessage({ id: 'failedLoadingSubscriptions' })}
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
        }
      }, 3000);
    }
  };

  useEffect(() => {
    loadSchoolData();
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      number_of_apis: 20,
      school_id: 'llls',
      subscribed_at: new Date(),
      subscription_id: 'lskd',
      total_paid: 50000,
      unit_price: 350,
    },
  ]);
  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          display: 'grid',
          alignItems: 'end',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'end',
          marginBottom: theme.spacing(3.75),
        }}
      >
        <Typography variant="h4">
          {formatMessage({ id: 'dashboard' })}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          endIcon={<FileDownloadOutlined sx={{ color: 'white' }} />}
          sx={{ textTransform: 'none' }}
          //   disabled={isCreatingSchool}
          //   onClick={() => setIsCreateDialogOpen(true)}
        >
          {formatMessage({ id: 'getNewBundle' })}
        </Button>
      </Box>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '4.5fr 1fr',
          columnGap: theme.spacing(1),
        }}
      >
        <Box
          sx={{
            backgroundColor: 'green',
            display: 'grid',
            gridTemplateRows: '1fr auto',
          }}
        >
          <Typography>Hello world</Typography>
          <Box sx={{ display: 'grid', gridAutoFlow: 'column' }}>
            <Typography variant="h6">{`${formatMessage({
              id: 'callsUsed',
            })}: ${formatNumber(
              selected_school?.api_calls_used || 0
            )}`}</Typography>
            <Typography
              variant="h6"
              sx={{ justifySelf: 'end' }}
            >{`${formatMessage({ id: 'callsLeft' })}: ${formatNumber(
              selected_school?.api_calls_left || 0
            )}`}</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: theme.common.CSK50,
            height: '100%',
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            padding: theme.spacing(1),
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.primary.main,
              marginBottom: theme.spacing(6.875),
              justifySelf: 'center',
            }}
          >
            {formatMessage({ id: 'subscriptions' })}
          </Typography>
          <Scrollbars>
            {areSubscriptionsLoading ? (
              [...new Array(10)].map((_, index) => (
                <Skeleton
                  key={index}
                  height={50}
                  animation="wave"
                  sx={{
                    marginBottom: theme.spacing(0.5),
                    '&.MuiSkeleton-root': { transform: 'scale(1, 1)' },
                  }}
                />
              ))
            ) : subscriptions.length > 0 ? (
              subscriptions
                .sort((a, b) => (a.subscribed_at > b.subscribed_at ? 1 : -1))
                .map((subscription, index) => (
                  <SubscriptionCard subscription={subscription} key={index} />
                ))
            ) : (
              <Typography sx={{ textAlign: 'center' }} variant="h6">
                {formatMessage({ id: 'noSubscriptionsYet' })}
              </Typography>
            )}
          </Scrollbars>
        </Box>
      </Box>
    </Box>
  );
}
