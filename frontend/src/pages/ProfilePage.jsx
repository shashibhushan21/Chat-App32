import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Camera, Loader, Mail, Phone, User } from 'lucide-react';
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile, checkAuth } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     console.log('Auth User Data:', {
//         fullName: authUser?.fullName,
//         email: authUser?.email,
//         contactNumber: authUser?.contactNumber,
//         fullAuthUser: authUser
//     });
// }, [authUser]);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!authUser && !isLoading) {
    return <Navigate to="/login" replace />
  }





  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // console.log(file);
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image size must be less than 20MB");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        const success = await updateProfile({ profilePic: base64Image });
        // console.log("Upload response:", success);
        if (!success) {
          setSelectedImg(null); // Reset if update fails
          // toast.error("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setSelectedImg(null);
        // toast.error("Failed to update profile picture");
      }
    };
  }
  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || (authUser?.profilePic?.[0]?.url) || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                absolute bottom-0 right-0 
                bg-base-content hover:scale-105
                p-2 rounded-full cursor-pointer 
                transition-all duration-200
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold "> {authUser?.fullName}</h1>
            <p className="mt-2">Your updated profile Picture</p>
          </div>
          <div className="flex justify-center flex-wrap gap-4">
            {authUser?.profilePic.slice(0, 4).map((pic, index) => (
              <img
                key={index}
                src={pic.url}
                alt={`Profile ${index + 1}`}
                className="w-20 h-20 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>



          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Number
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.contactNumber || "Not provided Contact Number"}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span >{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
