import { useMemo, useState } from 'react';
import {
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

const DEFAULT_CODE = '123456';

function sanitizeSixDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

export default function App() {
  const [rawInput, setRawInput] = useState(DEFAULT_CODE);

  const code = useMemo(() => sanitizeSixDigits(rawInput), [rawInput]);
  const isValid = code.length === 6;

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
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

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Numer 6-cyfrowy</Text>
            <TextInput
              style={styles.input}
              value={rawInput}
              onChangeText={(text) => setRawInput(sanitizeSixDigits(text))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
            />
          </View>

          {isValid ? (
            <CodeDisplay value={code} />
          ) : (
            <Text style={styles.hint}>Wpisz dokładnie 6 cyfr, aby wygenerować kody.</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  inputBlock: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 3,
    color: '#111827',
    textAlign: 'center',
  },
  hint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});