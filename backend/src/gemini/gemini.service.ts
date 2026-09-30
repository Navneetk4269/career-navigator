import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ContentListUnion,
  GenerateContentConfig,
  GoogleGenAI,
  UploadFileConfig,
  File as GeminiFile,
} from '@google/genai';

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
];

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly models: string[];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured.',
      );
    }

    this.client = new GoogleGenAI({ apiKey });
    this.models = (process.env.GEMINI_MODELS || '')
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean);

    if (this.models.length === 0) {
      this.models = [...DEFAULT_MODELS];
    }
  }

  async generateContent(
    contents: ContentListUnion,
    config?: GenerateContentConfig,
  ): Promise<string> {
    let lastRetryableError: unknown;

    for (const model of this.models) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const response = await this.client.models.generateContent({
            model,
            contents,
            config,
          });
          const text = response.text?.trim();

          if (!text) {
            throw new BadGatewayException(
              'The AI service returned an empty response. Please try again.',
            );
          }

          return text;
        } catch (error) {
          if (error instanceof BadGatewayException) {
            throw error;
          }

          const status = this.getStatus(error);
          if (!this.isRetryableStatus(status)) {
            throw error;
          }

          lastRetryableError = error;
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      }
    }

    throw new ServiceUnavailableException(
      lastRetryableError
        ? 'The AI service is temporarily unavailable. Please try again.'
        : 'No AI models are configured.',
    );
  }

  uploadFile(file: Blob, config?: UploadFileConfig): Promise<GeminiFile> {
    return this.client.files.upload({ file, config });
  }

  parseJson<T = Record<string, any>>(
    output: string,
    friendlyMessage = 'The AI service returned an invalid response. Please try again.',
  ): T {
    try {
      return JSON.parse(output) as T;
    } catch {
      throw new BadGatewayException(friendlyMessage);
    }
  }

  private getStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }

    const value = error as {
      status?: unknown;
      code?: unknown;
      error?: { code?: unknown };
    };
    for (const rawStatus of [value.status, value.code, value.error?.code]) {
      const status = typeof rawStatus === 'number'
        ? rawStatus
        : Number(rawStatus);

      if (Number.isFinite(status)) {
        return status;
      }
    }

    return undefined;
  }

  private isRetryableStatus(status?: number) {
    return status === 429 || (status !== undefined && status >= 500 && status <= 599);
  }
}
