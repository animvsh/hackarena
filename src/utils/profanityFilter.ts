// Common profanity words to filter
const PROFANITY_WORDS = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell',
  'dick', 'cock', 'pussy', 'bastard', 'cunt', 'whore',
  'nigger', 'nigga', 'retard', 'fag', 'gay'
].map(word => new RegExp(`\\b${word}\\b`, 'gi'));

// Check if message contains profanity
export function containsProfanity(text: string): boolean {
  return PROFANITY_WORDS.some(pattern => pattern.test(text));
}

// Filter profanity from text
export function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_WORDS.forEach(pattern => {
    filtered = filtered.replace(pattern, '***');
  });
  return filtered;
}

// Rate limiting to prevent spam
const messageTimestamps: Map<string, number[]> = new Map();

export function checkSpam(userId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const userMessages = messageTimestamps.get(userId) || [];
  
  // Remove messages older than 1 minute
  const recentMessages = userMessages.filter(timestamp => now - timestamp < 60000);
  
  // Max 5 messages per minute
  if (recentMessages.length >= 5) {
    return { allowed: false, reason: 'Rate limit exceeded. Please wait before sending another message.' };
  }
  
  // Update timestamps
  recentMessages.push(now);
  messageTimestamps.set(userId, recentMessages);
  
  return { allowed: true };
}



