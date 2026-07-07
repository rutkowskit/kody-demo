import { Component, type ReactNode, useMemo } from 'react';
import { PixelRatio, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import QRCodeStyled from 'react-native-qrcode-styled';

function appScale(): number {
  return PixelRatio.getFontScale();
}

function barcodeModuleWidth(value: string): number {
  return value.length > 10 ? 2 : 3;
}

type CodeDisplayProps = {
  value: string;
};

type ErrorBoundaryProps = {
  label: string;
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: string | null;
};

class CodeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <Text style={styles.error}>
          {this.props.label}: {this.state.error}
        </Text>
      );
    }
    return this.props.children;
  }
}

export function CodeDisplay({ value }: CodeDisplayProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const scale = appScale();

  const barcodeHeight = 118 * scale;
  const qrSize = Math.max(120, Math.min(screenHeight / 5, screenWidth - 48));
  const barcodeWidth = useMemo(() => barcodeModuleWidth(value), [value]);

  const qrProps = useMemo(
    () => ({
      data: value,
      padding: 1,
      pieceBorderRadius: qrSize / 44,
      pieceSize: qrSize / 20,
      color: '#000000',
      outerEyesOptions: {
        borderRadius: qrSize / 12,
        color: '#000000',
      },
      innerEyesOptions: {
        borderRadius: qrSize / 12,
        scale: 0.8,
        color: '#000000',
      },
      isPiecesGlued: true,
      style: {
        maxHeight: qrSize,
        maxWidth: qrSize,
        backgroundColor: '#ffffff',
      },
    }),
    [value, qrSize],
  );

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
        <Text style={styles.label}>Kod paskowy (CODE128)</Text>
        <View style={styles.barcodeBox}>
          <CodeErrorBoundary label="Kod paskowy">
            <Barcode
              value={value}
              format="CODE128"
              height={barcodeHeight}
              width={barcodeWidth}
              lineColor="#000000"
              background="#ffffff"
              maxWidth={screenWidth - 80}
            />
          </CodeErrorBoundary>
        </View>
        <Text style={styles.caption}>{value}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kod QR</Text>
        <View style={styles.qrBox}>
          <CodeErrorBoundary label="Kod QR">
            <QRCodeStyled {...qrProps} />
          </CodeErrorBoundary>
        </View>
        <Text style={styles.caption}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 24,
    width: '100%',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  barcodeBox: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  qrBox: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 16,
    color: '#000000',
    letterSpacing: 2,
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
    textAlign: 'center',
    padding: 8,
  },
});