import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
export function useRemote<T>(url: string) {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const reload = useCallback(async () => { setLoading(true); setError(''); try {
        setData((await http.get<T>(url)).data);
    }
    catch (e) {
        setError(toApiError(e).message);
    }
    finally {
        setLoading(false);
    } }, [url]);
    useFocusEffect(useCallback(() => { void reload(); }, [reload]));
    return { data, loading, error, reload };
}
