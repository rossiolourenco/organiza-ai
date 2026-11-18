import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import Svg, { Circle } from 'react-native-svg';
import { tokens, useTheme, type ThemeColors } from '../theme/ThemeProvider';
import { dayKey, formatDate, localDate, monthDays, validDate } from '../domain/dates';
import { priorities, Priority, Status, statuses } from '../types/models';

type Icon = React.ComponentProps<typeof Feather>['name'];
type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'neutral';

function toneColors(colors: ThemeColors, tone: Tone) {
  if (tone === 'success') return { fg: colors.success, bg: colors.successSoft };
  if (tone === 'warning') return { fg: colors.warning, bg: colors.warningSoft };
  if (tone === 'danger') return { fg: colors.danger, bg: colors.dangerSoft };
  if (tone === 'muted') return { fg: colors.muted, bg: colors.surfaceSecondary };
  if (tone === 'neutral') return { fg: colors.text, bg: colors.surfaceSecondary };
  return { fg: colors.primary, bg: colors.primarySoft };
}

/* ---------------------------------- texto --------------------------------- */

export function Label({ children, muted = false, size = 'body', weight, style, numberOfLines }: React.PropsWithChildren<{
  muted?: boolean; size?: keyof typeof tokens.font; weight?: keyof typeof tokens.weight;
  style?: React.ComponentProps<typeof Text>['style']; numberOfLines?: number;
}>) {
  const { colors } = useTheme();
  const header = size === 'display' || size === 'heading' || size === 'title';
  return <Text numberOfLines={numberOfLines}
    accessibilityRole={header ? 'header' : undefined}
    style={[{ color: muted ? colors.muted : colors.text, fontSize: tokens.font[size],
      lineHeight: Math.round(tokens.font[size] * (header ? 1.24 : tokens.lineHeight)),
      fontWeight: weight ? tokens.weight[weight] : header ? tokens.weight.bold : tokens.weight.regular }, style]}>
    {children}
  </Text>;
}

export function Row({ children, style }: React.PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border, width: '100%' }, style]} />;
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <View style={{ flex: 1, gap: 2, minWidth: 160 }}>
      <Label size="title">{title}</Label>
      {subtitle ? <Label muted size="caption">{subtitle}</Label> : null}
    </View>
    {action}
  </Row>;
}

/* ---------------------------------- cards --------------------------------- */

export function PremiumCard({ children, style, tone, onPress, accessibilityLabel }: React.PropsWithChildren<{
  style?: ViewStyle; tone?: Tone; onPress?: () => void; accessibilityLabel?: string;
}>) {
  const { colors, dark } = useTheme();
  const palette = tone ? toneColors(colors, tone) : null;
  const content = <View style={[styles.card, {
    backgroundColor: palette ? palette.bg : colors.surface,
    borderColor: palette ? `${palette.fg}33` : colors.border,
    shadowColor: colors.shadow,
    ...(dark ? { shadowOpacity: 0 } : {}),
  }, style]}>{children}</View>;
  if (!onPress) return content;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>{content}</Pressable>;
}
export const Card = PremiumCard;

export function MetricCard({ value, label, icon, tone = 'primary', hint, style, onPress }: {
  value: string | number; label: string; icon?: Icon; tone?: Tone; hint?: string;
  style?: ViewStyle; onPress?: () => void;
}) {
  const { colors } = useTheme();
  const palette = toneColors(colors, tone);
  const body = <>
    <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: palette.bg,
      alignItems: 'center', justifyContent: 'center' }}>
      {icon ? <Feather name={icon} size={17} color={palette.fg} /> : null}
    </View>
    <Label size="heading" style={{ fontVariant: ['tabular-nums'] }}>{value}</Label>
    <Label muted size="caption">{label}</Label>
    {hint ? <Label size="micro" style={{ color: palette.fg }}>{hint}</Label> : null}
  </>;
  return <View style={[{ flex: 1, minWidth: 130 }, style]}>
    {onPress ? <PremiumCard onPress={onPress} accessibilityLabel={`${label}: ${value}`} style={{ gap: tokens.space.sm }}>
      {body}</PremiumCard> : <PremiumCard style={{ gap: tokens.space.sm }}>{body}</PremiumCard>}
  </View>;
}
export const Stat = MetricCard;

