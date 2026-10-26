/** @fileoverview Reports connection identity and scoped permission checks without hiding partial diagnostic failures. */
import { makeURLSearchParams, type REST } from "@discordjs/rest";
import { Result } from "better-result";
import { Routes, type RESTGetAPICurrentUserGuildsQuery } from "discord-api-types/v10";
import type { InferSchema, ToolExtraArguments, ToolMetadata } from "xmcp";
import { z } from "zod";

import { discordCall, discordRequest } from "../lib/discord";
import { DiscordError } from "../lib/errors";
import {
  applyTimeout,
  channelPermissions,
  describePermissions,
  guildPermissions,
  isThread,
  messagePermissionChecks,
} from "../lib/permissions";
import { channelSchema } from "../lib/schemas/channels.schemas";
import * as schemas from "../lib/schemas/connection.schemas";
import { guildSchema } from "../lib/schemas/guilds.schemas";
import { memberSchema } from "../lib/schemas/members.schemas";
import { roleSchema } from "../lib/schemas/roles.schemas";
import { userGuildSchema, userSchema } from "../lib/schemas/users.schemas";

export const schema = schemas.connectionInput.shape;
export const outputSchema = schemas.connectionOutput.shape;
export const metadata = {
  name: "diagnose_connection",
  description:
    "Check the connected identity and one page of accessible servers. Supply guild_id to inspect roles and permissions, plus channel_id for channel overwrites or inherited thread permissions. Individual checks can fail while other diagnostics remain available. No default server or writes.",
  annotations: {
    title: "Check Discord connection",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    "openai/toolInvocation/invoking": "Checking Discord connection…",
    "openai/toolInvocation/invoked": "Checked Discord connection",
    "anthropic/searchHint":
      "Discord whoami connection setup troubleshooting bot identity servers permissions role hierarchy diagnostics",
  },
} satisfies ToolMetadata;

/** Keeps successful identity and server checks when a selected scope is inaccessible. */
export default function diagnoseConnection(
  input: InferSchema<typeof schema>,
  context: ToolExtraArguments,
) {
  return discordRequest(schemas.connectionInput, schemas.connectionOutput, input, context, {
    summary: metadata._meta["openai/toolInvocation/invoked"],
    workflow: (input, rest, signal) =>
      Result.gen(async function* () {
        const user = yield* Result.await(
          discordCall(userSchema, () => rest.get(Routes.user(), { signal })),
        );
        const listed = await discordCall(z.array(userGuildSchema), () =>
          rest.get(Routes.userGuilds(), {
            query: makeURLSearchParams<RESTGetAPICurrentUserGuildsQuery>({
              limit: input.limit,
              after: input.after,
            }),
            signal,
          }),
        );
        const named = listed.andThen((guilds) =>
          Result.try({
            try: () => {
              const entries = [];
              for (const guild of guilds)
                entries.push({
                  ...guild,
                  permission_names: describePermissions(BigInt(guild.permissions)).names,
                });
              return entries;
            },
            catch: DiscordError.from,
          }),
        );
        const output: z.output<typeof schemas.connectionOutput> = {
          user,
          guilds: named.isOk()
            ? {
                status: "ok",
                items: named.value,
                next_after: named.value.length === input.limit ? named.value.at(-1)?.id : undefined,
              }
            : { status: "error", error: named.error.diagnostic() },
          notes: [
            "Server listing returns one page. Use next_after to continue; the final page can be empty.",
            "Message Content intent and OAuth scopes are not verified by permission bitfields.",
            "Role hierarchy and managed roles can restrict actions even when a permission is enabled.",
          ],
        };
        if (input.guild_id) {
          const inspected = await inspectGuild(
            { guild_id: input.guild_id, user_id: user.id },
            rest,
            signal,
          );
          if (inspected.isErr()) {
            output.guild = { status: "error", error: inspected.error.diagnostic() };
          } else {
            const { guild, member, roles, bits } = inspected.value;
            output.guild = {
              status: "ok",
              id: guild.id,
              name: guild.name,
              owner: guild.owner_id === user.id,
              permissions: describePermissions(applyTimeout(bits, member)),
              roles: roles
                .filter((role) => role.id === guild.id || member.roles.includes(role.id))
                .sort(
                  (left, right) =>
                    right.position - left.position ||
                    left.id.length - right.id.length ||
                    left.id.localeCompare(right.id),
                ),
            };
            if (input.channel_id) {
              const channel = await inspectChannel(
                { guild_id: guild.id, channel_id: input.channel_id, member, bits },
                rest,
                signal,
              );
              output.channel = channel.isOk()
                ? channel.value
                : { status: "error", error: channel.error.diagnostic() };
            }
          }
        }
        return Result.ok(output);
      }),
  });
}

/** Fetches role data only for the explicitly selected server. */
function inspectGuild(
  input: { guild_id: string; user_id: string },
  rest: REST,
  signal: AbortSignal,
) {
  return Result.gen(async function* () {
    const guild = yield* Result.await(
      discordCall(guildSchema, () => rest.get(Routes.guild(input.guild_id), { signal })),
    );
    const member = yield* Result.await(
      discordCall(memberSchema, () =>
        rest.get(Routes.guildMember(input.guild_id, input.user_id), { signal }),
      ),
    );
    const roles = yield* Result.await(
      discordCall(z.array(roleSchema), () =>
        rest.get(Routes.guildRoles(input.guild_id), { signal }),
      ),
    );
    const bits = yield* guildPermissions(guild, member, roles);
    return Result.ok({ guild, member, roles, bits });
  });
}

/** Uses parent overwrites for threads and refuses channels from a different server. */
function inspectChannel(
  input: {
    guild_id: string;
    channel_id: string;
    member: z.output<typeof memberSchema>;
    bits: bigint;
  },
  rest: REST,
  signal: AbortSignal,
): Promise<Result<z.output<typeof schemas.channelCheckSchema>, DiscordError>> {
  return Result.gen(async function* () {
    const channel = yield* Result.await(
      discordCall(channelSchema, () => rest.get(Routes.channel(input.channel_id), { signal })),
    );
    if (channel.guild_id !== input.guild_id)
      return Result.err(
        new DiscordError({
          message: "The channel does not belong to the selected server.",
          hint: "Use the channel's guild_id and rerun diagnose_connection.",
        }),
      );
    let source = channel;
    if (isThread(channel.type)) {
      if (!channel.parent_id)
        return Result.err(
          new DiscordError({ message: "Discord did not return the thread's parent channel ID." }),
        );
      const parentId = channel.parent_id;
      source = yield* Result.await(
        discordCall(channelSchema, () => rest.get(Routes.channel(parentId), { signal })),
      );
      if (source.guild_id !== input.guild_id)
        return Result.err(
          new DiscordError({
            message: "The thread's parent does not belong to the selected server.",
          }),
        );
    }
    const overwritten = yield* channelPermissions(input.bits, input.member, source);
    const bits = applyTimeout(overwritten, input.member);
    return Result.ok({
      status: "ok",
      channel,
      overwrites_from_channel_id: source.id,
      permissions: describePermissions(bits),
      permission_checks: messagePermissionChecks(bits, channel),
      notes: [
        "Permission checks account for ViewChannel, message permissions, and voice Connect. They do not verify Message Content intent.",
        ...(isThread(channel.type)
          ? [
              "Thread membership and archived or locked state can also prevent access or sending. See thread_metadata.",
            ]
          : []),
      ],
    } satisfies z.output<typeof schemas.channelCheckSchema>);
  });
}
