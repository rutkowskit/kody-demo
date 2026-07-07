import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CodeDisplay } from './src/CodeDisplay';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { ThemeSwitch } from './src/ThemeSwitch';

const DEFAULT_CODE = '123456';

function sanitizeSixDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

function AppContent() {
  const { colors, resolved, isReady } = useTheme();
  const [rawInput, setRawInput] = useState(DEFAULT_CODE);

  const code = useMemo(() => sanitizeSixDigits(rawInput), [rawInput]);
  const isValid = code.length === 6;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        flex: {
          flex: 1,
        },
        scroll: {
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          alignItems: 'center',
          gap: 20,
        },
        title: {
          fontSize: 26,
          fontWeight: '700',
          color: colors.text,
        },
        subtitle: {
          fontSize: 14,
          color: colors.textMuted,
          textAlign: 'center',
          marginBottom: 4,
        },
        inputBlock: {
          width: '100%',
          gap: 8,
        },
        inputLabel: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        input: {
          width: '100%',
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 22,
          letterSpacing: 3,
          color: colors.inputText,
          textAlign: 'center',
        },
        hint: {
          fontSize: 15,
          color: colors.textMuted,
          textAlign: 'center',
          paddingHorizontal: 12,
        },
        loading: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        },
      }),
    [colors],
  );

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Kody demo</Text>
          <Text style={styles.subtitle}>Aplikacja mobilna — podgląd kodów karty</Text>

          <ThemeSwitch />

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Numer 6-cyfrowy</Text>
            <TextInput
              style={styles.input}
              value={rawInput}
              onChangeText={(text) => setRawInput(sanitizeSixDigits(text))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor={colors.placeholder}
              returnKeyType="done"
            />
          </View>

          {isValid ? (
            <CodeDisplay
              value={code}
              labelColor={colors.codeLabel}
              captionColor={colors.text}
            />
          ) : (
            <Text style={styles.hint}>Wpisz dokładnie 6 cyfr, aby wygenerować kody.</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}