export function ProgressRing({ size = 132, stroke = 11, value, label, children }: {
  size?: number; stroke?: number; value: number; label: string; children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const percent = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
    style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={stroke} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.primary} strokeWidth={stroke} fill="none"
        strokeDasharray={`${circumference}`} strokeDashoffset={circumference * (1 - percent / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
    <View style={{ alignItems: 'center', gap: 2 }}>{children}</View>
  </View>;
}

export function Progress({ value, label, tone = 'primary', height = 8 }: {
  value: number; label: string; tone?: Tone; height?: number;
}) {
  const { colors } = useTheme();
  const percent = Math.max(0, Math.min(100, value));
  const palette = toneColors(colors, tone);
  return <View accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
    style={{ height, backgroundColor: colors.surfaceSecondary, borderRadius: tokens.radius.pill, overflow: 'hidden' }}>
    <View style={{ width: `${percent}%`, height: '100%', backgroundColor: palette.fg,
      borderRadius: tokens.radius.pill }} />
  </View>;
}

/* --------------------------------- botões --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export function Button({ title, onPress, icon, variant = 'primary', disabled = false, loading = false, compact = false, style }: {
  title: string; onPress: () => void; icon?: Icon; variant?: ButtonVariant; disabled?: boolean;
  loading?: boolean; compact?: boolean; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const palette = variant === 'primary' ? { fg: colors.onPrimary, bg: colors.primary }
    : variant === 'danger' ? { fg: colors.onPrimary, bg: colors.danger }
      : variant === 'soft' ? { fg: colors.primary, bg: colors.primarySoft }
        : variant === 'ghost' ? { fg: colors.primary, bg: 'transparent' }
          : { fg: colors.text, bg: colors.surfaceSecondary };
  return <Pressable accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [styles.button, compact && { minHeight: 40, paddingVertical: tokens.space.sm },
      { backgroundColor: palette.bg, opacity: disabled || loading ? 0.5 : pressed ? 0.78 : 1,
        ...(variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border } : {}) }, style]}>
    {loading ? <ActivityIndicator color={palette.fg} /> : icon ? <Feather accessible={false} name={icon} size={17} color={palette.fg} /> : null}
    <Text style={{ color: palette.fg, fontWeight: tokens.weight.semibold, fontSize: tokens.font.body }}>{title}</Text>
  </Pressable>;
}

export function IconButton({ icon, label, onPress, tone = 'neutral', disabled = false }: {
  icon: Icon; label: string; onPress: () => void; tone?: Tone; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const palette = toneColors(colors, tone);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.bg, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
    <Feather name={icon} size={19} color={palette.fg} />
  </Pressable>;
}

export function FilterChip({ title, selected, onPress, icon }: {
  title: string; selected: boolean; onPress: () => void; icon?: Icon;
}) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ selected }} onPress={onPress}
    style={({ pressed }) => [styles.chip, { borderColor: selected ? colors.primary : colors.border,
      backgroundColor: selected ? colors.primarySoft : colors.surface, opacity: pressed ? 0.8 : 1 }]}>
    {icon ? <Feather name={icon} size={14} color={selected ? colors.primary : colors.muted} /> : null}
    <Text style={{ color: selected ? colors.primary : colors.muted, fontWeight: tokens.weight.semibold, fontSize: 13 }}>{title}</Text>
  </Pressable>;
}
export const Chip = FilterChip;

export function Choices<T extends string>({ value, onChange, options }: {
  value: T; onChange: (value: T) => void; options: { value: T; label: string; icon?: Icon }[];
}) {
  return <Row>{options.map(option => <FilterChip key={option.value} title={option.label} icon={option.icon}
    selected={option.value === value} onPress={() => onChange(option.value)} />)}</Row>;
}

export function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (value: T) => void; options: { value: T; label: string; icon?: Icon }[];
}) {
  const { colors } = useTheme();
  return <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary,
    borderRadius: tokens.radius.md, padding: 4, gap: 4 }}>
    {options.map(option => {
      const selected = option.value === value;
      return <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected }}
        accessibilityLabel={option.label} onPress={() => onChange(option.value)}
        style={{ flex: 1, minHeight: 42, borderRadius: tokens.radius.sm, alignItems: 'center', justifyContent: 'center',
          flexDirection: 'row', gap: 6, backgroundColor: selected ? colors.surface : 'transparent',
          ...(selected ? { shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {}) }}>
        {option.icon ? <Feather name={option.icon} size={15} color={selected ? colors.primary : colors.muted} /> : null}
        <Text style={{ fontSize: 13, fontWeight: selected ? tokens.weight.bold : tokens.weight.medium,
          color: selected ? colors.primary : colors.muted }} numberOfLines={1}>{option.label}</Text>
      </Pressable>;
    })}
  </View>;
}

export function QuickAction({ icon, label, onPress, tone = 'primary' }: {
  icon: Icon; label: string; onPress: () => void; tone?: Tone;
}) {
  const { colors } = useTheme();
  const palette = toneColors(colors, tone);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [{ flex: 1, minWidth: 76, alignItems: 'center', gap: 6, paddingVertical: tokens.space.sm,
      opacity: pressed ? 0.72 : 1 }]}>
    <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: palette.bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={19} color={palette.fg} />
    </View>
    <Text style={{ fontSize: tokens.font.micro, fontWeight: tokens.weight.semibold, color: colors.muted,
      textAlign: 'center' }} numberOfLines={1}>{label}</Text>
  </Pressable>;
}

export function FloatingActionButton({ icon = 'plus', label, onPress, bottom = 24 }: {
  icon?: Icon; label: string; onPress: () => void; bottom?: number;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [{ position: 'absolute', right: tokens.space.lg, bottom: bottom + insets.bottom,
      minHeight: 52, paddingHorizontal: 18, borderRadius: tokens.radius.pill, backgroundColor: colors.primary,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      shadowColor: colors.primary, shadowOpacity: 0.32, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
      elevation: 6, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
    <Feather name={icon} size={20} color={colors.onPrimary} />
    <Text style={{ color: colors.onPrimary, fontWeight: tokens.weight.bold, fontSize: tokens.font.body }}>{label}</Text>
  </Pressable>;
}

/* --------------------------------- inputs --------------------------------- */

export function Input({ label, hint, error, ...props }: TextInputProps & { label: string; hint?: string; error?: string | null }) {
  const { colors } = useTheme();
  return <View style={{ gap: 6 }}>
    <Label size="caption" weight="semibold" style={{ color: colors.muted }}>{label}</Label>
    <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted}
      {...props} style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary,
        borderColor: error ? colors.danger : colors.border },
        props.multiline && { minHeight: 96, textAlignVertical: 'top' }, props.style]} />
    {error ? <Text style={{ color: colors.danger, fontSize: tokens.font.caption }}>{error}</Text> : null}
    {hint ? <Text style={{ color: colors.muted, fontSize: tokens.font.micro }}>{hint}</Text> : null}
  </View>;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar', onSubmit }: {
  value: string; onChangeText: (value: string) => void; placeholder?: string; onSubmit?: () => void;
}) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    borderRadius: tokens.radius.md, paddingHorizontal: 14 }}>
    <Feather name="search" size={18} color={colors.muted} />
    <TextInput accessibilityLabel={placeholder} value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor={colors.muted} onSubmitEditing={onSubmit}
      returnKeyType="search" style={{ flex: 1, color: colors.text, fontSize: tokens.font.body, paddingVertical: 10 }} />
    {value ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onChangeText('')}
      style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="x" size={16} color={colors.muted} />
    </Pressable> : null}
  </View>;
}

