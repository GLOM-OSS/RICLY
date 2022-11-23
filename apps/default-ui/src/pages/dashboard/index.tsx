import { ReportRounded } from '@mui/icons-material';
import { Box, Skeleton, Typography } from '@mui/material';
import { SchoolInterface, Subscription } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Graph, { UsageInterface } from '../../components/dashboard/graph';
import SubscriptionCard from '../../components/dashboard/subscriptionCard';
import { useUser } from '../../contexts/UserContextProvider';
import {
  getSchoolProfile,
  getSchoolSubscriptions,
} from '../../services/school.service';

export default function Dashboard() {
  const { formatMessage, formatNumber } = useIntl();
  const {
    user: { roles },
  } = useUser();

  const [isSchoolLoading, setIsSchoolLoading] = useState<boolean>(true);
  const [school, setSchool] = useState<SchoolInterface>();

  const loadSchoolData = () => {
    setIsSchoolLoading(true);
    getSchoolProfile()
      .then((school) => {
        setSchool(school);
        setIsSchoolLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({ render: formatMessage({ id: 'loadingSchoolData' }) });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSchoolData}
              notification={notif}
              message={
                error?.mesage ||
                formatMessage({ id: 'failedLoadingSchoolData' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const [areSubscriptionsLoading, setAreSubscriptionsLoading] =
    useState<boolean>(false);
  const loadSubscriptions = (school_code: string) => {
    setAreSubscriptionsLoading(true);
    getSchoolSubscriptions(school_code)
      .then((subscriptions) => {
        setSubscriptions(subscriptions);
        setAreSubscriptionsLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingSubscriptions' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => loadSubscriptions(school_code)}
              notification={notif}
              message={
                error?.message ||
                formatMessage({ id: 'failedLoadingSubscriptions' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const [usageGraphData, setUsageGraphData] = useState<UsageInterface[]>([]);

  const [isGraphDataLoading, setIsGraphDataLoading] = useState(true);

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
    if (roles.find(({ role }) => role === 'SECRETARY')) {
      loadSchoolData();
      loadGraphData();
    }else {
      const notif = new useNotification();
      notif.notify({ render: formatMessage({ id: 'notifying' }) });
      notif.update({
        type: 'ERROR',
        render: formatMessage({
          id: 'mustHaveSecretaryRole',
        }),
        icon: () => <ReportRounded fontSize="medium" color="error" />,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (school?.school_code) loadSubscriptions(school.school_code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Typography variant="h3" sx={{ marginBottom: theme.spacing(3.75) }}>
        {formatMessage({ id: 'dashboard' })}
      </Typography>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '3.5fr 1fr',
          columnGap: theme.spacing(3),
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
            })}: ${
              isSchoolLoading
                ? formatMessage({ id: 'loading' })
                : formatNumber(school?.api_calls_used || 0)
            }`}</Typography>
            <Typography
              variant="h6"
              sx={{ justifySelf: 'end' }}
            >{`${formatMessage({ id: 'callsLeft' })}: ${
              isSchoolLoading
                ? formatMessage({ id: 'loading' })
                : formatNumber(school?.api_calls_left || 0)
            }`}</Typography>
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
