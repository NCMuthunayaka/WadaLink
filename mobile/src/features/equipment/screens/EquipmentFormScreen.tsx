import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import type { RootStackParamList } from '@/navigation/types';
import { EquipmentPhoto, type Equipment } from './EquipmentFlowScreens';

type EquipmentFormValues = {
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: string;
  deposit: string;
  delivery_fee: string;
  delivery_radius: string;
  tags: string;
  pickup_location: string;
  return_location: string;
};

const EMPTY_FORM: EquipmentFormValues = {
  name: '',
  category: '',
  description: '',
  image_url: '',
  price_per_day: '',
  deposit: '0',
  delivery_fee: '0',
  delivery_radius: '0',
  tags: '',
  pickup_location: '',
  return_location: '',
};

const LABELS: Record<keyof EquipmentFormValues, string> = {
  name: 'Equipment name',
  category: 'Category',
  description: 'Description and condition',
  image_url: 'Equipment photo URL (https://)',
  price_per_day: 'Daily rental price',
  deposit: 'Security deposit',
  delivery_fee: 'Delivery fee',
  delivery_radius: 'Delivery radius (km)',
  tags: 'Search tags (comma separated)',
  pickup_location: 'Pickup location',
  return_location: 'Return location',
};

export default function EquipmentFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EquipmentForm'>) {
  const id = route.params?.equipmentId;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loaded, setLoaded] = useState(!id);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    void http
      .get<Equipment>(`/equipment/${id}`)
      .then(({ data: item }) => {
        setForm({
          name: item.name,
          category: item.category,
          description: item.description ?? '',
          image_url: item.image_url ?? '',
          price_per_day: String(item.price_per_day),
          deposit: String(item.deposit),
          delivery_fee: String(item.delivery_fee ?? 0),
          delivery_radius: String(item.delivery_radius ?? 0),
          tags: (item.tags ?? []).join(', '),
          pickup_location: item.pickup_location ?? '',
          return_location: item.return_location ?? '',
        });
        setLoaded(true);
      })
      .catch((error) => setMessage(toApiError(error).message));
  }, [id]);

  async function save() {
    setBusy(true);
    setMessage('');
    const payload = {
      ...form,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      price_per_day: Number(form.price_per_day),
      deposit: Number(form.deposit),
      delivery_fee: Number(form.delivery_fee),
      delivery_radius: Number(form.delivery_radius),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      pickup_location: form.pickup_location.trim() || null,
      return_location: form.return_location.trim() || null,
    };

    try {
      if (id) await http.patch(`/equipment/${id}`, payload);
      else await http.post('/equipment/', payload);
      navigation.goBack();
    } catch (error) {
      setMessage(toApiError(error).message);
    } finally {
      setBusy(false);
    }
  }

  const validNumber = (value: string, allowZero: boolean) => {
    const number = Number(value);
    return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0);
  };

  return (
    <FeaturePage title={id ? 'Edit equipment' : 'List your equipment'}>
      <Text>Add accurate specifications and an actual photo so renters can choose confidently.</Text>
      {!!form.image_url && <EquipmentPhoto key={form.image_url} url={form.image_url} name={form.name || 'Equipment photo preview'} />}
      <Card style={s.card}>
        {(Object.keys(form) as (keyof EquipmentFormValues)[]).map((key) => (
          <Input
            key={key}
            label={LABELS[key]}
            value={form[key]}
            multiline={key === 'description'}
            onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
          />
        ))}
        <Button
          size="lg"
          label="Save listing"
          loading={busy}
          disabled={
            !loaded ||
            form.name.trim().length < 2 ||
            form.name.trim().length > 150 ||
            form.category.trim().length < 2 ||
            !validNumber(form.price_per_day, false) ||
            !validNumber(form.deposit, true) ||
            !validNumber(form.delivery_fee, true) ||
            !validNumber(form.delivery_radius, true) ||
            (!!form.image_url && !form.image_url.startsWith('https://'))
          }
          onPress={() => void save()}
        />
      </Card>
      {!!message && <Notice text={message} />}
    </FeaturePage>
  );
}
