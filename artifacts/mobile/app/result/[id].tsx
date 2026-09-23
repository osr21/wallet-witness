import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { VerdictResult } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function ResultScreen() {
  const { resultData } = useLocalSearchParams<{
    id: string;
    resultData: string;
  }>();

  const colors = useColors();
  const insets = useSafeAreaInsets();

  let result: VerdictResult | null = null;
  try {
    if (resultData) result = JSON.parse(resultData) as VerdictResult;
  } catch {
    // handle below
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Animated score counter
  const [displayScore, setDisplayScore] = useState(0);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!result) return;
    const listener = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    Animated.timing(scoreAnim, {
      toValue: result.score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    return () => scoreAnim.removeListener(listener);
  }, [result?.score]);

  if (!result) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/cases')}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>RESULT</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color={colors.destructive} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Could not load result
          </Text>
        </View>
      </View>
    );
  }

  const breakdown = result.breakdown as Record<string, unknown>;
  const breakdownEntries = breakdown ? Object.entries(breakdown) : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.replace('/cases')}
          hitSlop={12}
        >
          <Ionicons name="close" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          INVESTIGATION COMPLETE
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: botPad + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero result block */}
        <View
          style={[
            styles.heroBlock,
            {
              backgroundColor: result.isCorrect
                ? `${colors.success}12`
                : `${colors.destructive}12`,
              borderColor: result.isCorrect
                ? colors.success
                : colors.destructive,
            },
          ]}
        >
          <View style={styles.resultIcon}>
            <Ionicons
              name={result.isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={52}
              color={result.isCorrect ? colors.success : colors.destructive}
            />
          </View>
          <Text
            style={[
              styles.resultLabel,
              {
                color: result.isCorrect ? colors.success : colors.destructive,
              },
            ]}
          >
            {result.isCorrect ? 'CORRECT!' : 'WRONG!'}
          </Text>

          {/* Animated score counter */}
          <Text style={[styles.scoreNumber, { color: colors.primary }]}>
            {displayScore.toLocaleString()}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            POINTS
          </Text>
        </View>

        {/* Verdict */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            CORRECT WALLET TYPE
          </Text>
          <View
            style={[styles.verdictBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.verdictType, { color: colors.primary }]}>
              {result.correctTypeLabel.toUpperCase()}
            </Text>
            {!result.isCorrect && (
              <Text style={[styles.verdictYours, { color: colors.mutedForeground }]}>
                Verdict incorrect — study the clues next time.
              </Text>
            )}
          </View>
        </View>

        {/* Explanation */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            CASE BREAKDOWN
          </Text>
          <View
            style={[styles.explanationBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.explanationText, { color: colors.foreground }]}>
              {result.explanation}
            </Text>
          </View>
        </View>

        {/* Wallet revealed */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            WALLET REVEALED
          </Text>
          <View
            style={[styles.walletBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.walletAddr, { color: colors.primary }]}>
              {result.walletAddress}
            </Text>
          </View>
        </View>

        {/* Score breakdown */}
        {breakdownEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              SCORE BREAKDOWN
            </Text>
            <View
              style={[styles.breakdownBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {breakdownEntries.map(([key, value]) => (
                <View key={key} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownKey, { color: colors.mutedForeground }]}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.breakdownVal, { color: colors.foreground }]}>
                    {typeof value === 'number' ? `+${value}` : String(value)}
                  </Text>
                </View>
              ))}
              <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownKey, { color: colors.foreground }]}>
                  TOTAL
                </Text>
                <Text style={[styles.breakdownTotal, { color: colors.primary }]}>
                  {result.score}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 12,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.newCaseBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/cases');
          }}
          testID="new-case-btn"
        >
          <Ionicons name="search" size={16} color={colors.primaryForeground} />
          <Text style={[styles.newCaseTxt, { color: colors.primaryForeground }]}>
            INVESTIGATE ANOTHER CASE
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 2,
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  statusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  heroBlock: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  resultIcon: {},
  resultLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: 3,
  },
  scoreNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  verdictBox: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
  },
  verdictType: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  verdictYours: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  explanationBox: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  walletBox: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
  },
  walletAddr: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  breakdownBox: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownKey: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  breakdownVal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  breakdownTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  breakdownDivider: {
    height: 1,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  newCaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 4,
  },
  newCaseTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
