import { Skeleton } from '@mui/material';
import { UsageInterface } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { random } from '@ricly/utils';
import Chart, { ChartItem } from 'chart.js/auto';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

export default function Graph({
  data,
  isDataLoading,
}: {
  data: UsageInterface[];
  isDataLoading: boolean;
}) {
  const { formatDate, formatMessage } = useIntl();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (data: any) => {
    return {
      type: 'line',
      data,
      options: {
        maintainAspectRatio: false,
        tension: 0.2,
        scales: {
          y: {
            stacked: true,
            grid: {
              display: true,
              color: theme.common.primaryDark,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        parsing: {
          xAxisKey: 'date',
          yAxisKey: 'calls',
        },
      },
    };
  };

  const updateGraph = () => {
    const dataChart = Chart.getChart('dataChart');
    if (dataChart) dataChart.destroy();

    new Chart(
      document.getElementById('dataChart') as ChartItem,
      config({
        datasets: [
          {
            label: formatMessage({ id: 'apiUsageGraph' }),
            data: data
              .sort((a, b) => (a.date > b.date ? 1 : -1))
              .map(({ calls, date }) => ({
                calls,
                date: formatDate(date, {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }),
              })),
            borderColor: theme.common.lighterPrimary,
            // backgroundColor: theme.common.backgroundPrimary,
            fill: true,
            order: 2,
          },
        ],
      })
    );
  };
  useEffect(() => {
    updateGraph();
    // eslint-disable-next-line
  }, [data]);

  return (
    <>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: isDataLoading ? 'none' : 'grid',
        }}
      >
        <canvas id="dataChart"></canvas>
      </div>
      {isDataLoading && (
        <div>
          {[...new Array(9)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              animation="wave"
              height={`${random() * 10}%`}
            />
          ))}
        </div>
      )}
    </>
  );
}
