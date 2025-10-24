import { ShardedCounter } from "@convex-dev/sharded-counter"
import {components} from "./_generated/api"
import { Id } from "./_generated/dataModel"

export const counts = new ShardedCounter(
    components.shardedCounter,
    {defaultShards: 1}
)

export function commentCountKey(postId: Id<"post">) {
    return `comments:${postId}`
}

export function postCountKey(userId: Id<"users">) {
    return `posts:${userId}`
}