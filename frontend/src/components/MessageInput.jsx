import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { Image, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreviews, setImagePreviews] = useState([]) // Change to array
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef(null)
  const { sendMessage } = useChatStore()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    files.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`)
        return
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 20MB)`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() && imagePreviews.length === 0) return

    
    // console.log("Message Data", messageData );
    const loadingToast = imagePreviews.length > 0 ? 
      toast.loading("Sending images...") : null

      setIsSending(true)
    try {
      await sendMessage({
        text: text.trim(),
        images: imagePreviews // Send array of images
      })

      

      if (loadingToast) {
        toast.success("Images sending successfully", { id: loadingToast })
      }

      setText("")
      setImagePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error("Failed to send message")
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }

  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 mt-auto z-10">
      {imagePreviews.length > 0 && (
        <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-base-300"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center hover:bg-base-200"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            multiple // Enable multiple file selection
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex btn btn-circle btn-sm
                     ${imagePreviews.length > 0 ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && imagePreviews.length === 0}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput