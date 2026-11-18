import React from 'react';
import { View } from 'react-native';
import { Label, PremiumCard } from '../../components/ui';
import { isToday, localDate } from '../../domain/dates';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function WeeklyChart({ days }: { days: { date: string; count: number }[] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...days.map(day => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return <PremiumCard>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ gap: 2 }}>
        <Label size="subtitle" weight="bold">Seu ritmo nesta semana</Label>
        <Label muted size="micro">Tarefas concluídas por dia · segunda a domingo</Label>
      </View>
      <Label size="subtitle" weight="bold" style={{ color: colors.primary }}>{total}</Label>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: tokens.space.sm, minHeight: 126 }}>
      {days.map(day => {
        const height = Math.max(6, day.count / max * 92);
        const today = isToday(day.date);
        return <View key={day.date} accessible accessibilityLabel={`${day.date}: ${day.count} tarefas concluídas`}
          style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <Label size="micro" muted={!day.count} weight={day.count ? 'semibold' : 'regular'}>{day.count}</Label>
          <View style={{ height: 96, width: '100%', maxWidth: 34, justifyContent: 'flex-end' }}>
            <View style={{ height, backgroundColor: day.count ? colors.primary : colors.surfaceSecondary,
              borderRadius: tokens.radius.xs, opacity: today ? 1 : day.count ? 0.85 : 1,
              borderWidth: today ? 2 : 0, borderColor: today ? colors.primaryHover : 'transparent' }} />
          </View>
          <Label size="micro" muted={!today} weight={today ? 'bold' : 'regular'}
            style={{ color: today ? colors.primary : undefined }}>
            {localDate(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3)}
          </Label>
        </View>;
      })}
    </View>
  </PremiumCard>;
}
