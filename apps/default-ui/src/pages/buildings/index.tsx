import {
  AddOutlined,
  FileDownloadOutlined,
  ReportRounded,
  SearchOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { Building } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import BuildingCard from '../../components/buildings/buildingCard';
import { useUser } from '../../contexts/UserContextProvider';
import {
  getBuildings,
  importBuildings,
} from '../../services/buildings.service';

export default function Buildings() {
  const { formatMessage } = useIntl();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [displayBuildings, setDisplayBuildings] = useState<Building[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [areBuildingsLoading, setAreBuildingsLoading] =
    useState<boolean>(false);

  const loadBuildings = () => {
    setAreBuildingsLoading(true);
    getBuildings()
      .then((buildings) => {
        setBuildings(buildings);
        setDisplayBuildings(buildings);
        setAreBuildingsLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingBuildings' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadBuildings}
              notification={notif}
              message={
                error?.message ||
                formatMessage({ id: 'failedLoadingBuildings' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const {
    user: { roles },
  } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!roles.find(({ role }) => role === 'SECRETARY')) navigate('/');
    else loadBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayBuildings(
      buildings.filter(({ building_code }) =>
        building_code.includes(searchValue)
      )
    );
  }, [buildings, searchValue]);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function uploadFile(files: FileList) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingBuildingsAndClassrooms' }),
    });
    importBuildings(files[0])
      .then((data) => {
        notif.update({
          render: `${formatMessage({
            id: 'allCreatedSuccessfull',
          })}. Buildings(${data[0].count}), Halls(${data[1].count})`,
        });
        setNotifications([]);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => uploadFile(files)}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'csvCreationFailed' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  }

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          marginBottom: theme.spacing(3.75),
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'end',
        }}
      >
        <Typography variant="h3">
          {formatMessage({ id: 'buildingsAndHalls' })}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'stretch',
            columnGap: theme.spacing(2),
          }}
        >
          <Box>
            <input
              id="add-image-button"
              accept=".csv"
              type="file"
              hidden
              onChange={(event) => {
                uploadFile(event.target.files as FileList);
              }}
            />
            <label htmlFor="add-image-button">
              <Button
                component="span"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
                size="large"
                disabled={isCreating}
                endIcon={
                  <AddOutlined
                    sx={{
                      color: 'white',
                    }}
                  />
                }
              >
                {formatMessage({ id: 'import' })}
              </Button>
            </label>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
            size="small"
            startIcon={
              <FileDownloadOutlined
                sx={{
                  color: theme.palette.primary.light,
                }}
              />
            }
          >
            {formatMessage({ id: 'createBuilding' })}
          </Button>
        </Box>
      </Box>
      <Box
        sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            backgroundColor: theme.common.CSK200,
            padding: `0 ${theme.spacing(4.625)}`,
          }}
        >
          <Typography>{`${formatMessage({ id: 'buildings' })} (${
            displayBuildings.length
          })`}</Typography>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={formatMessage({ id: 'searchBuilding' })}
            sx={{ m: 1, width: '25ch', backgroundColor: theme.common.white }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {<SearchOutlined />}
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Scrollbars>
          {areBuildingsLoading ? (
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
          ) : displayBuildings.length === 0 ? (
            <Typography variant="h5" sx={{ textAlign: 'center' }}>
              {formatMessage({
                id: searchValue !== '' ? 'noItemMatchSearch' : 'noBuildingsYet',
              })}
            </Typography>
          ) : (
            displayBuildings
              .sort((a, b) => (a.building_code > b.building_code ? 1 : -1))
              .map((building, index) => (
                <BuildingCard key={index} building={building} />
              ))
          )}
        </Scrollbars>
      </Box>
    </Box>
  );
}
