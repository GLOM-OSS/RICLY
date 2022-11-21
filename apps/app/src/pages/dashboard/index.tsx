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
import Graph, { UsageInterface } from '../../components/dashboard/graph';
import SubscriptionCard from '../../components/dashboard/subscriptionCard';
import SubscriptionDialog from '../../components/dashboard/subscriptionDialog';
import { useUser } from '../../contexts/UserContextProvider';

export default function Dashboard() {
  const { formatMessage, formatNumber } = useIntl();
  const { school_code } = useParams();
  const { selected_school, userDispatch } = useUser();

  const navigate = useNavigate();

  const [isSchoolLoading, setIsSchoolLoading] = useState<boolean>(false);

  const loadSchoolData = () => {
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
  };

  const [areSubscriptionsLoading, setAreSubscriptionsLoading] =
    useState<boolean>(false);
  const loadSubscriptions = () => {
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
  };

  const [usageGraphData, setUsageGraphData] = useState<UsageInterface[]>([]);

  const [isGraphDataLoading, setIsGraphDataLoading] = useState(false);

  const loadGraphData = () => {
    setIsGraphDataLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL SUBSCRIPTIONS HERE with data school_code
      if (random() > 5) {
        const newUsageData: UsageInterface[] = [
          { calls: 15, date: new Date() },
          { calls: 10, date: new Date('2022/11/12') },
          { calls: 72, date: new Date('2022/11/15') },
        ];
        setUsageGraphData(newUsageData);
        setIsGraphDataLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingGraphData' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadGraphData}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingGraphData' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    if (!selected_school) navigate('/-/schools');
    else {
      loadSchoolData();
      loadSubscriptions();
      loadGraphData();
    }
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

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] =
    useState<boolean>(false);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const handleNewSubscription = (total_payable: number) => {
    setIsSubscribing(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({ render: formatMessage({ id: 'subscribing' }) });
    setTimeout(() => {
      setIsSubscribing(false);
      //TODO call api here for binance payment
      if (random() > 5) {
        notif.update({
          render: formatMessage({ id: 'subscribedSuccessfully' }),
        });
        setNotifications([]);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => handleNewSubscription(total_payable)}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'subscriptionFailed' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 4000);
  };

  return (
    <>
      <SubscriptionDialog
        isDialogOpen={isSubscriptionDialogOpen}
        closeDialog={() => setIsSubscriptionDialogOpen(false)}
        handleSubmit={handleNewSubscription}
      />
      <Box
        sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
      >
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
            disabled={isSchoolLoading || isSubscribing}
            onClick={() => setIsSubscriptionDialogOpen(true)}
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
              display: 'grid',
              gridTemplateRows: '1fr auto',
            }}
          >
            <Graph data={usageGraphData} isDataLoading={isGraphDataLoading} />
            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                marginTop: theme.spacing(5),
              }}
            >
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
    </>
  );
}
