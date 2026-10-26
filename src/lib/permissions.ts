/** @fileoverview Calculates Discord role and channel permissions, including owner, admin, and timeout rules. */
import { Result } from "better-result";
import { ChannelType, OverwriteType, PermissionFlagsBits } from "discord-api-types/v10";
import type { z } from "zod";

import { DiscordError } from "./errors";
import type { channelSchema } from "./schemas/channels.schemas";
import type { guildSchema } from "./schemas/guilds.schemas";
import type { memberSchema } from "./schemas/members.schemas";
import type { roleSchema } from "./schemas/roles.schemas";

/** Decodes known permissions while preserving unknown bits in the decimal bitfield. */
export function describePermissions(bits: bigint) {
  return {
    bitfield: bits.toString(),
    names: Object.entries(PermissionFlagsBits)
      .filter(([, value]) => (bits & value) === value)
      .map(([name]) => name),
  };
}

/** Combines the everyone role with the caller's roles and applies Discord's bypass rules. */
export function guildPermissions(
  guild: z.output<typeof guildSchema>,
  member: z.output<typeof memberSchema>,
  roles: z.output<typeof roleSchema>[],
): Result<bigint, DiscordError> {
  const everyone = roles.find((entry) => entry.id === guild.id);
  if (!everyone)
    return Result.err(
      new DiscordError({
        message: "Discord did not return the server's everyone role.",
        hint: "Retry diagnostics after confirming the server ID and access.",
      }),
    );
  return Result.try({
    try: () => {
      let bits = BigInt(everyone.permissions);
      for (const entry of roles) {
        if (member.roles.includes(entry.id)) bits |= BigInt(entry.permissions);
      }
      if (guild.owner_id === member.user.id || (bits & PermissionFlagsBits.Administrator) !== 0n)
        return Object.values(PermissionFlagsBits).reduce((all, flag) => all | flag, 0n);
      return bits;
    },
    catch: DiscordError.from,
  });
}

/** Applies everyone, combined-role, and member overwrites in Discord's documented order. */
export function channelPermissions(
  base: bigint,
  member: z.output<typeof memberSchema>,
  channel: z.output<typeof channelSchema>,
): Result<bigint, DiscordError> {
  return Result.try({
    try: () => {
      if ((base & PermissionFlagsBits.Administrator) !== 0n) return base;
      const overwrites = channel.permission_overwrites ?? [];
      const everyone = overwrites.find(
        (entry) => entry.type === OverwriteType.Role && entry.id === channel.guild_id,
      );
      let bits = everyone ? (base & ~BigInt(everyone.deny)) | BigInt(everyone.allow) : base;
      let allow = 0n;
      let deny = 0n;
      for (const entry of overwrites) {
        if (
          entry.type === OverwriteType.Role &&
          entry.id !== channel.guild_id &&
          member.roles.includes(entry.id)
        ) {
          allow |= BigInt(entry.allow);
          deny |= BigInt(entry.deny);
        }
      }
      bits = (bits & ~deny) | allow;
      const own = overwrites.find(
        (entry) => entry.type === OverwriteType.Member && entry.id === member.user.id,
      );
      return own ? (bits & ~BigInt(own.deny)) | BigInt(own.allow) : bits;
    },
    catch: DiscordError.from,
  });
}

/** Applies active member timeouts after channel overwrites. Owners and administrators bypass timeouts. */
export function applyTimeout(bits: bigint, member: z.output<typeof memberSchema>): bigint {
  if ((bits & PermissionFlagsBits.Administrator) !== 0n) return bits;
  if (
    member.communication_disabled_until &&
    Date.parse(member.communication_disabled_until) > Date.now()
  )
    return bits & (PermissionFlagsBits.ViewChannel | PermissionFlagsBits.ReadMessageHistory);
  return bits;
}

/** Threads use their parent's overwrites instead of category synchronization. */
export function isThread(type: number): boolean {
  return (
    type === ChannelType.AnnouncementThread ||
    type === ChannelType.PublicThread ||
    type === ChannelType.PrivateThread
  );
}

/** Checks implicit message permissions without promising that thread membership or state permits a write. */
export function messagePermissionChecks(bits: bigint, channel: z.output<typeof channelSchema>) {
  const has = (permission: bigint) => (bits & permission) === permission;
  const view = has(PermissionFlagsBits.ViewChannel);
  const voice =
    channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
  const connected = !voice || has(PermissionFlagsBits.Connect);
  const messageChannel =
    isThread(channel.type) ||
    voice ||
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildAnnouncement;
  return {
    view_channel: view,
    read_message_history:
      messageChannel && view && connected && has(PermissionFlagsBits.ReadMessageHistory),
    send_messages:
      messageChannel &&
      view &&
      connected &&
      has(
        isThread(channel.type)
          ? PermissionFlagsBits.SendMessagesInThreads
          : PermissionFlagsBits.SendMessages,
      ),
  };
}
