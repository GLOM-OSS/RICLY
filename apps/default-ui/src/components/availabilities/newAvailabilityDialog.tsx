import { FileDownloadOutlined, ReportRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { CreateAvailability } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import dayjs, { Dayjs } from 'dayjs';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { addNewAvailibilities } from '../../services/availabilities.service';

export default function NewAvailabilityDialog({
  isDialogOpen,
  closeDialog,
}: //   createAvailability,
{
  isDialogOpen: boolean;
  closeDialog: () => void;
  //   createAvailability: (availabilities: CreateAvailability) => void;
}) {
  const { formatMessage, formatDate } = useIntl();
  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function createAvailability(availabilities: CreateAvailability) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingAvailabilities' }),
    });
    addNewAvailibilities(availabilities)
      .then(() => {
        notif.update({
          render: formatMessage({ id: 'successfullyCreated' }),
        });
        resetForm();
        closeDialog();
        setNotifications([]);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => createAvailability(availabilities)}
              notification={notif}
              message={
                error?.message ||
                formatMessage({ id: 'failedSavingAvailability' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  }
  const [startsAt, setStartsAt] = useState<Dayjs | null>(dayjs(new Date()));
  const [endsAt, setEndsAt] = useState<Dayjs | null>(dayjs(new Date()));
  const [newDate, setNewDate] = useState<Dayjs | null>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const resetForm = () => {
    setStartsAt(null);
    setEndsAt(null);
    setNewDate(null);
    setSelectedDates([]);
  };

  const handlePublish = () => {
    if (
      new Date(String(startsAt)) >= new Date(String(endsAt)) ||
      selectedDates.length < 1 ||
      startsAt === null ||
      endsAt === null
    ) {
      const notif = new useNotification();
      notif.notify({ render: formatMessage({ id: 'notifying' }) });
      notif.update({
        type: 'ERROR',
        render: formatMessage({
          id: 'endTimeMustBeGreaterThanStartTimeAndMustHaveAtLeastOneAvailability',
        }),
        icon: () => <ReportRounded fontSize="medium" color="error" />,
      });
    } else {
      const availability: CreateAvailability = {
        start_time: new Date(String(startsAt)),
        end_time: new Date(String(endsAt)),
        availabilities: selectedDates,
      };
      createAvailability(availability);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => {
        if (!isCreating) {
          closeDialog();
          resetForm();
        }
      }}
    >
      <DialogTitle>
        {formatMessage({
          id: 'newAvailability',
        })}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            rowGap: theme.spacing(1),
            marginBottom: theme.spacing(5),
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.common.CSK50,
              padding: theme.spacing(2),
              height: theme.spacing(20),
              width: theme.spacing(66.25),
            }}
          >
            <Scrollbars>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(170px, 170px))',
                  gap: theme.spacing(1),
                  justifyContent: 'center',
                }}
              >
                {selectedDates.map((_, index) => (
                  <Chip
                    key={index}
                    onDelete={() => {
                      const tempSelectedDates: string[] = selectedDates.map(
                        (_) => _.toDateString()
                      );
                      const dateData = _.toDateString();
                      const data = tempSelectedDates.filter(
                        (_) => _ !== dateData
                      );
                      setSelectedDates(data.map((_) => new Date(_)));
                    }}
                    label={formatDate(_, {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    })}
                    color="primary"
                  />
                ))}
              </Box>
            </Scrollbars>
          </Box>
          <MobileDatePicker
            label={formatMessage({ id: 'selectDates' })}
            value={newDate}
            minDate={dayjs(new Date())}
            onChange={(newValue) => {
              setNewDate(newValue);
              const dateData = new Date(String(newValue)).toDateString();
              const tempSelectedDates: string[] = selectedDates.map((_) =>
                _.toDateString()
              );
              const data = tempSelectedDates.includes(dateData);
              if (!data)
                setSelectedDates([...selectedDates, new Date(dateData)]);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="date-picker"
                sx={{ display: 'none' }}
              />
            )}
          />
          <label htmlFor="date-picker" style={{ justifySelf: 'end' }}>
            <Button
              component="span"
              size="small"
              color="primary"
              variant="contained"
              disabled={isCreating}
              sx={{ textTransform: 'none' }}
              endIcon={
                <FileDownloadOutlined sx={{ color: theme.common.white }} />
              }
            >
              {formatMessage({ id: 'add' })}
            </Button>
          </label>
        </Box>
        <Box
          sx={{
            display: 'grid',
            alignItems: 'center',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(3),
          }}
        >
          <DesktopTimePicker
            label={formatMessage({ id: 'startsAt' })}
            value={startsAt}
            onChange={(newValue) => {
              setStartsAt(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} disabled={isCreating} />
            )}
          />
          <DesktopTimePicker
            label={formatMessage({ id: 'endsAt' })}
            value={endsAt}
            onChange={(newValue) => {
              setEndsAt(newValue);
            }}
            minTime={startsAt}
            renderInput={(params) => (
              <TextField {...params} disabled={isCreating} />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          disabled={isCreating}
          onClick={() => {
            if (!isCreating) {
              closeDialog();
              resetForm();
            }
          }}
          sx={{ textTransform: 'none' }}
        >
          {formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isCreating}
          autoFocus
          sx={{ textTransform: 'none' }}
          onClick={handlePublish}
        >
          {formatMessage({ id: 'publish' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