export function ToggleRow({ label, description, value, onChange, disabled }: {
  label: string; description?: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean;
}) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value, disabled }}
    disabled={disabled} onPress={() => onChange(!value)}
    style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, minHeight: 48 }}>
    <View style={{ flex: 1, gap: 2 }}>
      <Label weight="semibold">{label}</Label>
      {description ? <Label muted size="caption">{description}</Label> : null}
    </View>
    <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3,
      backgroundColor: value ? colors.primary : colors.border, alignItems: value ? 'flex-end' : 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface }} />
    </View>
  </Pressable>;
}

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  return <Choices value={preference} onChange={value => { void setPreference(value).catch(() => undefined); }}
    options={[{ value: 'system', label: 'Sistema', icon: 'smartphone' }, { value: 'light', label: 'Claro', icon: 'sun' },
      { value: 'dark', label: 'Escuro', icon: 'moon' }]} />;
}

/* --------------------------------- badges --------------------------------- */

export function Badge({ title, tone = 'primary', icon }: { title: string; tone?: Tone; icon?: Icon }) {
  const { colors } = useTheme();
  const palette = toneColors(colors, tone);
  return <View style={{ backgroundColor: palette.bg, borderRadius: tokens.radius.pill,
    paddingVertical: 4, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    {icon ? <Feather name={icon} size={11} color={palette.fg} /> : null}
    <Text style={{ color: palette.fg, fontSize: tokens.font.micro, fontWeight: tokens.weight.bold }}>{title}</Text>
  </View>;
}

export function StatusBadge({ status }: { status: Status }) {
  const tone: Tone = status === 'CONCLUIDA' ? 'success' : status === 'EM_ANDAMENTO' ? 'warning' : 'neutral';
  return <Badge title={statuses[status]} tone={tone} />;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone: Tone = priority === 'ALTA' ? 'danger' : priority === 'MEDIA' ? 'warning' : 'primary';
  return <Badge title={priorities[priority]} tone={tone} />;
}

/* ------------------------------ estados vazios ---------------------------- */

export function EmptyState({ title = 'Tudo começa com um pequeno passo', detail = 'Crie sua primeira tarefa e dê espaço ao que importa.',
  icon = 'check-circle', action }: { title?: string; detail?: string; icon?: Icon; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return <PremiumCard style={{ alignItems: 'center', paddingVertical: tokens.space.xxl, gap: tokens.space.sm }}>
    <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={24} color={colors.primary} />
    </View>
    <Label size="subtitle" style={{ textAlign: 'center' }}>{title}</Label>
    <Label muted size="caption" style={{ textAlign: 'center', maxWidth: 320 }}>{detail}</Label>
    {action}
  </PremiumCard>;
}
export const Empty = EmptyState;

export function ErrorState({ message, retry }: { message: string | null; retry?: () => void }) {
  const { colors } = useTheme();
  if (!message) return null;
  return <View accessibilityRole="alert" style={{ gap: tokens.space.sm, padding: tokens.space.md,
    borderRadius: tokens.radius.md, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: `${colors.danger}33` }}>
    <Row style={{ flexWrap: 'nowrap' }}>
      <Feather name="alert-triangle" size={16} color={colors.danger} />
      <Text style={{ color: colors.danger, flex: 1, fontSize: tokens.font.caption, lineHeight: 19 }}>{message}</Text>
    </Row>
    {retry && <Button title="Tentar novamente" icon="refresh-cw" variant="secondary" compact onPress={retry} />}
  </View>;
}
export const ErrorNotice = ErrorState;

export function LoadingSkeleton({ rows = 3, label = 'Carregando' }: { rows?: number; label?: string }) {
  const { colors } = useTheme();
  return <View accessibilityLabel={label} accessibilityRole="progressbar" style={{ gap: tokens.space.md }}>
    <Row style={{ flexWrap: 'nowrap' }}><ActivityIndicator color={colors.primary} /><Label muted size="caption">{label}…</Label></Row>
    {Array.from({ length: rows }, (_, index) => <View key={index} style={{ gap: 8, padding: tokens.space.md,
      borderRadius: tokens.radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      <View style={{ height: 12, width: `${62 - index * 8}%`, borderRadius: 6, backgroundColor: colors.skeleton }} />
      <View style={{ height: 10, width: '38%', borderRadius: 5, backgroundColor: colors.skeleton }} />
    </View>)}
  </View>;
}
export const Loading = LoadingSkeleton;

export function SmartSuggestionCard({ title, detail, meta, onAccept, onDismiss, acceptLabel = 'Aceitar', accepted = false }: {
  title: string; detail: string; meta?: string; onAccept?: () => void; onDismiss?: () => void;
  acceptLabel?: string; accepted?: boolean;
}) {
  const { colors } = useTheme();
  return <PremiumCard tone="primary" style={{ gap: tokens.space.sm }}>
    <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
      <Row style={{ flexWrap: 'nowrap', flex: 1 }}>
        <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: colors.primary,
          alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="zap" size={15} color={colors.onPrimary} />
        </View>
        <Label weight="bold" style={{ flex: 1 }}>{title}</Label>
      </Row>
      {accepted ? <Badge title="No plano" tone="success" icon="check" /> : null}
    </Row>
    <Label muted size="caption">{detail}</Label>
    {meta ? <Label size="micro" style={{ color: colors.primary }}>{meta}</Label> : null}
    {(onAccept || onDismiss) && <Row>
      {onAccept ? <Button title={acceptLabel} icon="plus" compact variant={accepted ? 'secondary' : 'primary'} onPress={onAccept} /> : null}
      {onDismiss && !accepted ? <Button title="Ignorar" compact variant="ghost" onPress={onDismiss} /> : null}
    </Row>}
  </PremiumCard>;
}

/* -------------------------------- overlays -------------------------------- */

export function AppBottomSheet({ visible, title, children, onClose, subtitle }: React.PropsWithChildren<{
  visible: boolean; title: string; onClose: () => void; subtitle?: string;
}>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar painel" onPress={onClose} style={{ flex: 1 }} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface,
        borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, maxHeight: '92%' }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
          alignSelf: 'center', marginTop: 10 }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
          paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.md, gap: tokens.space.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Label size="subtitle" weight="bold">{title}</Label>
            {subtitle ? <Label muted size="caption">{subtitle}</Label> : null}
          </View>
          <IconButton icon="x" label="Fechar" onPress={onClose} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: tokens.space.lg,
          paddingBottom: tokens.space.xl + insets.bottom * 0, gap: tokens.space.md }}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  </Modal>;
}
export const Sheet = AppBottomSheet;

export function ConfirmDialog({ title, message, visible, busy, confirmLabel = 'Confirmar', onCancel, onConfirm }: {
  title: string; message: string; visible: boolean; busy?: boolean; confirmLabel?: string;
  onCancel: () => void; onConfirm: () => void;
}) {
  return <AppBottomSheet visible={visible} title={title} onClose={() => { if (!busy) onCancel(); }}>
    <Label muted>{message}</Label>
    <Button title={confirmLabel} variant="danger" loading={busy} onPress={onConfirm} />
    <Button title="Cancelar" variant="secondary" disabled={busy} onPress={onCancel} />
  </AppBottomSheet>;
}
export const Confirm = ConfirmDialog;

export function Toast({ notice, onDismiss, onAction }: {
  notice: { message: string; actionLabel?: string } | null;
  onDismiss: () => void; onAction?: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!notice) return null;
  return <View pointerEvents="box-none" style={{ position: 'absolute', bottom: insets.bottom + 84,
    left: tokens.space.lg, right: tokens.space.lg, alignItems: 'center' }}>
    <View accessibilityLiveRegion="polite" accessibilityRole="alert"
      style={{ width: '100%', maxWidth: 560, backgroundColor: colors.elevated,
        borderColor: colors.border, borderWidth: 1, borderRadius: tokens.radius.md,
        padding: tokens.space.md, flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm,
        shadowColor: colors.shadow, shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
      <Feather name="check-circle" size={18} color={colors.success} />
      <Text style={{ flex: 1, color: colors.text, fontSize: tokens.font.caption, lineHeight: 18 }}>{notice.message}</Text>
      {notice.actionLabel && onAction ? <Button title={notice.actionLabel} compact variant="soft" onPress={onAction} /> : null}
      <IconButton icon="x" label="Dispensar aviso" onPress={onDismiss} />
    </View>
  </View>;
}

/* -------------------------------- calendário ------------------------------ */

export function CalendarGrid({ selected, month, onSelect, counts = {}, overdue = [] }: {
  selected: string; month: string; onSelect: (date: string) => void;
  counts?: Record<string, number>; overdue?: string[];
}) {
  const { colors } = useTheme();
  const overdueSet = new Set(overdue);
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
      <View key={`${d}${i}`} style={{ width: '14.285%', alignItems: 'center', paddingVertical: 6 }}>
        <Label muted size="micro" weight="bold">{d}</Label>
      </View>
    ))}
    {monthDays(month).map(date => {
      const isSelected = date === selected;
      const inMonth = date.slice(0, 7) === month.slice(0, 7);
      const isCurrent = date === dayKey();
      const count = counts[date] || 0;
      return <View key={date} style={{ width: '14.285%', padding: 2 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${date}, ${count} tarefas`}
          accessibilityState={{ selected: isSelected }} onPress={() => onSelect(date)}
          style={({ pressed }) => ({ minHeight: 46, borderRadius: tokens.radius.sm, alignItems: 'center',
            justifyContent: 'center', gap: 3, opacity: pressed ? 0.7 : 1,
            backgroundColor: isSelected ? colors.primary : isCurrent ? colors.primarySoft : 'transparent',
            borderWidth: isCurrent && !isSelected ? 1 : 0, borderColor: colors.primary })}>
          <Text style={{ fontSize: 13, fontWeight: isSelected || isCurrent ? tokens.weight.bold : tokens.weight.medium,
            color: isSelected ? colors.onPrimary : inMonth ? colors.text : colors.muted }}>
            {Number(date.slice(8))}
          </Text>
          <View style={{ flexDirection: 'row', gap: 2, height: 4 }}>
            {count > 0 ? <View style={{ width: 4, height: 4, borderRadius: 2,
              backgroundColor: isSelected ? colors.onPrimary : colors.primary }} /> : null}
            {overdueSet.has(date) ? <View style={{ width: 4, height: 4, borderRadius: 2,
              backgroundColor: isSelected ? colors.onPrimary : colors.danger }} /> : null}
          </View>
        </Pressable>
      </View>;
    })}
  </View>;
}

export function DateSelector({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(validDate(value) ? value : dayKey());
  const move = (n: number) => { const d = localDate(month); setMonth(dayKey(new Date(d.getFullYear(), d.getMonth() + n, 1, 12))); };
  return <View style={{ gap: tokens.space.sm }}>
    <Input label={label} placeholder="AAAA-MM-DD" value={value} onChangeText={onChange} maxLength={10}
      autoCapitalize="none" hint="Formato civil: ano-mês-dia." />
    <Row>
      <Button title={value && validDate(value) ? formatDate(value) : 'Escolher no calendário'} icon="calendar"
        variant="secondary" compact onPress={() => setOpen(true)} />
      {!!value && <Button title="Limpar" variant="ghost" compact onPress={() => onChange('')} />}
    </Row>
    <AppBottomSheet visible={open} title={localDate(month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      onClose={() => setOpen(false)}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Button title="Mês anterior" icon="chevron-left" variant="ghost" compact onPress={() => move(-1)} />
        <Button title="Próximo mês" icon="chevron-right" variant="ghost" compact onPress={() => move(1)} />
      </Row>
      <CalendarGrid month={month} selected={value} onSelect={d => { onChange(d); setOpen(false); }} />
      <Button title="Hoje" variant="secondary" onPress={() => { onChange(dayKey()); setOpen(false); }} />
    </AppBottomSheet>
  </View>;
}
export const DateField = DateSelector;

/* ------------------------------- estrutura -------------------------------- */

export function AppHeader({ title, subtitle, action, onBack, eyebrow }: {
  title: string; subtitle?: string; action?: React.ReactNode; onBack?: () => void; eyebrow?: string;
}) {
  const { colors } = useTheme();
  return <View style={{ gap: tokens.space.sm, marginBottom: tokens.space.xs }}>
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
      <Row style={{ flexWrap: 'nowrap', flex: 1, alignItems: 'center' }}>
        {onBack ? <IconButton icon="arrow-left" label="Voltar" onPress={onBack} /> : null}
        <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
          <Label size="micro" weight="bold" style={{ letterSpacing: 1.6, color: colors.primary }}>
            {eyebrow || 'ORGANIZA AÍ'}
          </Label>
          <Label size="heading" numberOfLines={2}>{title}</Label>
          {subtitle ? <Label muted size="caption">{subtitle}</Label> : null}
        </View>
      </Row>
      {action}
    </Row>
  </View>;
}

export function Screen({ children, title, subtitle, refreshing, onRefresh, action, onBack, eyebrow,
  scroll = true, header = true, fab, fabBottom, contentStyle }: React.PropsWithChildren<{
  title: string; subtitle?: string; refreshing?: boolean; onRefresh?: () => void;
  action?: React.ReactNode; onBack?: () => void; eyebrow?: string; scroll?: boolean;
  header?: boolean; fab?: React.ReactNode; fabBottom?: number; contentStyle?: ViewStyle;
}>) {
  const { colors } = useTheme();
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh}
          tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
        contentContainerStyle={[styles.screen, contentStyle]}>
        {header && <AppHeader title={title} subtitle={subtitle} action={action} onBack={onBack} eyebrow={eyebrow} />}
        {children}
      </ScrollView> : <View style={[styles.screen, { flex: 1 }, contentStyle]}>
        {header && <AppHeader title={title} subtitle={subtitle} action={action} onBack={onBack} eyebrow={eyebrow} />}
        {children}
      </View>}
      {fab}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { width: '100%', maxWidth: 1080, alignSelf: 'center', padding: tokens.space.lg,
    paddingBottom: 120, gap: tokens.space.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space.sm },
  card: { padding: tokens.space.lg, borderWidth: 1, borderRadius: tokens.radius.lg, gap: tokens.space.sm,
    shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 1 },
  button: { minHeight: tokens.touch, paddingHorizontal: tokens.space.lg, paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: 14, borderRadius: tokens.radius.pill, borderWidth: 1 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: tokens.radius.sm, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: tokens.font.body },
});
