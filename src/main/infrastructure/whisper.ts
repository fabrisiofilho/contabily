import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { app } from 'electron';

const run = promisify(execFile);

async function requireLocalFile(path: string, message: string): Promise<void> {
  const info = await stat(path).catch(() => null);
  if (!info?.isFile() || info.size === 0) throw new Error(message);
}

export async function transcribeLocalWav(
  wavPath: string,
  signal?: AbortSignal,
): Promise<string> {
  if (!/^[a-z]:[\\/]/i.test(wavPath) || !/\.wav$/i.test(wavPath)) {
    throw new Error('Informe um arquivo WAV local.');
  }

  const runtimeDir = app.isPackaged
    ? join(process.resourcesPath, 'whisper')
    : join(app.getAppPath(), 'resources', 'whisper');
  const executable = join(runtimeDir, 'whisper-cli.exe');
  const model = join(runtimeDir, 'ggml-tiny.bin');

  await requireLocalFile(
    executable,
    'Whisper local indisponível no Contabily.',
  );
  await requireLocalFile(
    model,
    'Modelo Whisper Tiny multilíngue indisponível.',
  );
  await requireLocalFile(wavPath, 'Arquivo WAV local indisponível.');

  const { stdout } = await run(
    executable,
    ['-m', model, '-l', 'pt', '-f', wavPath, '-np', '-nt', '-ng'],
    { encoding: 'utf8', windowsHide: true, timeout: 120_000, signal },
  ).catch((error: unknown) => {
    if (signal?.aborted) throw signal.reason;
    throw new Error('Falha na transcrição local do Whisper.', { cause: error });
  });

  const text = stdout.trim();
  if (!text) throw new Error('Nenhuma fala foi transcrita.');
  return text;
}
