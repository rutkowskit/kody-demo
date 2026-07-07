import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { THEME_OPTIONS } from './theme';

export function ThemeSwitch() {
  const { preference, colors, setPreference } = useTheme();

  return (
    <View style={styles.block}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Motyw aplikacji</Text>
      <View style={[styles.segment, { backgroundColor: colors.segmentBg }]}>
        {THEME_OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[
                styles.option,
                active && { backgroundColor: colors.segmentActiveBg },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.segmentText },
                  active && { color: colors.segmentActiveText, fontWeight: '600' },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
  },
});