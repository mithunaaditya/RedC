import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    externalId: v.string(),
  })
    .index("byUsername", ["username"])
    .index("byExternalId", ["externalId"]),
  community: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    authorId: v.id("users"),
  })
    .index("byName", ["name"])
    .searchIndex("search_body", { searchField: "name" }),
  post: defineTable({
    subject: v.string(),
    body: v.string(),
    community: v.id("community"),
    authorId: v.id("users"),
    image: v.optional(v.id("_storage")),
  })
    .searchIndex("search_body", {
      searchField: "subject",
      filterFields: ["community"],
    })
    .index("byCommunity", ["community"])
    .index("byAuthor", ["authorId"]),
  comments: defineTable({
    content: v.string(),
    postId: v.id("post"),
    authorId: v.id("users"),
  }).index("byPost", ["postId"]),
  downvote: defineTable({
    postId: v.id("post"),
    userId: v.id("users"),
  })
    .index("byPost", ["postId"])
    .index("byUser", ["userId"]),
  upvote: defineTable({
    postId: v.id("post"),
    userId: v.id("users"),
  })
    .index("byPost", ["postId"])
    .index("byUser", ["userId"]),
});
