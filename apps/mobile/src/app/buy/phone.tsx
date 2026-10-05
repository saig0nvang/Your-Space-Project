/**
 * TT1 — Số điện thoại (E7-US4). Xác minh người mua ở lần mua đầu. Không tạo tài khoản, mật khẩu, email.
 */
import { router } from 'expo-router';
import { useState } from 'react';

import { AppText, Banner, Button, OfflineBanner, TextField } from '@/components/ui';
import { Appear, BuySheet, BuyUnavailable } from '@/features/buy/BuySheet';
import { useBuyClose, useSubmitLock } from '@/features/buy/navigation';
import { useBuyStep } from '@/features/buy/steps';
import { digitsOnly, formatPhone, isValidVietnamesePhone } from '@/lib/format';
import { sendOtp } from '@/services/otp';
import { useAppStore } from '@/store/appStore';

const PHONE_ERROR = 'Số điện thoại chưa đúng. Nhập 10 số, bắt đầu bằng 0.';

export default function PhoneScreen() {
  const hasSession = useAppStore((s) => s.buySession !== null);
  const close = useBuyClose('none');
  const step = useBuyStep('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const lock = useSubmitLock();

  if (!hasSession) return <BuyUnavailable title="Số điện thoại" />;

  const onSend = () =>
    lock(async () => {
      if (!isValidVietnamesePhone(phone)) {
        setError(PHONE_ERROR);
        return;
      }
      setSending(true);
      setSendFailed(false);
      const res = await sendOtp(phone);
      setSending(false);
      if (!res.ok) {
        setSendFailed(true);
        return;
      }
      router.push({ pathname: '/buy/otp', params: { phone } });
    });

  return (
    <BuySheet
      title="Số điện thoại"
      step={step}
      onBack={() => router.back()}
      onClose={() => void close()}
      footer={
        <Button
          label="Gửi mã"
          onPress={onSend}
          loading={sending}
          loadingLabel="Đang gửi mã"
          disabled={phone.length === 0}
          fullWidth
        />
      }
    >
      <OfflineBanner body="Số bạn nhập vẫn được giữ. Gửi mã được khi có mạng." />

      <AppText variant="callout">
        Số điện thoại dùng để giao hàng và để đối tác thanh toán giữ khoản tiền đến khi bạn nhận hàng.
      </AppText>

      <TextField
        label="Số điện thoại"
        value={formatPhone(phone)}
        onChangeText={(text) => {
          setPhone(digitsOnly(text).slice(0, 10));
          setError(null);
          setSendFailed(false);
        }}
        onBlur={() => {
          if (phone.length > 0 && !isValidVietnamesePhone(phone)) setError(PHONE_ERROR);
        }}
        onSubmitEditing={onSend}
        returnKeyType="send"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus
        maxLength={12}
        placeholder="0912 345 678"
        error={error}
        helper="Bạn sẽ nhận một mã 6 số qua tin nhắn. Chỉ cần xác minh một lần trên máy này, không cần tạo tài khoản."
      />

      {sendFailed ? (
        <Appear>
          <Banner
            tone="error"
            title="Chưa gửi được mã"
            body="Kiểm tra kết nối mạng rồi bấm Gửi mã lần nữa. Số bạn nhập vẫn còn đây."
          />
        </Appear>
      ) : null}
    </BuySheet>
  );
}
