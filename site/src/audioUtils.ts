export async function convertAudioBufferToWavBlob(audioBuffer: AudioBuffer): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    const worker = new Worker('/wave-worker.js');
    worker.onmessage = (e: MessageEvent) => {
      const blob = new Blob([e.data.buffer], { type: 'audio/wav' });
      resolve(blob);
    };
    const pcmArrays: Float32Array[] = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      pcmArrays.push(audioBuffer.getChannelData(i));
    }
    worker.postMessage({
      pcmArrays,
      config: { sampleRate: audioBuffer.sampleRate },
    });
  });
}

export function downloadBlob(blob: Blob, name: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
  document.body.removeChild(link);
}