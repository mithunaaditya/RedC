import { useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import "../styles/CommunityPage.css";

const CommunityPage = () => {
  const { communityName } = useParams();
  const community = useQuery(api.community.get, { name: communityName || "" });

  if (community === undefined) return <p>Loading...</p>;

  if (!community) {
    return (
      <div className="content-container">
        <div className="not-found">
          <h1>Subreddit not found</h1>
          <p>The subreddit c/{communityName} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="subreddit-banner">
        <h1>c/{community.name}</h1>
        {community.description && <p>{community.description}</p>}
      </div>
      <div className="posts-container">
        {community.posts?.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet.</p>
          </div>
        ) : (
          community.posts?.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
