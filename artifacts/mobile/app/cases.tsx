import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useListCases } from '@workspace/api-client-react';
import type { CaseSummary } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = useColors();
  const color =
    difficulty === 'HARD'
      ? colors.destructive
      : difficulty === 'MEDIUM'
        ? colors.primary
        : colors.success;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}22`, borderColor: `${color}55` },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{difficulty}</Text>
    </View>
  );
}

function CaseCard({
  item,
  onPress,
}: {
  item: CaseSummary;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={`case-card-${item.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: pressed ? colors.primary : colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.cardHeader}>
        <DifficultyBadge difficulty={item.difficulty} />
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${colors.primary}22`,
              borderColor: `${colors.primary}55`,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {item.chain.toUpperCase()}
          </Text>
        </View>
        <View style={styles.spacer} />
        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          {' '}
          {item.completedCount} solved
        </Text>
      </View>

      <Text
        style={[styles.cardTitle, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <Text
        style={[styles.cardDescription, { color: colors.mutedForeground }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.clueRow}>
          {Array.from({ length: item.totalClues }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.clueBar,
                {
                  backgroundColor:
                    i === 0 ? colors.primary : colors.secondary,
                },
              ]}
            />
          ))}
          <Text
            style={[styles.metaText, { color: colors.mutedForeground, marginLeft: 8 }]}
          >
            {item.totalClues} CLUES
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function CasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: cases, isLoading, isError, refetch, isRefetching } = useListCases();

  const handlePress = useCallback((id: number) => {
    router.push({ pathname: '/case/[id]', params: { id: id.toString() } });
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Ionicons name="search" size={16} color={colors.primary} />
          <Text style={[styles.appTitle, { color: colors.primary }]}>
            WALLET WITNESS
          </Text>
        </View>
        <Text style={[styles.appSub, { color: colors.mutedForeground }]}>
          BLOCKCHAIN INVESTIGATIONS
        </Text>
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            LOADING CASES...
          </Text>
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color={colors.destructive} />
          <Text style={[styles.statusText, { color: colors.destructive }]}>
            FAILED TO LOAD
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

      {/* List */}
      {cases && (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: botPad + 16,
          }}
          renderItem={({ item }) => (
            <CaseCard item={item} onPress={() => handlePress(item.id)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          scrollEnabled={!!cases && cases.length > 0}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons
                name="folder-open-outline"
                size={40}
                color={colors.mutedForeground}
              />
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                NO ACTIVE CASES
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 3,
  },
  appSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 3,
  },
  card: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  spacer: { flex: 1 },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clueBar: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
    minHeight: 200,
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
});
