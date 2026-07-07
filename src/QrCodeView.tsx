import { useMemo } from 'react';
import QRCodeStyled from 'react-native-qrcode-styled';

const CODE_BG = '#ffffff';
const CODE_FG = '#000000';

type QrCodeViewProps = {
  value: string;
  size: number;
};

export function QrCodeView({ value, size }: QrCodeViewProps) {
  const qrProps = useMemo(
    () => ({
      data: value,
      size,
      padding: 1,
      pieceBorderRadius: size / 44,
      color: CODE_FG,
      outerEyesOptions: {
        borderRadius: size / 12,
        color: CODE_FG,
      },
      innerEyesOptions: {
        borderRadius: size / 12,
        scale: 0.8,
        color: CODE_FG,
      },
      isPiecesGlued: true,
      style: {
        backgroundColor: CODE_BG,
      },
    }),
    [value, size],
  );

  return <QRCodeStyled {...qrProps} />;
}