// ============================================================
// Link Generator — Discord/WhatsApp invite link helpers
// Generates pre-filled links for group communication
// ============================================================

/**
 * Generate a WhatsApp group invite link with pre-filled message
 */
export function generateWhatsAppLink(gameName: string, groupId: string): string {
  const message = encodeURIComponent(
    `🎮 SquadUp Group!\n\nGame: ${gameName}\nGroup ID: ${groupId}\n\nLet's team up and play together! Join our group on SquadUp.`
  );
  return `https://wa.me/?text=${message}`;
}

/**
 * Generate a Discord invite creation prompt
 * (We can't create Discord servers via URL, so we provide instructions)
 */
export function generateDiscordInfo(gameName: string): { url: string; instructions: string } {
  return {
    url: 'https://discord.com/channels/@me',
    instructions: `Create a Discord group DM or server for "${gameName}". Share the invite link with your SquadUp group members!`,
  };
}

/**
 * Generate a Telegram group link with pre-filled message
 */
export function generateTelegramLink(gameName: string): string {
  const message = encodeURIComponent(`🎮 SquadUp - Let's play ${gameName} together!`);
  return `https://t.me/share/url?text=${message}`;
}
