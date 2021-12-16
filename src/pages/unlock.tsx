import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/css';
import { Box, Button, Input, Stack, Text } from '@stacks/ui';

import { useRouteHeader } from '@common/hooks/use-route-header';
import { useWallet } from '@common/hooks/use-wallet';
import { useDrawers } from '@common/hooks/use-drawers';
import { buildEnterKeyEvent } from '@components/link';
import { ErrorLabel } from '@components/error-label';
import { Header } from '@components/header';
import { Body } from '@components/typography';
import { SignOutConfirmDrawer } from '@pages/sign-out-confirm/sign-out-confirm';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';
import { RouteUrls } from '@routes/route-urls';
import { useOnboardingState } from '@common/hooks/auth/use-onboarding-state';
import { getViewMode } from '@common/utils';
import { Caption } from '@components/typography';
import { useWaitingMessage, WaitingMessages } from '@common/utils/use-waiting-message';

const waitingMessages: WaitingMessages = {
  '2': 'Please wait a few seconds…',
  '10': 'Still working, please wait.',
  '20': 'Almost there.',
};

export function Unlock(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { unlockWallet } = useWallet();
  const { decodedAuthRequest } = useOnboardingState();
  const { showSignOut } = useDrawers();
  const analytics = useAnalytics();
  const navigate = useNavigate();
  const [waitingMessage, startWaitingMessage, stopWaitingMessage] =
    useWaitingMessage(waitingMessages);

  useRouteHeader(<Header />);

  const mode = getViewMode();
  const isFullPage = mode === 'full';

  const submit = useCallback(async () => {
    const startUnlockTimeMs = performance.now();
    void analytics.track('start_unlock');
    setLoading(true);
    startWaitingMessage();
    setError('');
    try {
      await unlockWallet(password);

      if (decodedAuthRequest) {
        navigate(RouteUrls.ChooseAccount);
      } else {
        navigate(RouteUrls.Home);
      }
    } catch (error) {
      setError('The password you entered is invalid.');
    }
    setLoading(false);
    stopWaitingMessage();
    const unlockSuccessTimeMs = performance.now();
    void analytics.track('complete_unlock', {
      durationMs: unlockSuccessTimeMs - startUnlockTimeMs,
    });
  }, [
    startWaitingMessage,
    analytics,
    stopWaitingMessage,
    unlockWallet,
    password,
    decodedAuthRequest,
    navigate,
  ]);

  return (
    <>
      <Box mt="loose">
        <Stack spacing="loose" width="100%">
          <Body
            className={
              isFullPage
                ? css({ paddingLeft: '16px', paddingRight: '16px', textAlign: 'center' })
                : undefined
            }
          >
            <Caption fontSize={0} mt="base-loose" textAlign={'center'}>
              {waitingMessage || 'Enter the password you used on this device.'}
            </Caption>
          </Body>
          <Box width="100%">
            <Input
              placeholder="Enter your password"
              width="100%"
              autoFocus
              type="password"
              value={password}
              isDisabled={loading}
              data-testid="set-password"
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                setPassword(e.currentTarget.value)
              }
              onKeyUp={buildEnterKeyEvent(submit)}
            />
          </Box>
          {error && (
            <Box>
              <ErrorLabel>
                <Text textStyle="caption">{error}</Text>
              </ErrorLabel>
            </Box>
          )}
          <Box>
            <Button
              width="100%"
              isLoading={loading}
              isDisabled={loading}
              onClick={submit}
              data-testid="set-password-done"
              borderRadius="10px"
            >
              Unlock
            </Button>
          </Box>
        </Stack>
      </Box>
      {showSignOut && <SignOutConfirmDrawer />}
    </>
  );
}
