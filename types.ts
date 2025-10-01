export enum ProcessingMode {
  ENHANCE = 'Enhance Quality',
  UPSCALE_2K = 'Upscale to 2K',
  UPSCALE_4K = 'Upscale to 4K',
  UPSCALE_8K = 'Upscale to 8K',
  REMOVE_BG = 'Remove Background',
  REMOVE_WATERMARK = 'Remove Watermark',
  CUSTOM_AI_EDIT = 'Custom AI Edit',
  CARTOON = 'Cartoon Style',
  ANIME = 'Anime Style',
  SKETCH = 'Sketch Effect',
  FANTASY = 'Fantasy Look',
}

export enum FileStatus {
  PENDING,
  PROCESSING,
  COMPLETED,
  ERROR,
}

export interface ProcessedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: FileStatus;
  mode: ProcessingMode;
  resultUrl: string | null;
  error: string | null;
}
