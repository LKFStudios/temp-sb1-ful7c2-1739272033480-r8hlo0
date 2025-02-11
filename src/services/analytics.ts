import mixpanel from 'mixpanel-browser';
import { env } from '../config/env';

// Initialize Mixpanel with the provided token
mixpanel.init('c83195cd6ca060d0fb01c85512203976', {
  debug: env.IS_DEV,
  track_pageview: true,
  persistence: 'localStorage',
  api_host: 'https://api.mixpanel.com'  // Fixed API host URL
});

export const analytics = {
  identify: (userId: string, traits?: Record<string, any>) => {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  },

  track: (event: string, properties?: Record<string, any>) => {
    mixpanel.track(event, properties);
  },

  trackScreen: (screenName: string) => {
    mixpanel.track('Screen View', { screen: screenName });
  },

  trackAnalysis: (result: any) => {
    mixpanel.track('Analysis Complete', {
      totalScore: result.scores.total,
      categories: Object.keys(result.scores).length,
      hasImage: !!result.imageUrl
    });
  },

  trackError: (error: Error, context?: string) => {
    mixpanel.track('Error', {
      message: error.message,
      context,
      timestamp: new Date().toISOString()
    });
  },

  reset: () => {
    mixpanel.reset();
  }
};