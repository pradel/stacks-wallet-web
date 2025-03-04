import BigNumber from 'bignumber.js';

import { createMoney } from '@shared/models/money.model';

import { formatMoneyPadded } from '@app/common/money/format-money';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { SendTransferActions } from './components/send-transfer-actions';
import { SendTransferDetails } from './components/send-transfer-details';
import { SendTransferHeader } from './components/send-transfer-header';
import { useRpcSendTransfer } from './use-rpc-send-transfer';

export function RpcSendTransfer() {
  const bitcoinAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const { address, amount, onChooseTransferFee, origin } = useRpcSendTransfer();

  const amountAsMoney = createMoney(new BigNumber(amount), 'BTC');
  const formattedMoney = formatMoneyPadded(amountAsMoney);
  const requester = new URL(origin ?? '').host;

  return (
    <>
      <SendTransferHeader amount={formattedMoney} requester={requester} />
      <SendTransferDetails
        address={address}
        amount={formattedMoney}
        currentAddress={bitcoinAddress}
      />
      <SendTransferActions action="Continue" onApprove={onChooseTransferFee} />
    </>
  );
}
