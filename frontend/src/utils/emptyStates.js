/**
 * Centralized empty state copy and action CTAs for StudyRot.
 * Every screen with zero user data displays clear, actionable messaging.
 */

export const EMPTY_STATES = {
  feedHistory: {
    title: "No feeds yet",
    description: "Type a topic to generate your first one.",
    actionLabel: "Generate a Feed",
    icon: "📚",
  },
  dailyReview: {
    title: "Daily Review Locked",
    description: "Set your exam date to unlock daily review.",
    actionLabel: "Set Exam Date",
    icon: "📅",
  },
  weaknessReport: {
    title: "No Error Patterns Yet",
    description: "Complete 10 quizzes to see your error patterns.",
    actionLabel: "Take a Quiz",
    icon: "🎯",
  },
  battleHistory: {
    title: "No Battle Records",
    description: "Play your first battle to see results here.",
    actionLabel: "Start Solo Battle",
    icon: "⚔️",
  },
  savedPosts: {
    title: "No saved posts yet",
    description: "Tap 🔖 on any post to save it here.",
    actionLabel: "Browse Feed",
    icon: "🔖",
  },
  comments: {
    title: "No comments yet",
    description: "No comments yet. Be the first.",
    actionLabel: "Write a Comment",
    icon: "💬",
  },
  sharedViews: {
    title: "No views yet",
    description: "No views yet.",
    icon: "👁️",
  },
  streak: {
    title: "0 Day Streak",
    description: "Start studying today to build your streak.",
    actionLabel: "Study Now",
    icon: "🔥",
  },
};
