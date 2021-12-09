import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';

import { LoadingKeys } from '@common/hooks/use-loading';
import { useSubmitTransactionCallback } from '@common/hooks/use-submit-stx-transaction';
import { useRawTxIdState } from '@store/transactions/raw.hooks';
import { rawDeserializedTxState } from '@store/transactions/raw';
import { feeEstimationsState } from '@store/transactions/fees';

import { useSignTransactionSoftwareWallet } from './transaction.hooks';

export function useFeeEstimationsState() {
  return useAtom(feeEstimationsState);
}

export const useReplaceByFeeSubmitCallBack = () => {
  const [, setTxId] = useRawTxIdState();
  const signTx = useSignTransactionSoftwareWallet();

  const submitTransaction = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.INCREASE_FEE_DRAWER,
  });

  return useAtomCallback<void, { fee: number; nonce: number }>(
    useCallback(
      async get => {
        const unsignedTx = await get(rawDeserializedTxState, true);
        if (!unsignedTx) return;
        const signedTx = signTx(unsignedTx);
        await submitTransaction({
          onClose: () => setTxId(null),
          replaceByFee: true,
        })(signedTx);
      },
      [setTxId, submitTransaction, signTx]
    )
  );
};
