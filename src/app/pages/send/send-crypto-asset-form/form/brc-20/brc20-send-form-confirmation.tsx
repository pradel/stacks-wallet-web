import { useLocation, useNavigate } from 'react-router-dom';

import { Stack } from '@stacks/ui';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import get from 'lodash.get';

import { decodeBitcoinTx } from '@shared/crypto/bitcoin/bitcoin.utils';
import { createMoney } from '@shared/models/money.model';
import { RouteUrls } from '@shared/route-urls';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { sumMoney } from '@app/common/money/calculate-money';
import { formatMoney, formatMoneyPadded } from '@app/common/money/format-money';
import {
  InfoCard,
  InfoCardAssetValue,
  InfoCardFooter,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { ModalHeader } from '@app/components/modal-header';
import { PrimaryButton } from '@app/components/primary-button';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/address/use-current-account-native-segwit-utxos';
import { useBrc20Transfers } from '@app/query/bitcoin/ordinals/brc20/use-brc-20';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';

import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

function useBrc20SendFormConfirmationState() {
  const location = useLocation();
  return {
    orderId: get(location.state, 'orderId') as string,
    fee: get(location.state, 'fee') as string,
    serviceFee: get(location.state, 'serviceFee') as number,
    serviceFeeRecipient: get(location.state, 'serviceFeeRecipient') as string,
    recipient: get(location.state, 'recipient') as string,
    tick: get(location.state, 'tick') as string,
    amount: get(location.state, 'amount') as string,
    tx: get(location.state, 'tx') as string,
  };
}

export function Brc20SendFormConfirmation() {
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const { amount, recipient, fee, tick, serviceFee, tx, orderId } =
    useBrc20SendFormConfirmationState();

  const summaryFeeMoney = createMoney(Number(fee), 'BTC');
  const summaryFee = formatMoneyPadded(summaryFeeMoney);

  const serviceFeeMoney = createMoney(serviceFee, 'BTC');
  const serviceFeeFormatted = formatMoneyPadded(serviceFeeMoney);

  const totalFee = sumMoney([summaryFeeMoney, serviceFeeMoney]);
  const totalFeeFormatted = formatMoney(totalFee);

  const amountFormatted = formatMoney(createMoney(Number(amount), tick, 0));
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();
  const { refetch } = useCurrentNativeSegwitUtxos();

  const psbt = decodeBitcoinTx(tx);
  const nav = useSendFormNavigate();
  const { inscriptionPaymentTransactionComplete } = useBrc20Transfers();

  async function initiateTransaction() {
    await broadcastTx({
      tx,
      async onSuccess(txId: string) {
        inscriptionPaymentTransactionComplete(orderId, Number(amount), recipient, tick);

        void analytics.track('broadcast_transaction', {
          symbol: tick,
          type: 'brc-20',
          amount,
          fee,
          inputs: psbt.inputs.length,
          outputs: psbt.inputs.length,
        });
        await refetch();
        navigate(RouteUrls.SentBrc20Summary.replace(':ticker', tick), {
          state: {
            fee: summaryFee,
            serviceFee: serviceFeeFormatted,
            totalFee: totalFeeFormatted,
            recipient,
            tick,
            amount,
            txId,
            txLink: {
              blockchain: 'bitcoin',
              txid: txId || '',
            },
            hasHeaderTitle: true,
          },
        });
      },
      onError(e) {
        nav.toErrorPage(e);
      },
    });
  }

  useRouteHeader(<ModalHeader hideActions defaultClose defaultGoBack title="Review" />);

  return (
    <InfoCard data-testid={SendCryptoAssetSelectors.ConfirmationDetails}>
      <InfoCardAssetValue
        value={Number(amount)}
        symbol={tick}
        data-testid={SendCryptoAssetSelectors.ConfirmationDetailsAssetValue}
        mt="loose"
        mb="extra-loose"
        px="loose"
      />

      <Stack width="100%" px="extra-loose" pb="extra-loose">
        <InfoCardRow title="Sending" value={amountFormatted} />
        <InfoCardRow title="Inscription service fee" value={serviceFeeFormatted} />
        <InfoCardRow
          title="Payment transaction fee"
          value={summaryFee}
          data-testid={SendCryptoAssetSelectors.ConfirmationDetailsFee}
        />
        <InfoCardSeparator />

        <InfoCardRow title="Total fee" value={totalFeeFormatted} />
      </Stack>

      <InfoCardFooter>
        <PrimaryButton isLoading={isBroadcasting} width="100%" onClick={initiateTransaction}>
          Create transfer inscription
        </PrimaryButton>
      </InfoCardFooter>
    </InfoCard>
  );
}
