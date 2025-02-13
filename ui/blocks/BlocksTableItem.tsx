import { Tr, Td, Flex, Box, Text, Tooltip, Skeleton, useColorModeValue } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { motion } from 'framer-motion';
import React from 'react';

import type { Block } from 'types/api/block';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import { WEI, WEI_IN_GWEI } from 'lib/consts';
import { space } from 'lib/html-entities';
import { currencyUnits } from 'lib/units';
import BlockTimestamp from 'ui/blocks/BlockTimestamp';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import BlockHashEntity from 'ui/shared/entities/block/BlockHashEntity';
import GasUsedToTargetRatio from 'ui/shared/GasUsedToTargetRatio';
import LinkInternal from 'ui/shared/LinkInternal';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';

interface Props {
  data: Block;
  isLoading?: boolean;
  enableTimeIncrement?: boolean;
}

const isRollup = config.features.optimisticRollup.isEnabled || config.features.zkEvmRollup.isEnabled;

const BlocksTableItem = ({ data, isLoading, enableTimeIncrement }: Props) => {
  const separatorColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ data.height }
    >
      <Td fontSize="sm">
        <Flex columnGap={ 2 } alignItems="center" mb={ 2 }>
          <Tooltip isDisabled={ data.type !== 'reorg' } label="Chain reorganizations">
            <BlockEntity
              isLoading={ isLoading }
              number={ data.height }
              hash={ data.type !== 'block' ? data.hash : undefined }
              noIcon
              fontSize="sm"
              lineHeight={ 5 }
              fontWeight={ 600 }
            />
          </Tooltip>
        </Flex>
        <BlockTimestamp ts={ data.timestamp } isEnabled={ enableTimeIncrement } isLoading={ isLoading }/>
      </Td>
      <Td fontSize="sm">
        <Skeleton isLoaded={ !isLoading } display="inline-block">
          { data.size.toLocaleString() }
        </Skeleton>
      </Td>
      { !config.UI.views.block.hiddenFields?.miner && (
        <Td fontSize="sm">
          <AddressEntity
            address={ data.miner }
            isLoading={ isLoading }
          />
        </Td>
      ) }
      <Td isNumeric fontSize="sm">
        { data.tx_count > 0 ? (
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            <LinkInternal href={ route({
              pathname: '/block/[height_or_hash]',
              query: { height_or_hash: String(data.height), tab: 'txs' },
            }) }>
              { data.tx_count }
            </LinkInternal>
          </Skeleton>
        ) : data.tx_count }
      </Td>
      { !isRollup && !config.UI.views.block.hiddenFields?.total_reward && (
        <Td fontSize="sm">
          <Skeleton isLoaded={ !isLoading } display="inline-block">{ BigNumber(data.gas_used || 0).toFormat() }</Skeleton>
          <Flex mt={ 2 }>
            <Tooltip label={ isLoading ? undefined : 'Gas Used %' }>
              <Box>
                <Utilization
                  colorScheme="gray"
                  value={ BigNumber(data.gas_used || 0).dividedBy(BigNumber(data.gas_limit)).toNumber() }
                  isLoading={ isLoading }
                />
              </Box>
            </Tooltip>
            { data.gas_target_percentage && (
              <>
                <TextSeparator color={ separatorColor } mx={ 1 }/>
                <GasUsedToTargetRatio value={ data.gas_target_percentage } isLoading={ isLoading }/>
              </>
            ) }
          </Flex>
        </Td>
      ) }
      <Td fontSize="sm">
        <BlockHashEntity
          isLoading={ isLoading }
          hash={ data.hash }
          noIcon
          fontSize="sm"
          lineHeight={ 5 }
          fontWeight={ 600 }
        />
      </Td>
      <Td fontSize="sm">
        <Skeleton isLoaded={ !isLoading } display="inline-block">
          { data.base_fee_per_gas && (
            <>
              <Text>{ BigNumber(data.base_fee_per_gas).dividedBy(WEI).toFixed() } { currencyUnits.ether } </Text>
              <Text variant="secondary" whiteSpace="pre">
                { space }({ BigNumber(data.base_fee_per_gas).dividedBy(WEI_IN_GWEI).toFixed() } { currencyUnits.gwei })
              </Text>
            </>
          ) }
        </Skeleton>
      </Td>
    </Tr>
  );
};

export default React.memo(BlocksTableItem);
