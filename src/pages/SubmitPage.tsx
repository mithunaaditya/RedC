import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaImage } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const SubmitPage = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();
  const community = useQuery(api.community.get, { name: communityName || "" });

  if (community === undefined) return <p>Loading...</p>;

  if (!community) {
    return (
      <div>
        <h1>Community not found</h1>
        <p>The community {communityName} does not exist</p>
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.post.create);
  const generateUploadUrl = useMutation(api.image.generateUploadUrl);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5 Mb");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !community) {
      alert("Please enter title and select a community");
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = undefined;
      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) throw new Error("Failed to upload image");

        const { storageId } = await result.json();
        imageUrl = storageId;
      }
      await createPost({
        subject: title.trim(),
        body: body.trim(),
        community: community._id,
        storageId: imageUrl
      });
      navigate(`/c/${communityName}`);
    } catch (error) {
      console.log(error);
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="max-w-[740px] mx-auto px-5 pt-[69px]">
    <div className="bg-white rounded border border-gray-300 p-6">
      <h1 className="text-[18px] font-medium mb-5 text-[#1a1a1b]">Create Post</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title Input */}
        <input
          type="text"
          id="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="w-full p-4 text-[18px] font-medium border border-[#edeff1] rounded bg-white text-[#1c1c1c] placeholder-[#878a8c] focus:border-[#0079d3] focus:outline-none transition-colors duration-200"
        />

        {/* Image Upload */}
        <div className="border border-[#edeff1] rounded p-4 bg-white">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#f6f7f8] border border-[#edeff1] rounded cursor-pointer text-[#1c1c1c] text-[14px] hover:bg-[#e9ecef] transition-colors duration-200">
            <FaImage className="text-[18px] text-[#0079d3]" />
            Upload Image
            <input
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="mt-4 relative inline-block w-[500px] h-[300px] overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain bg-[#f6f7f8] rounded"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-[rgba(26,26,27,0.8)] rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-[rgba(26,26,27,1)] transition-colors"
              >
                <IoMdClose className="text-sm" />
              </button>
            </div>
          )}
        </div>

        {/* Body Textarea */}
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something..."
          className="w-full min-h-[200px] p-3 text-[14px] border border-[#edeff1] rounded bg-white text-[#1c1c1c] placeholder-[#878a8c] resize-y focus:border-[#0079d3] focus:outline-none transition-colors duration-200"
        ></textarea>

        {/* Buttons */}
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={() => navigate(`/c/${communityName}`)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded bg-[#e9e9e9] text-[#1a1a1b] font-semibold hover:bg-[#d7d7d7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 rounded bg-[#0079d3] text-white font-semibold hover:bg-[#0061a9] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default SubmitPage;
