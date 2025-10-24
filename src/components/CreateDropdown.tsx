import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Button,
} from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDropdown = () => {
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const commatch = location.pathname.match(/^\/c\/([^/]+)/);
  const currentcom = commatch ? commatch[1] : null;

  const handleCreatePost = () => {
    if (currentcom) {
      navigate(`/c/${currentcom}/submit`);
    }
  };

  const handleCreateCommunity = () => {
    setIsCommunityModalOpen(true);
  };

  return (
    <>
      <MenuItems anchor="bottom" className="bg-gray-500 m-3 rounded p-3 flex flex-col">
        {currentcom && (
          <>
            <MenuItem>
              <button
                onClick={handleCreatePost}
                className="flex w-full items-center gap-2 p-2 rounded
              hover:bg-gray-600"
              >
                <FaPlus />
                <div className="flex flex-col items-start">
                  <span>Post</span>
                  <span className="text-sm text-gray-300 whitespace-nowrap">
                    Share to c/{currentcom}
                  </span>
                </div>
              </button>
            </MenuItem>
            <div className="my-1 h-px bg-black/20" />
          </>
        )}

        <MenuItem>
          <button
            onClick={handleCreateCommunity}
            className="flex w-full items-center gap-2 p-2 rounded
          hover:bg-gray-600"
          >
            <FaPlus />
            <div className="flex flex-col items-start">
              <span>Community</span>
              <span className="text-sm text-gray-300">
                Create Community
              </span>
            </div>
          </button>
        </MenuItem>
      </MenuItems>

      {isCommunityModalOpen && (
        <CreateCommunityModal
          isOpen={isCommunityModalOpen}
          onClose={() => {
            setIsCommunityModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CreateDropdown;
