import { Box, Typography } from '@mui/material';
import { Subscription } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useIntl } from 'react-intl';

export default function SubscriptionCard({
  subscription: { number_of_apis, subscribed_at, total_paid },
}: {
  subscription: Subscription;
}) {
  const { formatNumber, formatDate, formatMessage } = useIntl();
  return (
    <Box
      sx={{
        backgroundColor: theme.common.lowerGray,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
      }}
    >
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{`${formatNumber(
        number_of_apis
      )} ${formatMessage({ id: 'apiCalls' })}`}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: theme.spacing(2),
        }}
      >
        <Typography>
          {formatNumber(total_paid, { style: 'currency', currency: 'XAF' })}
        </Typography>
        <Typography>
          {formatDate(subscribed_at, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
}
