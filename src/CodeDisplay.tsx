import { Component, type ReactNode, useMemo } from 'react';
import { PixelRatio, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import QRCodeStyled from 'react-native-qrcode-styled';

const CODE_BG = '#ffffff';
const CODE_FG = '#000000';

function appScale(): number {
  return PixelRatio.getFontScale();
}

function barcodeModuleWidth(value: string): number {
  return value.length > 10 ? 2 : 3;
}

type CodeDisplayProps = {
  value: string;
  labelColor?: string;
  captionColor?: string;
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

export function CodeDisplay({
  value,
  labelColor = '#1a1a1a',
  captionColor = '#000000',
}: CodeDisplayProps) {
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
      color: CODE_FG,
      outerEyesOptions: {
        borderRadius: qrSize / 12,
        color: CODE_FG,
      },
      innerEyesOptions: {
        borderRadius: qrSize / 12,
        scale: 0.8,
        color: CODE_FG,
      },
      isPiecesGlued: true,
      style: {
        maxHeight: qrSize,
        maxWidth: qrSize,
        backgroundColor: CODE_BG,
      },
    }),
    [value, qrSize],
  );

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: labelColor }]}>Kod paskowy (CODE128)</Text>
        <View style={styles.codeBox}>
          <CodeErrorBoundary label="Kod paskowy">
            <Barcode
              value={value}
              format="CODE128"
              height={barcodeHeight}
              width={barcodeWidth}
              lineColor={CODE_FG}
              background={CODE_BG}
              maxWidth={screenWidth - 80}
            />
          </CodeErrorBoundary>
        </View>
        <Text style={[styles.caption, { color: captionColor }]}>{value}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: labelColor }]}>Kod QR</Text>
        <View style={styles.codeBox}>
          <CodeErrorBoundary label="Kod QR">
            <QRCodeStyled {...qrProps} />
          </CodeErrorBoundary>
        </View>
        <Text style={[styles.caption, { color: captionColor }]}>{value}</Text>
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
  },
  codeBox: {
    backgroundColor: CODE_BG,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  caption: {
    fontSize: 16,
    letterSpacing: 2,
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
    textAlign: 'center',
    padding: 8,
  },
});