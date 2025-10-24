import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { Doc, Id } from "./_generated/dataModel";
import { counts, postCountKey } from "./counter";

type EnrichedPost = Omit<Doc<"post">, "community"> & {
  author: { username: string } | undefined;
  community:
    | {
        _id: Id<"community">;
        name: string;
      }
    | undefined;
  imageUrl?: string;
};

const ERROR_MESSAGES = {
  POST_NOT_FOUND: "Post not found",
  COMMUNITY_NOT_FOUND: "Community not found",
  UNAUTHORIZED_DELETE: "You can't delete this post",
} as const;

export const create = mutation({
  args: {
    subject: v.string(),
    body: v.string(),
    community: v.id("community"),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const postId = await ctx.db.insert("post", {
      subject: args.subject,
      body: args.body,
      community: args.community,
      authorId: user._id,
      image: args.storageId || undefined,
    });
    await counts.inc(ctx, postCountKey(user._id))
    return postId;
  },
});

async function getEnrichedPost(
  ctx: QueryCtx,
  post: Doc<"post">
): Promise<EnrichedPost> {
  const [author, community] = await Promise.all([
    ctx.db.get(post.authorId),
    ctx.db.get(post.community),
  ]);
  const image = post.image && (await ctx.storage.getUrl(post.image));

  return {
    ...post,
    author: author ? { username: author.username } : undefined,
    community: {
      _id: community!._id,
      name: community!.name,
    },
    imageUrl: image ?? undefined,
  };
}

export async function getEnrichedPosts(
  ctx: QueryCtx,
  posts: Doc<"post">[]
): Promise<EnrichedPost[]> {
  return Promise.all(posts.map((post) => getEnrichedPost(ctx, post)));
}

export const getPost = query({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    return getEnrichedPost(ctx, post);
  },
});

export const getCommunityPosts = query({
  args: { communityName: v.string() },
  handler: async (ctx, args): Promise<EnrichedPost[]> => {
    const community = await ctx.db
      .query("community")
      .filter((q) => q.eq(q.field("name"), args.communityName))
      .unique();

    if (!community) return [];

    const posts = await ctx.db
      .query("post")
      .withIndex("byCommunity", (q) => q.eq("community", community._id))
      .collect();

    return getEnrichedPosts(ctx, posts)
  },
});


export const userPosts = query({
  args: { authorUserName: v.string() },
  handler: async (ctx, args): Promise<EnrichedPost[]> => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.authorUserName))
      .unique();

    if (!user) return [];

    const posts = await ctx.db
      .query("post")
      .withIndex("byAuthor", (q) => q.eq("authorId", user._id))
      .collect();

    return getEnrichedPosts(ctx, posts)
  },
});


export const deletePost = mutation({
  args: {id: v.id("post")},
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new ConvexError({message: ERROR_MESSAGES.POST_NOT_FOUND})

    const user = await getCurrentUserOrThrow(ctx)
    if (post.authorId !== user._id) {
      throw new ConvexError({message: ERROR_MESSAGES.UNAUTHORIZED_DELETE})
    }

    await counts.dec(ctx, postCountKey(user._id))

    await ctx.db.delete(args.id)
  }
})

export const search = query({
  args: { queryStr: v.string(), community: v.string() },
  handler: async (ctx, args) => {
    if (!args.queryStr) return [];

    const communityObj = await ctx.db
      .query("community")
      .withIndex("byName", (q) => q.eq("name", args.community))
      .unique();

    if (!communityObj) return [];

    const posts = await ctx.db
      .query("post")
      .withSearchIndex("search_body", (q) =>
        q.search("subject", args.queryStr).eq("community", communityObj._id)
      )
      .take(10);

    return posts.map((post) => ({
      _id: post._id,
      title: post.subject,
      type: "post",
      name: communityObj.name,
    }));
  },
});