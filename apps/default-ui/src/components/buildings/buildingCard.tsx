import { DeleteOutline } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Building } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ConfirmDeleteDialog from './confirmDeleteDialog';

export interface DeletableElement {
  element_id: string;
  level: number;
}
export default function BuildingCard({
  building: { Halls: halls, building_code, building_id },
  isChild = false,
}: {
  building: Building;
  isChild?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { formatMessage } = useIntl();

  const [deletableElement, setDeletableElement] = useState<DeletableElement>();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteBuilding = (element: DeletableElement) => {
    setDeletableElement(element);
    setIsConfirmDialogOpen(true);
  };
  return (
    <>
      {deletableElement && (
        <ConfirmDeleteDialog
          closeDialog={() => {
            setIsConfirmDialogOpen(false);
            setDeletableElement(undefined);
          }}
          element={deletableElement}
          isDialogOpen={isConfirmDialogOpen}
        />
      )}
      <Box>
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
            onClick={() => {
              if (halls.length > 0) setIsOpen(!isOpen);
            }}
            sx={{ padding: `${theme.spacing(2.5)} 0` }}
          >
            {building_code}
          </Typography>
          <Tooltip arrow title={formatMessage({ id: 'deleteSchool' })}>
            <IconButton
              size="small"
              onClick={() =>
                deleteBuilding({
                  element_id: building_id,
                  level: isChild ? 2 : 1,
                })
              }
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ padding: `0 ${theme.spacing(4)}` }}>
          {isOpen &&
            halls.map(({ hall_capacity, hall_code, hall_id }, index) => (
              <BuildingCard
                isChild
                building={{
                  building_code: `${hall_code} (${hall_capacity} ${formatMessage(
                    {
                      id: 'places',
                    }
                  )})`,
                  building_id: hall_id,
                  Halls: [],
                }}
                key={index}
              />
            ))}
        </Box>
      </Box>
    </>
  );
}
