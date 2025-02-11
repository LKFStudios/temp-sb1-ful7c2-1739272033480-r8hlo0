import { GeminiClient, isGeminiConfigured } from '../../services/gemini';
import { usePrompts } from '../prompts';
import { AnalysisMetrics, Gender } from '../types';
import { analytics } from '../../services/analytics';

const DEFAULT_METRICS: AnalysisMetrics = {
  eyes: {
    size: 7,
    shape: 7,
    balance: 7,
    analysis: ['目の形状が整っています'],
    improvement: ['目元の印象をさらに良くするためのアドバイス']
  },
  nose: {
    height: 7,
    bridge: 7,
    shape: 7,
    analysis: ['バランスの取れた鼻筋です'],
    improvement: ['立体感を出すためのアドバイス']
  },
  skin: {
    texture: 7,
    tone: 7,
    clarity: 7,
    analysis: ['健康的な肌の印象です'],
    improvement: ['さらなる透明感を出すためのアドバイス']
  },
  jawline: {
    definition: 7,
    balance: 7,
    angle: 7,
    analysis: ['整ったフェイスラインです'],
    improvement: ['輪郭をさらに引き立てるアドバイス']
  },
  hair: {
    quality: 7,
    volume: 7,
    style: 7,
    analysis: ['健康的な髪の印象です'],
    improvement: ['髪の質感を高めるアドバイス']
  }
};

export async function analyzeFaceWithGemini(imageData: string, gender: Gender): Promise<AnalysisMetrics> {
  if (!isGeminiConfigured()) {
    console.warn('Gemini API is not configured, using default metrics');
    analytics.track('Analysis Fallback', { reason: 'unconfigured' });
    return DEFAULT_METRICS;
  }

  try {
    console.log('Starting face analysis...', { gender });
    const client = GeminiClient.getInstance();
    const { getAnalysisPrompt } = usePrompts();
    const prompt = getAnalysisPrompt(gender);

    const response = await client.generateContent(prompt, imageData);
    console.log('Received Gemini response');

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Invalid response format:', response);
      throw new Error('AIからの応答が不正な形式です');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('AIからの応答を解析できませんでした');
    }

    if (!parsed.measurements) {
      console.error('No measurements found:', parsed);
      throw new Error('分析結果が見つかりませんでした');
    }

    // 各カテゴリーの値を検証
    const validateCategory = (category: any, defaultCategory: any) => {
      if (!category || typeof category !== 'object') {
        console.warn('Invalid category data, using default:', category);
        return defaultCategory;
      }

      const normalizedCategory = { ...defaultCategory };
      const numericFields = ['size', 'shape', 'balance', 'height', 'bridge', 'texture', 
                           'tone', 'clarity', 'definition', 'angle', 'quality', 'volume', 'style'];

      numericFields.forEach(field => {
        if (field in category) {
          const value = Number(category[field]);
          normalizedCategory[field as keyof typeof normalizedCategory] = 
            !isNaN(value) ? Math.min(10, Math.max(0, value)) : defaultCategory[field];
        }
      });

      normalizedCategory.analysis = Array.isArray(category.analysis) ? category.analysis : defaultCategory.analysis;
      normalizedCategory.improvement = Array.isArray(category.improvement) ? category.improvement : defaultCategory.improvement;

      return normalizedCategory;
    };

    const metrics: AnalysisMetrics = {
      eyes: validateCategory(parsed.measurements.eyes, DEFAULT_METRICS.eyes),
      nose: validateCategory(parsed.measurements.nose, DEFAULT_METRICS.nose),
      skin: validateCategory(parsed.measurements.skin, DEFAULT_METRICS.skin),
      jawline: validateCategory(parsed.measurements.jawline, DEFAULT_METRICS.jawline),
      hair: validateCategory(parsed.measurements.hair, DEFAULT_METRICS.hair)
    };

    analytics.track('Face Analysis Success', {
      gender,
      hasAnalysis: Object.values(metrics).every(category => Array.isArray(category.analysis) && category.analysis.length > 0),
      hasImprovement: Object.values(metrics).every(category => Array.isArray(category.improvement) && category.improvement.length > 0)
    });

    return metrics;
  } catch (error) {
    console.error('Face analysis failed:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Face analysis failed'));
    throw new Error('顔分析に失敗しました。時間をおいて再度お試しください。');
  }
}