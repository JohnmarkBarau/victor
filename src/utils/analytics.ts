export function calculateEngagementRate(
  likes: number, 
  comments: number, 
  shares: number, 
  views: number
): number {
  if (views === 0) return 0;
  return ((likes + comments + shares) / views) * 100;
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function getTopPerformingContent<T extends { engagement?: number; views?: number }>(
  content: T[]
): T | null {
  if (content.length === 0) return null;
  
  return content.reduce((best, current) => {
    const currentScore = (current.engagement || 0) + (current.views || 0) * 0.1;
    const bestScore = (best.engagement || 0) + (best.views || 0) * 0.1;
    return currentScore > bestScore ? current : best;
  });
}

export function groupByTimeframe<T extends { created_at: string }>(
  data: T[],
  timeframe: 'day' | 'week' | 'month'
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  
  data.forEach(item => {
    const date = new Date(item.created_at);
    let key: string;
    
    switch (timeframe) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
}