"use client"

import { motion } from "framer-motion"
import { Mail, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import type { ProfileData } from "@/types/settings"

interface ProfileSectionProps {
  profileData: ProfileData
  setProfileData: (data: ProfileData) => void
  isLoading: boolean
  handleSave: (section: string) => void
}

export const ProfileSection = ({ profileData, setProfileData, isLoading, handleSave }: ProfileSectionProps) => {
  const { updateProfile } = useAuth()

  const handleProfileSave = async () => {
    const result = await updateProfile(profileData.name, profileData.email)
    if (result.success) {
      handleSave("profile")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={profileData.name}
          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
          className="transition-all focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="pl-10 transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" value={profileData.role} disabled className="bg-gray-50 cursor-not-allowed" />
        <p className="text-xs text-gray-500">Your role is managed by administrators</p>
      </div>

      <Button onClick={handleProfileSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Settings className="h-4 w-4 mr-2" />
          </motion.div>
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Profile
      </Button>
    </motion.div>
  )
}
