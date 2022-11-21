import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { theme } from '@ricly/theme';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

export default function SubscriptionDialog({
  isDialogOpen,
  closeDialog,
  handleSubmit,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleSubmit: (values: number) => void;
}) {
  const { formatMessage, formatNumber } = useIntl();
  const initialValues: { total_paid: number; number_of_calls: number } = {
    total_paid: 0,
    number_of_calls: 0,
  };
  const validationSchema = Yup.object().shape({
    total_paid: Yup.number().required(),
    number_of_calls: Yup.number().required().min(1),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (values.total_paid > 0) {
        handleSubmit(values.total_paid);
        resetForm();
        closeDialog();
      } else alert(formatMessage({ id: 'amountMustBeGreaterThanZero' }));
    },
  });

  return (
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      <DialogTitle>{formatMessage({ id: 'newSubscription' })}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: theme.spacing(2) }}>
            {formatMessage({ id: 'newSubscriptionMessage' })}
          </DialogContentText>
          <Box sx={{ display: 'grid', rowGap: theme.spacing(2) }}>
            <TextField
              autoFocus
              label={formatMessage({ id: 'amount' })}
              placeholder={formatMessage({ id: 'amount' })}
              fullWidth
              required
              type="number"
              error={
                formik.touched.total_paid && Boolean(formik.errors.total_paid)
              }
              helperText={formik.touched.total_paid && formik.errors.total_paid}
              {...formik.getFieldProps('total_paid')}
              onChange={(event) => {
                formik.setFieldValue('total_paid', event.target.value);
                formik.setFieldValue(
                  'number_of_calls',
                  Number(event.target.value) /
                    Number(process.env['NX_API_UNIT_PRICE'])
                );
              }}
            />
            <TextField
              placeholder={formatMessage({ id: 'numberOfCalls' })}
              fullWidth
              label={formatMessage({ id: 'numberOfCalls' })}
              required
              type="number"
              error={
                formik.touched.number_of_calls &&
                Boolean(formik.errors.number_of_calls)
              }
              helperText={
                formik.touched.number_of_calls && formik.errors.number_of_calls
              }
              {...formik.getFieldProps('number_of_calls')}
              onChange={(event) => {
                formik.setFieldValue('number_of_calls', event.target.value);
                formik.setFieldValue(
                  'total_paid',
                  Number(event.target.value) *
                    Number(process.env['NX_API_UNIT_PRICE'])
                );
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'start',
              columnGap: theme.spacing(0.3),
              marginTop: theme.spacing(2),
            }}
          >
            <Typography>
              {`${formatMessage({ id: 'unitPrice' })} : `}{' '}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatNumber(Number(process.env['NX_API_UNIT_PRICE']), {
                style: 'currency',
                currency: 'XAF',
              })}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'start',
              columnGap: theme.spacing(0.3),
            }}
          >
            <Typography>
              {`${formatMessage({ id: 'totalCalls' })} : `}{' '}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatNumber(formik.values.number_of_calls)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              justifyItems: 'start',
              columnGap: theme.spacing(0.3),
            }}
          >
            <Typography>
              {`${formatMessage({ id: 'totalPayable' })} : `}{' '}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatNumber(
                formik.values.number_of_calls *
                  Number(process.env['NX_API_UNIT_PRICE']),
                {
                  style: 'currency',
                  currency: 'XAF',
                }
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ textTransform: 'none' }}
            color="primary"
            variant="outlined"
            onClick={closeDialog}
          >
            {formatMessage({ id: 'cancel' })}
          </Button>
          <Button
            sx={{ textTransform: 'none' }}
            color="primary"
            variant="contained"
            type="submit"
          >
            {formatMessage({ id: 'subscribe' })}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
