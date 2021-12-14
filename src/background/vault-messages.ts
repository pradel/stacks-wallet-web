import { ExtensionMethods, InternalMethods, Message } from '@common/message-types';

/**
 * Vault <-> Background Script
 */
type VaultMessage<M extends ExtensionMethods, P = undefined> = Omit<Message<M, P>, 'source'>;

type GetWallet = VaultMessage<InternalMethods.getWallet>;
type MakeSoftwareWallet = VaultMessage<InternalMethods.makeSoftwareWallet>;
type CreateNewAccount = VaultMessage<InternalMethods.createNewAccount>;
type SignOut = VaultMessage<InternalMethods.signOut>;
type LockWallet = VaultMessage<InternalMethods.lockWallet>;

export type StoreSeed = VaultMessage<
  InternalMethods.storeSeed,
  { secretKey: string; password?: string }
>;
export type SetPassword = VaultMessage<InternalMethods.setPassword, string>;
export type UnlockWallet = VaultMessage<InternalMethods.unlockWallet, string>;
export type SwitchAccount = VaultMessage<InternalMethods.switchAccount, number>;

export type VaultActions =
  | GetWallet
  | MakeSoftwareWallet
  | StoreSeed
  | CreateNewAccount
  | SignOut
  | SetPassword
  | UnlockWallet
  | SwitchAccount
  | LockWallet;
