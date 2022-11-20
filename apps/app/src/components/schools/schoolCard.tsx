import { DeleteOutline } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { theme } from '@ricly/theme';
import { SchoolInterface } from 'libs/interfaces/src';
import { useIntl } from 'react-intl';

export default function SchoolCard({
  school: { school_acronym, school_name },
  onSelect,
  deleteSchool,
}: {
  school: SchoolInterface;
  onSelect: () => void;
  deleteSchool: () => void;
}) {
  const { formatMessage } = useIntl();
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.common.lighterPrimary}`,
        borderTop: `1px solid ${theme.common.lighterPrimary}`,
        backgroundColor: theme.common.CSK50,
        transition: '0.3s',
        padding: `0 ${theme.spacing(4.625)}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        cursor: 'pointer',
        '& .MuiButtonBase-root': {
          visibility: 'hidden',
        },
        '&:hover': {
          '& .MuiButtonBase-root': {
            visibility: 'visible',
          },
          backgroundColor: theme.common.backgroundPrimary,
          transition: '0.3s',
        },
      }}
    >
      <Typography
        onClick={onSelect}
        sx={{ padding: `${theme.spacing(2.5)} 0` }}
      >{`${school_name} (${school_acronym})`}</Typography>
      <Tooltip arrow title={formatMessage({ id: 'deleteSchool' })}>
        <IconButton size="small" onClick={deleteSchool}>
          <DeleteOutline />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
