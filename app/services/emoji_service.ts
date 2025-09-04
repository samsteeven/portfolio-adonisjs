export default class EmojiService {
  static readonly REACTIONS = {
    positive: [
      '👍',
      '❤️',
      '😍',
      '😂',
      '🎉',
      '👏',
      '🔥',
      '💯',
      '✨',
      '⭐',
      '🚀',
      '😊',
      '😎',
      '💪',
      '🙌',
    ],
    neutral: ['👀', '💭', '🤔', '💡'],
    negative: ['👎', '😮', '😢', '😡'],
  }

  static getAllReactions(): string[] {
    return [...this.REACTIONS.positive, ...this.REACTIONS.neutral, ...this.REACTIONS.negative]
  }

  static getReactionType(emoji: string): 'positive' | 'neutral' | 'negative' | null {
    if (this.REACTIONS.positive.includes(emoji)) return 'positive'
    if (this.REACTIONS.neutral.includes(emoji)) return 'neutral'
    if (this.REACTIONS.negative.includes(emoji)) return 'negative'
    return null
  }

  static getReactionsByType() {
    return this.REACTIONS
  }
}
