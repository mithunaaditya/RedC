import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { getEnrichedPosts } from "./post";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = getCurrentUserOrThrow(ctx);
    const communities = await ctx.db.query("community").collect();

    if (communities.some((s) => s.name === args.name)) {
      throw new ConvexError({ message: "Community already exists" });
    }

    await ctx.db.insert("community", {
      name: args.name,
      description: args.description,
      authorId: (await user)._id,
    });
  },
});

export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("community")
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (!community) return null;

    const posts = await ctx.db
      .query("post")
      .withIndex("byCommunity", (q) => q.eq("community", community._id))
      .collect();

    const encrichedPosts = await getEnrichedPosts(ctx, posts);

    return { ...community, posts: encrichedPosts };
  },
});

export const search = query({
  args: { queryStr: v.string() },
  handler: async (ctx, args) => {
    if (!args.queryStr) return [];

    const communities = await ctx.db
      .query("community")
      .withSearchIndex("search_body", (q) => q.search("name", args.queryStr))
      .take(10);

    return communities.map((com) => {
      return { ...com, type: "community", title: com.name };
    });
  },
});
