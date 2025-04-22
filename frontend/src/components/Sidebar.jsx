import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Plus, X, Circle } from "lucide-react";
import toast from "react-hot-toast";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, addContact } = useChatStore();
  const { onlineUsers = [], authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contactNumber, setContactNumber] = useState("");

  // Fetch contacts when component mounts
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Handle adding new contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    
    if (!contactNumber.trim()) {
      return toast.error("Please enter a contact number");
    }

    if (contactNumber === authUser.contactNumber) {
      return toast.error("You cannot add yourself");
    }

    try {
      await addContact(contactNumber);
      setShowAddModal(false);
      setContactNumber("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Filter users based on online status
  const safeUsers = Array.isArray(users?.users) ? users.users : [];
  const filteredUsers = showOnlineOnly 
    ? safeUsers.filter(user => onlineUsers.includes(user._id))
    : safeUsers;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Add Contacts</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-circle btn-ghost btn-sm"
            title="Add new contact"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {/* Online Filter */}
        <div className="mt-3 lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-1.5 lg:gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs lg:checkbox-sm"
            />
            <span className="text-xs lg:text-sm whitespace-nowrap">
              <span className="lg:hidden">Online</span>
              <span className="hidden lg:inline">Show online only</span>
            </span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300" : ""}`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic?.[0]?.url || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 rounded-full object-cover"
                  onError={(e) => e.target.src = "/avatar.png"}
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>
              
              <div className="hidden lg:block text-left">
                <h3 className="font-medium">{user.fullName}</h3>
                <p className="text-sm text-base-content/70">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online contacts" : "No contacts yet"}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Contact</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Contact Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  className="input input-bordered"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button 
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;