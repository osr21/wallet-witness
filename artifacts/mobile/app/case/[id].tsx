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
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCaseQueryKey,
  useGetCase,
  useUnlockClue,
} from '@workspace/api-client-react';
import type { ClueData } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSession } from '@/contexts/SessionContext';

/** Recursively format a clue data value for display */
function fmtValue(val: unknown, depth = 0): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') {
    const abs = Math.abs(val);
    if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${(val / 1_000).toFixed(2)}K`;
    return Number.isInteger(val) ? val.toString() : val.toFixed(4);
  }
  if (typeof val === 'string') {
    if (val.startsWith('0x') && val.length > 12)
      return `${val.slice(0, 6)}…${val.slice(-4)}`;
    return val.length > 60 ? val.slice(0, 57) + '…' : val;
  }
  if (Array.isArray(val)) {
    if (depth > 0) return `[${val.length} items]`;
    return val
      .slice(0, 2)
      .map((v) => fmtValue(v, depth + 1))
      .join(', ') + (val.length > 2 ? ` +${val.length - 2}` : '');
  }
  if (typeof val === 'object' && depth === 0) {
    const entries = Object.entries(val as Record<string, unknown>).slice(0, 4);
    return entries.map(([k, v]) => `${k}: ${fmtValue(v, 1)}`).join(' · ');
  }
  return String(val).slice(0, 50);
}

function ClueCard({ clue }: { clue: ClueData }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const dataEntries = clue.data
    ? Object.entries(clue.data as Record<string, unknown>).slice(0, 8)
    : [];

  return (
    <View style={[styles.clueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={styles.clueHeader}
        onPress={() => setExpanded((e) => !e)}
      >
        <View
          style={[styles.clueIndexBadge, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.clueIndexText, { color: colors.primaryForeground }]}>
            {clue.clueIndex + 1}
          </Text>
        </View>
        <View style={styles.clueHeaderText}>
          <Text style={[styles.clueType, { color: colors.mutedForeground }]}>
            {clue.clueType.toUpperCase().replace(/_/g, ' ')}
          </Text>
          <Text style={[styles.clueTitle, { color: colors.foreground }]}>
            {clue.title}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.mutedForeground}
        />
      </Pressable>

      {expanded && (
        <View style={styles.clueBody}>
          <Text style={[styles.clueHint, { color: colors.mutedForeground }]}>
            {clue.hint}
          </Text>
          {dataEntries.length > 0 && (
            <View
              style={[styles.dataBlock, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              {dataEntries.map(([key, val]) => (
                <View key={key} style={styles.dataRow}>
                  <Text style={[styles.dataKey, { color: colors.mutedForeground }]}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.dataVal, { color: colors.foreground }]}>
                    {fmtValue(val)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = parseInt(id ?? '0', 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessionId, isReady } = useSession();
  const queryClient = useQueryClient();

  const { data: caseDetail, isLoading, isError, refetch } = useGetCase(caseId);

  const unlockMutation = useUnlockClue({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    },
  });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const unlockedClues = caseDetail?.unlockedClues ?? [];
  const totalClues = caseDetail?.totalClues ?? 0;
  const nextClueIndex = unlockedClues.length;
  const allUnlocked = nextClueIndex >= totalClues;

  function handleUnlockClue() {
    if (!isReady || !sessionId || allUnlocked || unlockMutation.isPending) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    unlockMutation.mutate({
      id: caseId,
      data: { clueIndex: nextClueIndex, sessionId },
    });
  }

  function handleSubmitVerdict() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/verdict/[id]',
      params: {
        id: caseId.toString(),
        cluesUnlocked: unlockedClues.length.toString(),
      },
    });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {caseDetail?.title ?? 'INVESTIGATION'}
        </Text>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            LOADING CASE...
          </Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color={colors.destructive} />
          <Text style={[styles.statusText, { color: colors.destructive }]}>
            FAILED TO LOAD CASE
          </Text>
          <Pressable
            style={[styles.retryBtn, { borderColor: colors.border }]}
            onPress={() => void refetch()}
          >
            <Text style={[styles.retryTxt, { color: colors.foreground }]}>
              RETRY
            </Text>
          </Pressable>
        </View>
      )}

      {caseDetail && (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: botPad + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Case meta */}
          <View
            style={[styles.metaBlock, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>
              SUSPECT WALLET
            </Text>
            <Text style={[styles.walletAddr, { color: colors.primary }]}>
              {caseDetail.walletAddressMasked}
            </Text>
            <Text style={[styles.narrative, { color: colors.mutedForeground }]}>
              {caseDetail.narrative}
            </Text>
          </View>

          {/* Clue progress */}
          <View style={styles.progressSection}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              EVIDENCE BOARD
            </Text>
            <Text style={[styles.clueCount, { color: colors.primary }]}>
              {unlockedClues.length} / {totalClues}
            </Text>
          </View>
          <View style={styles.progressBar}>
            {Array.from({ length: totalClues }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor:
                      i < unlockedClues.length
                        ? colors.primary
                        : colors.secondary,
                  },
                ]}
              />
            ))}
          </View>

          {/* Revealed clues */}
          {unlockedClues.length === 0 && (
            <View
              style={[
                styles.noCluesBox,
                { borderColor: colors.border, backgroundColor: colors.muted },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={28} color={colors.mutedForeground} />
              <Text style={[styles.noCluesText, { color: colors.mutedForeground }]}>
                No evidence revealed yet. Unlock your first clue to begin.
              </Text>
            </View>
          )}

          {unlockedClues.map((clue) => (
            <ClueCard key={clue.clueIndex} clue={clue} />
          ))}

          {unlockMutation.isError && (
            <View
              style={[styles.errorBanner, { backgroundColor: `${colors.destructive}22`, borderColor: colors.destructive }]}
            >
              <Text style={[styles.errorBannerText, { color: colors.destructive }]}>
                Failed to unlock clue. Please try again.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Action buttons — fixed at bottom */}
      {caseDetail && (
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
          {!allUnlocked && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: unlockMutation.isPending
                    ? colors.secondary
                    : colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={handleUnlockClue}
              disabled={unlockMutation.isPending || !isReady}
              testID="unlock-clue-btn"
            >
              {unlockMutation.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <>
                  <Ionicons name="key-outline" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                    UNLOCK CLUE {nextClueIndex + 1}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleSubmitVerdict}
            testID="submit-verdict-btn"
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.foreground} />
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
              SUBMIT VERDICT
            </Text>
          </Pressable>
        </View>
      )}
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
    fontSize: 15,
    letterSpacing: 1,
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 2,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
  retryTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  metaBlock: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  walletLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  walletAddr: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  narrative: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
  },
  clueCount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  noCluesBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  noCluesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  clueCard: {
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  clueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  clueIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clueIndexText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  clueHeaderText: { flex: 1 },
  clueType: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  clueTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  clueBody: { paddingHorizontal: 14, paddingBottom: 14 },
  clueHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  dataBlock: {
    borderRadius: 3,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dataKey: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    flex: 1,
  },
  dataVal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  errorBanner: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  errorBannerText: {
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
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 4,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 4,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
