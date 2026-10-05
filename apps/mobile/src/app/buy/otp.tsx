/**
 * TT2 — Mã OTP (E7-US4). Tự gửi khi nhập đủ số; đếm ngược rồi cho gửi lại mã.
 * Số lần thử và thời hạn mã chưa chốt (docs/screens.md §8.2 Q13).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText, Banner, Button, ErrorState, OfflineBanner, TextField, showToast } from '@/components/ui';
import { Appear, BuySheet, BuyUnavailable } from '@/features/buy/BuySheet';
import { useBuyClose, useBuyNavigation, useSubmitLock } from '@/features/buy/navigation';
import { useBuyStep } from '@/features/buy/steps';
import { digitsOnly, formatPhone, isValidVietnamesePhone } from '@/lib/format';
import { DEV_OTP_CODE, OTP_LENGTH, OTP_RESEND_SECONDS, sendOtp, verifyOtp } from '@/services/otp';
import { useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';
import { useTheme } from '@/theme';

export default function OtpScreen() {
  const t = useTheme();
  const showDevControls = useDevFlags((s) => s.showDevControls);
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';
  const hasSession = useAppStore((s) => s.buySession !== null);
  const close = useBuyClose('none');
  const step = useBuyStep('phone');
  const navigation = useBuyNavigation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [networkFailed, setNetworkFailed] = useState(false);
  const [remaining, setRemaining] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const lock = useSubmitLock();

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  if (!hasSession) return <BuyUnavailable title="Mã xác minh" />;

  if (!isValidVietnamesePhone(phone)) {
    return (
      <BuySheet
        title="Mã xác minh"
        step={step}
        onBack={() => router.back()}
        onClose={() => void close()}
        footer={<Button variant="secondary" label="Nhập số điện thoại" onPress={() => router.back()} fullWidth />}
      >
        <ErrorState title="Thiếu số điện thoại" body="Quay lại bước trước để nhập số nhận mã xác minh." />
      </BuySheet>
    );
  }

  const verify = (value: string) =>
    lock(async () => {
      if (value.length !== OTP_LENGTH) return;
      setVerifying(true);
      setError(null);
      setNetworkFailed(false);
      const res = await verifyOtp(phone, value);
      setVerifying(false);
      if (!res.ok) {
        if (res.error.kind === 'offline') {
          setNetworkFailed(true);
          return;
        }
        setError(
          res.error.kind === 'expired'
            ? 'Mã đã hết hạn. Gửi mã mới để tiếp tục.'
            : 'Mã chưa đúng. Kiểm tra lại hoặc gửi mã mới.',
        );
        return;
      }
      useAppStore.getState().updateUser({ verifiedPhone: phone });
      // Sang TT3 và bỏ TT1, TT2 khỏi lịch sử: quay lại từ TT3 về thẳng sheet mua.
      const first = navigation.getState().routes[0];
      navigation.reset({
        index: 1,
        routes: [{ key: first.key, name: first.name, params: first.params }, { name: 'checkout' }],
      });
    });

  const onResend = () =>
    lock(async () => {
      setResending(true);
      setNetworkFailed(false);
      setError(null);
      const res = await sendOtp(phone);
      setResending(false);
      if (!res.ok) {
        setNetworkFailed(true);
        return;
      }
      setCode('');
      setRemaining(OTP_RESEND_SECONDS);
      showToast('Đã gửi mã mới');
    });

  return (
    <BuySheet
      title="Mã xác minh"
      step={step}
      onBack={() => router.back()}
      onClose={() => void close()}
      footer={
        <>
          <Button
            label="Xác nhận"
            onPress={() => void verify(code)}
            disabled={code.length !== OTP_LENGTH}
            loading={verifying}
            loadingLabel="Đang kiểm tra mã"
            fullWidth
          />
          <Button variant="plain" label="Đổi số" onPress={() => router.back()} fullWidth />
        </>
      }
    >
      <OfflineBanner body="Số của bạn vẫn được giữ. Nhập mã hoặc gửi lại mã khi có mạng." />

      <AppText variant="callout">
        Nhập mã {OTP_LENGTH} số vừa gửi tới{' '}
        <AppText variant="callout" weight="600" tabular>
          {formatPhone(phone)}
        </AppText>
        .
      </AppText>

      <TextField
        label="Mã xác minh"
        value={code}
        onChangeText={(text) => {
          const next = digitsOnly(text).slice(0, OTP_LENGTH);
          setCode(next);
          setError(null);
          if (next.length === OTP_LENGTH) void verify(next);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={OTP_LENGTH}
        placeholder="6 chữ số"
        editable={!verifying}
        error={error}
      />

      {__DEV__ && showDevControls ? (
        <AppText variant="footnote" color="mutedForeground">
          {`Mã thử: ${DEV_OTP_CODE}`}
        </AppText>
      ) : null}

      {networkFailed ? (
        <Appear>
          <Banner
            tone="error"
            title="Chưa kết nối được"
            body="Kiểm tra mạng rồi thử lại. Số điện thoại của bạn vẫn được giữ."
          />
        </Appear>
      ) : null}

      <View style={{ alignItems: 'flex-start', marginLeft: remaining > 0 ? 0 : -t.spacing.sm }}>
        {remaining > 0 ? (
          <AppText variant="footnote" color="mutedForeground" tabular accessibilityLiveRegion="none">
            Gửi lại mã sau {remaining} giây
          </AppText>
        ) : (
          <Button
            variant="plain"
            label="Gửi lại mã"
            onPress={onResend}
            loading={resending}
            loadingLabel="Đang gửi lại mã"
          />
        )}
      </View>
    </BuySheet>
  );
}
