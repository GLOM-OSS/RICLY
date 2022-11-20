import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CreateSchoolInterface } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

export default function AddSchoolDialog({
  isDialogOpen,
  closeDialog,
  handleSubmit,
}: {
  isDialogOpen: boolean;
  closeDialog: () => void;
  handleSubmit: (values: CreateSchoolInterface) => void;
}) {
  const { formatMessage } = useIntl();
  const initialValues: CreateSchoolInterface = {
    school_acronym: '',
    school_name: '',
    school_domain: '',
    secretary_email: '',
  };
  const validationSchema = Yup.object().shape({
    school_acronym: Yup.string().required(),
    school_name: Yup.string().required(),
    school_domain: Yup.string(),
    secretary_email: Yup.string().email().required(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values);
      resetForm();
      closeDialog();
    },
  });

  return (
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      <DialogTitle>{formatMessage({ id: 'addSchool' })}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: theme.spacing(2) }}>
            {formatMessage({ id: 'addSchoolMessage' })}
          </DialogContentText>
          <Box sx={{ display: 'grid', rowGap: theme.spacing(2) }}>
            <TextField
              autoFocus
              label={formatMessage({ id: 'schoolName' })}
              placeholder={formatMessage({ id: 'schoolName' })}
              fullWidth
              required
              error={
                formik.touched.school_name && Boolean(formik.errors.school_name)
              }
              helperText={
                formik.touched.school_name && formik.errors.school_name
              }
              {...formik.getFieldProps('school_name')}
            />
            <TextField
              placeholder={formatMessage({ id: 'schoolAcronym' })}
              fullWidth
              label={formatMessage({ id: 'schoolAcronym' })}
              required
              error={
                formik.touched.school_acronym &&
                Boolean(formik.errors.school_acronym)
              }
              helperText={
                formik.touched.school_acronym && formik.errors.school_acronym
              }
              {...formik.getFieldProps('school_acronym')}
            />
            <TextField
              placeholder={formatMessage({ id: 'domain' })}
              label={formatMessage({ id: 'schoolSecureDomain' })}
              fullWidth
              required
              error={
                formik.touched.school_domain &&
                Boolean(formik.errors.school_domain)
              }
              helperText={
                formik.touched.school_domain && formik.errors.school_domain
              }
              {...formik.getFieldProps('school_domain')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2">{'https://www.'}</Typography>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder={formatMessage({ id: 'secretaryEmail' })}
              label={formatMessage({ id: 'schoolSecretaryEmail' })}
              fullWidth
              required
              type="email"
              error={
                formik.touched.secretary_email &&
                Boolean(formik.errors.secretary_email)
              }
              helperText={
                formik.touched.secretary_email && formik.errors.secretary_email
              }
              {...formik.getFieldProps('secretary_email')}
            />
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
            {formatMessage({ id: 'create' })}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
