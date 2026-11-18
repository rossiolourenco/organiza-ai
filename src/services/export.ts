import { Platform, Share } from 'react-native';

/**
 * Exporta um JSON legível. Web: download via Blob. Nativo: folha de
 * compartilhamento do sistema. Nenhum serviço externo é usado.
 */
export async function exportJson(filename: string, data: unknown): Promise<'download' | 'share'> {
  const payload = JSON.stringify(data, null, 2);
  if (Platform.OS === 'web') {
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'download';
  }
  await Share.share({ title: filename, message: payload });
  return 'share';
}
