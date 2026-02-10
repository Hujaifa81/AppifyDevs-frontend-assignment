
export type Period = '7d' | '30d' | '12m';
export type UserType = 'all' | 'free' | 'premium' | 'enterprise';

export interface FilterState {
  period: Period;
  userType: UserType;
}
