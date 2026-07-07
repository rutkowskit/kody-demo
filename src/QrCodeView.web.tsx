import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import QRCode from 'qrcode';

const CODE_BG = '#ffffff';
const CODE_FG = '#000000';

type QrCodeViewProps = {
  value: string;
  size: number;
};

export function QrCodeView({ value, size }: QrCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: CODE_FG, light: CODE_BG },
    })
      .then((url) => {
        if (mounted) setDataUrl(url);
      })
      .catch(() => {
        if (mounted) setDataUrl(null);
      });

    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <View style={{ width: size, height: size, backgroundColor: CODE_BG }} />;
  }

  return (
    <Image
      source={{ uri: dataUrl }}
      style={{ width: size, height: size, backgroundColor: CODE_BG }}
      accessibilityLabel={`Kod QR ${value}`}
    />
  );
}