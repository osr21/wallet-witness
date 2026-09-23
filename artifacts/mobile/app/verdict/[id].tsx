import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useSubmitVerdict } from '@workspace/api-client-react';
import type { VerdictInput } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/contexts/SessionContext';

type WalletType = VerdictInput['walletType'];

interface VerdictOption {
  type: WalletType;
  label: string;
  description: string;
  icon: string;
}

const VERDICT_OPTIONS: VerdictOption[] = [
  {
    type: 'smart_money',
    label: 'SMART MONEY',
    description: 'Sophisticated trader with consistent alpha and early positioning.',
    icon: 'trending-up',
  },
  {
    type: 'whale',
    label: 'WHALE',
    description: 'High-value holder commanding massive positions in the market.',
    icon: 'water',
  },
  {
    type: 'retail',
    label: 'RETAIL TRADER',
    description: 'Individual investor with typical buy-high, sell-low patterns.',
    icon: 'person',
  },
  {
    type: 'insider',
    label: 'INSIDER',
    description: 'Connected wallet acting on privileged information before announcements.',
    icon: 'eye',
  },
];

const CONFIDENCE_PRESETS = [25, 50, 75, 95];

export default function VerdictScreen() {
  const { id, cluesUnlocked } = useLocalSearchParams<{
    id: string;
    cluesUnlocked: string;
  }>();
  const caseId = parseInt(id ?? '0', 10);
  const cluesUsed = parseInt(cluesUnlocked ?? '0', 10);

  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessionId, isReady } = useSession();

  const [selected, setSelected] = useState<WalletType | null>(null);
  const [confidence, setConfidence] = useState(70);

  const submitMutation = useSubmitVerdict();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  function adjustConfidence(delta: number) {
    void Haptics.selectionAsync();
    setConfidence((prev) => Math.max(1, Math.min(100, prev + delta)));
  }

  function handleSubmit() {
    if (!selected || !isReady || submitMutation.isPending) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    submitMutation.mutate(
      {
        id: caseId,
        data: {
          walletType: selected,
          confidence,
          sessionId,
          cluesUnlocked: cluesUsed,
        },
      },
      {
        onSuccess: (result) => {
          void Haptics.notificationAsync(
            result.isCorrect
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error,
          );
          router.replace({
            pathname: '/result/[id]',
            params: {
              id: caseId.toString(),
              resultData: JSON.stringify(result),
            },
          });
        },
        onError: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      },
    );
  }

  const canSubmit = !!selected && isReady && !submitMutation.isPending;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          SUBMIT VERDICT
        </Text>
        <View style={styles.cluesBadge}>
          <Text style={[styles.cluesBadgeText, { color: colors.mutedForeground }]}>
            {cluesUsed} clues used
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: botPad + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          IDENTIFY THE WALLET TYPE
        </Text>

        {/* Verdict options */}
        {VERDICT_OPTIONS.map((option) => {
          const isSelected = selected === option.type;
          return (
            <Pressable
              key={option.type}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: isSelected ? `${colors.primary}18` : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelected(option.type);
              }}
              testID={`verdict-option-${option.type}`}
            >
              <View
                style={[
                  styles.radioCircle,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[styles.radioDot, { backgroundColor: colors.primaryForeground }]}
                  />
                )}
              </View>
              <Ionicons
                name={option.icon as 'trending-up'}
                size={20}
                color={isSelected ? colors.primary : colors.mutedForeground}
              />
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: isSelected ? colors.primary : colors.foreground },
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Confidence */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
          CONFIDENCE LEVEL
        </Text>

        <View
          style={[
            styles.confidenceCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.confidenceDisplay}>
            <Text style={[styles.confidenceNumber, { color: colors.primary }]}>
              {confidence}%
            </Text>
            <Text style={[styles.confidenceLabel, { color: colors.mutedForeground }]}>
              {confidence < 40
                ? 'UNCERTAIN'
                : confidence < 65
                  ? 'MODERATE'
                  : confidence < 85
                    ? 'CONFIDENT'
                    : 'VERY CONFIDENT'}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={[styles.confTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.confFill,
                {
                  width: `${confidence}%` as `${number}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            {CONFIDENCE_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor:
                      confidence === preset ? colors.primary : colors.secondary,
                    borderColor:
                      confidence === preset ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setConfidence(preset);
                }}
              >
                <Text
                  style={[
                    styles.presetTxt,
                    {
                      color:
                        confidence === preset
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {preset}%
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fine-tune */}
          <View style={styles.fineRow}>
            <Pressable
              style={[styles.fineBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => adjustConfidence(-5)}
            >
              <Text style={[styles.fineBtnTxt, { color: colors.foreground }]}>−5</Text>
            </Pressable>
            <Pressable
              style={[styles.fineBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => adjustConfidence(-1)}
            >
              <Text style={[styles.fineBtnTxt, { color: colors.foreground }]}>−1</Text>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              style={[styles.fineBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => adjustConfidence(1)}
            >
              <Text style={[styles.fineBtnTxt, { color: colors.foreground }]}>+1</Text>
            </Pressable>
            <Pressable
              style={[styles.fineBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => adjustConfidence(5)}
            >
              <Text style={[styles.fineBtnTxt, { color: colors.foreground }]}>+5</Text>
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {submitMutation.isError && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: `${colors.destructive}22`, borderColor: colors.destructive },
            ]}
          >
            <Text style={[styles.errorTxt, { color: colors.destructive }]}>
              Failed to submit verdict. Please try again.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit button */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 12 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.secondary,
              opacity: pressed && canSubmit ? 0.85 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          testID="submit-verdict-confirm-btn"
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={canSubmit ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.submitTxt,
                  {
                    color: canSubmit
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {!selected ? 'SELECT A VERDICT FIRST' : 'SUBMIT VERDICT'}
              </Text>
            </>
          )}
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
    fontSize: 14,
    letterSpacing: 2,
    flex: 1,
  },
  cluesBadge: {},
  cluesBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: { flex: 1 },
  optionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  optionDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  confidenceCard: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  confidenceDisplay: {
    alignItems: 'center',
  },
  confidenceNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    letterSpacing: -1,
  },
  confidenceLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  confTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confFill: {
    height: '100%',
    borderRadius: 3,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  fineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1,
  },
  fineBtnTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  errorBanner: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  errorTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 4,
  },
  submitTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
