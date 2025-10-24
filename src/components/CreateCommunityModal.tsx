import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Fieldset,
  Field,
  Label,
  Input,
  Textarea,
} from "@headlessui/react";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCommunityModal = ({
  isOpen,
  onClose,
}: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createCommunity = useMutation(api.community.create);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Enter Name.");
    }

    if (name.length < 3 || name.length > 21) {
      setError("Name must be 3-21 characters.");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError("Nmae can contain only letters, numbers, and underscores.");
    }

    setIsLoading(true);
    await createCommunity({ name, description })
      .then((result) => {
        console.log(result);
        onClose();
      })
      .catch((err) => {
        setError(`Failed to create Community. ${err.data.message}`);
      })
      .finally(() => setIsLoading(false));
  };

  return (
  <>
    <Dialog open={isOpen} onClose={onClose} className="z-[1000]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1000]" />

      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 z-[1001] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 bg-white rounded">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#edeff1]">
          <h2 className="text-[16px] font-medium text-[#1c1c1c] m-0">
            Create Community
          </h2>
          <button
            onClick={onClose}
            className="bg-none border-none text-[24px] text-[#878a8c] w-6 h-6 flex items-center justify-center hover:text-[#1c1c1c] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-4 py-6">
          {/* Name Field */}
          <div className="mb-6 relative">
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-[#1c1c1c]"
            >
              Name <span className="text-[#878a8c] font-normal">(required)</span>
            </label>
            <span className="absolute left-3 top-[35px] text-[#878a8c] text-[14px]">
              c/
            </span>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full pl-7 pr-3 py-2 text-[14px] border border-[#edeff1] rounded bg-white text-black focus:border-[#0079d3] focus:outline-none disabled:bg-[#f6f7f8] disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Description Field */}
          <div className="mb-6 relative">
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-[#1c1c1c]"
            >
              Description <span className="text-[#878a8c] font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full p-2 text-[14px] border border-[#edeff1] rounded bg-white text-black min-h-[120px] resize-y focus:border-[#0079d3] focus:outline-none disabled:bg-[#f6f7f8] disabled:cursor-not-allowed transition-colors"
            ></textarea>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-[#ea0027] text-[14px] mb-4">{error}</div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-1 text-[14px] font-bold rounded-full border border-[#0079d3] text-[#0079d3] hover:bg-[rgba(0,121,211,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1 text-[14px] font-bold rounded-full bg-[#0079d3] text-white hover:bg-[#1484d7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-8"
            >
              {isLoading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  </>
);

};

export default CreateCommunityModal;
