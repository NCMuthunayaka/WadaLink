import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';

export interface Equipment {
  id: number;
  owner_id: number;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  price_per_day: number;
  deposit: number;
  delivery_fee?: number;
  delivery_radius?: number;
  tags?: string[];
  status: string;
  pickup_location?: string;
  return_location?: string;
}

export function EquipmentPhoto({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  return url && !failed ? (
    <Image
      source={{ uri: url }}
      accessibilityLabel={name}
      style={s.image}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  ) : (
    <View style={[s.image, { overflow: 'hidden' }]}>
      <Image source={require('../../../../assets/rental-equipment.png')} accessibilityLabel={`${name} equipment preview`} style={s.image} resizeMode="cover" />
      <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(15,23,42,0.72)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 }}>
        <Text variant="labelMd" color={colors.textInverse}>Equipment preview</Text>
      </View>
    </View>
  );
}

export function EquipmentCatalogScreen({ fleet = false }: { fleet?: boolean }) {
  const r = useRemote<Equipment[]>(fleet ? '/equipment/fleet' : '/equipment/');
  const [search, setSearch] = useState('');
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const normalizedSearch = search.trim().toLowerCase();
  const items = (r.data ?? []).filter((item) =>
    `${item.name} ${item.category} ${item.description ?? ''} ${(item.tags ?? []).join(' ')}`
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <FeaturePage
      title={fleet ? 'Your equipment fleet' : 'Find equipment'}
      refresh={() => void r.reload()}
      refreshing={r.loading}
    >
      <View style={s.hero}>
        <Text variant="headlineMd" color={colors.textInverse}>
          {fleet ? 'Ready for the next job' : 'Tools for every task'}
        </Text>
        <Text color={colors.textInverse}>
          {fleet ? 'Manage listings and rental returns.' : 'Explore equipment, compare daily rates, and reserve your dates.'}
        </Text>
      </View>
      <View style={s.row}>
        {fleet && <Button size="lg" label="Add equipment" onPress={() => nav.navigate('EquipmentForm')} />}
        <Button size="lg" variant="outline" label="Reservations & history" onPress={() => nav.navigate('Reservations')} />
      </View>
      <Input label="Search equipment, category, or details" value={search} onChangeText={setSearch} />
      {!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}
      {!r.loading && !r.error && !items.length && (
        <Notice text="No equipment matches. Try another search or add your first listing." />
      )}
      {items.map((item) => (
        <Card key={item.id} style={s.card}>
          <EquipmentPhoto url={item.image_url} name={item.name} />
          <Text color={colors.secondary}>{item.category} · {item.status.replaceAll('_', ' ')}</Text>
          <Text variant="headlineSm">{item.name}</Text>
          <Text>{item.price_per_day} / day · Deposit {item.deposit}</Text>
          <Button
            size="lg"
            label="View equipment"
            onPress={() => nav.navigate('EquipmentDetail', { equipmentId: String(item.id) })}
          />
          {fleet && (
            <Button
              size="lg"
              variant="outline"
              label="Edit listing"
              onPress={() => nav.navigate('EquipmentForm', { equipmentId: String(item.id) })}
            />
          )}
        </Card>
      ))}
    </FeaturePage>
  );
}

export function FleetScreen() {
  return <EquipmentCatalogScreen fleet />;
}

export function EquipmentDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EquipmentDetail'>) {
  const id = route.params.equipmentId;
  const r = useRemote<Equipment>(`/equipment/${id}`);
  const customer = useAppSelector(selectUser)?.role === 'customer';
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dates =
    /^\d{4}-\d{2}-\d{2}$/.test(start) &&
    /^\d{4}-\d{2}-\d{2}$/.test(end) &&
    Date.parse(end) > Date.parse(start) &&
    Date.parse(start) >= new Date().setHours(0, 0, 0, 0);

  async function book() {
    setBusy(true);
    setMessage('');
    try {
      await http.post('/reservations/', {
        equipment_id: Number(id),
        start_date: `${start}T09:00:00`,
        end_date: `${end}T09:00:00`,
      });
      navigation.navigate('Reservations');
    } catch (error) {
      setMessage(toApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  const item = r.data;
  const rentalDays = dates ? Math.ceil((Date.parse(end) - Date.parse(start)) / 86400000) : 0;
  const dateValue = (offset: number) => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    value.setDate(value.getDate() + offset);
    return value.toISOString().slice(0, 10);
  };

  return (
    <FeaturePage title="Equipment details" refresh={() => void r.reload()} refreshing={r.loading}>
      {!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}
      {item && (
        <>
          <EquipmentPhoto url={item.image_url} name={item.name} />
          <Card style={s.card}>
            <Text color={colors.secondary}>{item.category} · {item.status.replaceAll('_', ' ')}</Text>
            <Text variant="headlineMd">{item.name}</Text>
            <Text>{item.description || 'No additional specifications supplied.'}</Text>
            <Text variant="headlineSm">{item.price_per_day} / day</Text>
            <Text>Deposit: {item.deposit}</Text>
            <Text>Delivery fee: {item.delivery_fee ?? 0}</Text>
            {item.delivery_radius ? <Text>Delivery radius: {item.delivery_radius} km</Text> : null}
            <Text>Pickup: {item.pickup_location || 'Arrange with the owner'}</Text>
            {item.return_location ? <Text>Return: {item.return_location}</Text> : null}
            {item.tags?.length ? <Text>Tags: {item.tags.join(', ')}</Text> : null}
          </Card>
          {customer && (
            <Card style={s.card}>
              <Text variant="headlineSm">Reserve your dates</Text>
              <Text variant="bodySm" color={colors.textSecondary}>Choose a pickup and return day.</Text>
              <Text variant="labelMd">Pickup date</Text>
              <View style={s.row}>{[0, 1, 2].map((offset) => <Button key={offset} size="sm" variant={start === dateValue(offset) ? 'primary' : 'outline'} label={offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : 'In 2 days'} onPress={() => setStart(dateValue(offset))} />)}</View>
              <Text variant="labelMd">Return date</Text>
              <View style={s.row}>{[1, 2, 3, 7].map((offset) => <Button key={offset} size="sm" variant={end === dateValue(offset) ? 'primary' : 'outline'} label={offset === 1 ? 'Tomorrow' : offset === 7 ? 'Next week' : `In ${offset} days`} onPress={() => setEnd(dateValue(offset))} />)}</View>
              {!!(start || end) && !dates && (
                <Text color={colors.danger}>Choose a future pickup date and a later return date.</Text>
              )}
              {dates && (
                <Text>
                  Rental subtotal: {rentalDays * item.price_per_day} · Delivery: {item.delivery_fee ?? 0} · Deposit: {item.deposit}
                </Text>
              )}
              <Button
                size="lg"
                label="Reserve equipment"
                disabled={!dates || item.status !== 'available'}
                loading={busy}
                onPress={() => void book()}
              />
            </Card>
          )}
        </>
      )}
      {!!message && <Notice text={message} />}
    </FeaturePage>
  );
}
