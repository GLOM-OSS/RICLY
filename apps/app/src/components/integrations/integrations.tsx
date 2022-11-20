import { ContentCopyOutlined, ReportRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import * as Yup from 'yup';
import { useUser } from '../../contexts/UserContextProvider';

export default function Integrations() {
  const { school_code } = useParams();
  const { selected_school, userDispatch } = useUser();
  const navigate = useNavigate();
  const { formatMessage } = useIntl();

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

  useEffect(() => {
    loadSchoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const copyKey = (value: any) => {
    navigator.clipboard.writeText(String(value));
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'copying' }) });
    notif.update({ render: 'copied' });
  };
  const initialValues: { school_domain: string } = {
    school_domain: '',
  };
  const validationSchema = Yup.object().shape({
    school_domain: Yup.string(),
  });

  const [isChangingDomain, setIsChangingDomain] = useState<boolean>(false);
  const changeDomain = (domain: string) => {
    setIsChangingDomain(true);
    const notif = new useNotification();
    notif.notify({ render: formatMessage({ id: 'updating' }) });
    setTimeout(() => {
      setIsChangingDomain(false);
      //TODO: CALL API HERE TO CHANGE DOMAIN
      if (random() > 5)
        notif.update({ render: formatMessage({ id: 'updatedSuccessfully' }) });
      else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => changeDomain(domain)}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedToUpdateDomain' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      changeDomain(values.school_domain);
      resetForm();
    },
  });

  return (
    <Box sx={{ height: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: theme.spacing(3.75),
        }}
      >
        {formatMessage({ id: 'integrations' })}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: theme.spacing(2),
        }}
      >
        <Typography variant="h6">
          {formatMessage({ id: 'testApiKey' })}
          {isSchoolLoading ? (
            <Skeleton
              animation="wave"
              sx={{ display: 'inline-flex', marginLeft: '1ch' }}
              component="span"
              width="30px"
            />
          ) : (
            <Typography
              component="span"
              variant="h6"
              sx={{
                color: theme.palette.grey[600],
              }}
            >{` (${selected_school?.test_api_calls_left} ${formatMessage({
              id: 'callsLeft',
            })})`}</Typography>
          )}
        </Typography>
        {isSchoolLoading ? (
          <Skeleton animation="wave" />
        ) : (
          <Box
            sx={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: 'auto 1fr',
              justifyItems: 'start',
            }}
          >
            <Typography variant="h6">
              ********************************
            </Typography>
            <Tooltip arrow title={formatMessage({ id: 'copy' })}>
              <IconButton
                size="small"
                onClick={() => copyKey(selected_school?.api_test_key)}
              >
                <ContentCopyOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: theme.spacing(2),
          margin: `${theme.spacing(4.375)} 0`,
        }}
      >
        <Typography variant="h6">
          {formatMessage({ id: 'productionApiKey' })}
        </Typography>
        {isSchoolLoading ? (
          <Skeleton animation="wave" />
        ) : (
          <Box
            sx={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: 'auto 1fr',
              justifyItems: 'start',
            }}
          >
            <Typography variant="h6">
              ********************************
            </Typography>
            <Tooltip arrow title={formatMessage({ id: 'copy' })}>
              <IconButton
                size="small"
                onClick={() => copyKey(selected_school?.api_key)}
              >
                <ContentCopyOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          justifyItems: 'start',
          columnGap: theme.spacing(2),
        }}
      >
        <TextField
          placeholder={formatMessage({ id: 'domain' })}
          label={formatMessage({ id: 'schoolSecureDomain' })}
          fullWidth
          required
          size="small"
          error={
            formik.touched.school_domain && Boolean(formik.errors.school_domain)
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
        <Button
          sx={{ textTransform: 'none' }}
          variant="contained"
          color="primary"
          type="submit"
          disabled={
            isChangingDomain ||
            isSchoolLoading ||
            formik.values.school_domain === selected_school?.school_domain ||
            (formik.values.school_domain === '' &&
              selected_school?.school_domain === undefined)
          }
        >
          {formatMessage({ id: 'save' })}
        </Button>
      </Box>
      <Typography sx={{ marginTop: theme.spacing(12.5) }} variant="h4">
        {formatMessage({ id: 'note' })}
      </Typography>
      <Typography>{formatMessage({ id: 'integrationNote1' })}</Typography>
      <Typography>{formatMessage({ id: 'integrationNote2' })}</Typography>
    </Box>
  );
}
