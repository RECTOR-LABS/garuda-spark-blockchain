import React from 'react';

interface ReputationBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface Badge {
  name: string;
  minScore: number;
  color: string;
  bgColor: string;
  icon: JSX.Element;
}

const badges: Badge[] = [
  {
    name: 'Legendary',
    minScore: 1000,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    name: 'Leader',
    minScore: 500,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Proposer',
    minScore: 100,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Voter',
    minScore: 50,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Newcomer',
    minScore: 0,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function ReputationBadge({ score, size = 'md', showLabel = true }: ReputationBadgeProps) {
  // Find the appropriate badge for the score
  const badge = badges.find((b, index) => {
    const nextBadge = badges[index - 1];
    return score >= b.minScore && (!nextBadge || score < nextBadge.minScore);
  }) || badges[badges.length - 1];

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'flex items-center gap-1',
      icon: 'w-4 h-4',
      score: 'text-sm',
      label: 'text-xs',
    },
    md: {
      container: 'flex items-center gap-2',
      icon: 'w-5 h-5',
      score: 'text-base',
      label: 'text-sm',
    },
    lg: {
      container: 'flex items-center gap-3',
      icon: 'w-6 h-6',
      score: 'text-lg',
      label: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={classes.container}>
      <div className={`${classes.icon} ${badge.color} flex-shrink-0`}>
        {badge.icon}
      </div>
      <div className="flex flex-col">
        <span className={`font-semibold ${badge.color} ${classes.score}`}>
          {score.toLocaleString()}
        </span>
        {showLabel && (
          <span className={`${badge.color} opacity-75 ${classes.label} font-medium`}>
            {badge.name}
          </span>
        )}
      </div>
    </div>
  );
}

// Export badge thresholds for use in other components
export const getNextMilestone = (score: number): { name: string; score: number; remaining: number } | null => {
  const nextBadge = badges.find((b) => score < b.minScore);
  if (!nextBadge) return null;

  return {
    name: nextBadge.name,
    score: nextBadge.minScore,
    remaining: nextBadge.minScore - score,
  };
};

export const getAllBadges = () => badges;
