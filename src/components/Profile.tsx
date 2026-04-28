import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  Bell,
  LogOut,
  CheckCircle,
  Camera,
  ChevronRight,
} from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Profile updated successfully!");
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Your Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-medical-500 text-white text-2xl font-bold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-primary-600 shadow-sm transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {user?.name || "User"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email || "user@example.com"}
            </p>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-xs font-medium text-primary-600 dark:text-primary-400">
              <CheckCircle className="h-3 w-3" />
              Verified Account
            </span>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          Preferences
        </h3>
        <div className="space-y-3">
          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {darkMode ? "Switch to light mode" : "Switch to dark mode"}
                </p>
              </div>
            </div>
            <div
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkMode ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkMode ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Notifications */}
          <div className="w-full flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-medical-50 dark:bg-medical-900/20">
                <Bell className="h-5 w-5 text-medical-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Notifications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive health tips and reminders
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </motion.div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your data is encrypted and stored securely. We never share your personal
          information with third parties.
        </p>
      </div>
    </div>
  );
}
