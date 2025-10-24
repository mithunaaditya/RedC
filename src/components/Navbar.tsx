import { FaReddit, FaUser, FaPlus } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDropdown";
import { Menu, MenuButton, Button } from "@headlessui/react";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="h-16 bg-gray-800 text-white">
      {/* NavContent */}
      <div className="flex items-center justify-between py-2 px-4">
        {/* Logo */}
        <Link to="/">
          <div className="flex items-center">
            <FaReddit className="h-12 w-12" />
            <span className="pl-2">RedC</span>
          </div>
        </Link>

        {/* SearchBar */}
        <div className="flex"><SearchBar /></div>

        {/* Actions */}
        <div>
          {/* Not Logged In */}
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </Unauthenticated>
          {/* Logged In */}
          <Authenticated>
            <div className="flex gap-1 items-center">
              {/* Creation DropDown */}
              <Menu>
                <MenuButton className="hover:bg-gray-500 rounded p-3">
                  <FaPlus className="size-4" />
                </MenuButton>
                <CreateDropdown />
              </Menu>

              {/* Profile */}
              <Button
                className="hover:bg-gray-500 rounded p-3 mr-3"
                onClick={() =>
                  user?.username && navigate(`/u/${user.username}`)
                }
                title="View Profile"
              >
                <FaUser className="size-4"/>
              </Button>
              {/* Clerk Profile */}
              <UserButton />
            </div>
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
