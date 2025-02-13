import { Grid } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import { WEI, WEI_IN_GWEI } from 'lib/consts';
import { currencyUnits } from 'lib/units';
import { HOMEPAGE_STATS } from 'stubs/stats';

import StatsItem from './StatsItem';

const hasAvgBlockTime = config.UI.homepage.showAvgBlockTime;

const Stats = () => {
  const { data, isPlaceholderData, isError } = useApiQuery('homepage_stats', {
    fetchParams: {
      headers: {
        'updated-gas-oracle': 'true',
      },
    },
    queryOptions: {
      refetchOnMount: false,
      placeholderData: HOMEPAGE_STATS,
      refetchInterval: 3000,
    },
  });

  if (isError) {
    return null;
  }

  let content;

  const lastItemTouchStyle = { gridColumn: { base: 'span 2', lg: 'unset' } };

  let itemsCount = 3;
  !hasAvgBlockTime && itemsCount--;

  if (data) {
    const isOdd = Boolean(itemsCount % 2);

    content = (
      <>
        <StatsItem
          icon="block"
          title="Total blocks"
          value={ Number(data.total_blocks).toLocaleString() }
          url={ route({ pathname: '/blocks' }) }
          isLoading={ isPlaceholderData }
        />
        { hasAvgBlockTime && (
          <StatsItem
            icon="clock-light"
            title="Average block time"
            value={ `${ (data.average_block_time / 1000).toFixed(1) }s` }
            isLoading={ isPlaceholderData }
          />
        ) }
        { /* <StatsItem
          icon="transactions"
          title="Total transactions"
          value={ Number(data.total_transactions).toLocaleString() }
          url={ route({ pathname: '/txs' }) }
          isLoading={ isPlaceholderData }
        />
        <StatsItem
          icon="wallet"
          title="Wallet addresses"
          value={ Number(data.total_addresses).toLocaleString() }
          _last={ isOdd ? lastItemTouchStyle : undefined }
          isLoading={ isPlaceholderData }
        /> */ }
        { data.base_fee_per_gas && (
          <StatsItem
            icon="gas"
            title="Base fee"
            value={ BigNumber(data.base_fee_per_gas).dividedBy(WEI_IN_GWEI).toFixed() + ' ' + currencyUnits.gwei }
            _last={ isOdd ? lastItemTouchStyle : undefined }
            isLoading={ isPlaceholderData }
          />
        ) }
        { data.rootstock_locked_btc && (
          <StatsItem
            icon="coins/bitcoin"
            title="BTC Locked in 2WP"
            value={ `${ BigNumber(data.rootstock_locked_btc).div(WEI).dp(0).toFormat() } RBTC` }
            _last={ isOdd ? lastItemTouchStyle : undefined }
            isLoading={ isPlaceholderData }
          />
        ) }
      </>
    );
  }

  return (
    <Grid
      gridTemplateColumns={{ lg: `repeat(${ itemsCount }, 1fr)`, base: '1fr 1fr' }}
      gridTemplateRows={{ lg: 'none', base: undefined }}
      gridGap="10px"
      marginTop="24px"
    >
      { content }
    </Grid>

  );
};

export default Stats;
