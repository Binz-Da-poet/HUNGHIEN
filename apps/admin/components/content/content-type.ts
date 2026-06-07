export const contentTypes = {
  news: { apiType: 'NEWS' as const, label: 'Tin tức', route: 'news' },
  policy: { apiType: 'POLICY' as const, label: 'Chính sách', route: 'policy' },
} as const;

export type ContentRouteType = keyof typeof contentTypes;

export function getContentConfig(route: string) {
  const config = contentTypes[route as ContentRouteType];
  if (!config) return null;
  return config;
}
