import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { RouteUrls } from '@shared/route-urls';

import { useWalletType } from '@app/common/use-wallet-type';
import { useConfigNftMetadataEnabled } from '@app/query/common/remote-config/remote-config.query';

import { AddCollectible } from './components/add-collectible';
import { Ordinals } from './components/bitcoin/ordinals';
import { Stamps } from './components/bitcoin/stamps';
import { CollectiblesLayout } from './components/collectibes.layout';
import { StacksCryptoAssets } from './components/stacks/stacks-crypto-assets';
import { TaprootBalanceDisplayer } from './components/taproot-balance-displayer';
import { useIsFetchingCollectiblesRelatedQuery } from './hooks/use-is-fetching-collectibles';

export function Collectibles() {
  const { whenWallet } = useWalletType();
  const navigate = useNavigate();
  const isNftMetadataEnabled = useConfigNftMetadataEnabled();
  const queryClient = useQueryClient();
  const isFetching = useIsFetchingCollectiblesRelatedQuery();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  return (
    <CollectiblesLayout
      title="Collectibles"
      subHeader={whenWallet({
        software: (
          <TaprootBalanceDisplayer
            onSelectRetrieveBalance={() => navigate(RouteUrls.RetriveTaprootFunds)}
          />
        ),
        ledger: null,
      })}
      isLoading={isFetching}
      isLoadingMore={isLoadingMore}
      onRefresh={() => void queryClient.refetchQueries({ type: 'active' })}
    >
      {whenWallet({
        software: <AddCollectible />,
        ledger: null,
      })}

      {isNftMetadataEnabled ? <StacksCryptoAssets /> : null}

      {whenWallet({
        software: (
          <>
            <Stamps />
            <Ordinals setIsLoadingMore={setIsLoadingMore} />
          </>
        ),
        ledger: null,
      })}
    </CollectiblesLayout>
  );
}
