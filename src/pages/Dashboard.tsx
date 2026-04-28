import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  MessageCircle,
  MapPin,
  History,
  User,
  Stethoscope,
  Activity,
  Shield,
  ChevronRight,
  Heart,
  Clock,
} from "lucide-react";

const quickActions = [
  {
    title: "AI Health Chat",
    description: "Describe your symptoms and get instant AI guidance",
    icon: MessageCircle,
    link: "/chat",
    color: "from-primary-500 to-emerald-600",
    bgLight: "bg-primary-50 dark:bg-primary-900/20",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  {
    title: "Nearby Hospitals",
    description: "Find hospitals and clinics near your location",
    icon: MapPin,
    link: "/hospitals",
    color: "from-medical-500 to-blue-600",
    bgLight: "bg-medical-50 dark:bg-medical-900/20",
    iconColor: "text-medical-600 dark:text-medical-400",
  },
  {
    title: "Chat History",
    description: "View your previous health consultations",
    icon: History,
    link: "/history",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Your Profile",
    description: "Manage your personal information and preferences",
    icon: User,
    link: "/profile",
    color: "from-orange-400 to-rose-500",
    bgLight: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-500 dark:text-orange-400",
  },
];

const healthTips = [
  { icon: Activity, tip: "Take a 10-minute walk after meals to improve digestion" },
  { icon: Heart, tip: "Practice deep breathing for 5 minutes to reduce stress" },
  { icon: Clock, tip: "Aim for 7-8 hours of quality sleep every night" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-medical-700 p-8 text-white shadow-xl shadow-primary-200/50 dark:shadow-primary-900/30"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Swasthya Sahayak</span>
          </div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="mt-2 text-white/80 max-w-lg">
            Your AI-powered health companion is ready to help. Ask about any symptoms,
            find nearby hospitals, or review your health history.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-lg hover:bg-white/95 transition-all hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              Start Chat
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-all"
            >
              <MapPin className="h-4 w-4" />
              Find Hospitals
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {quickActions.map((action) => (
            <motion.div key={action.title} variants={item}>
              <Link
                to={action.link}
                className="group block rounded-2xl bg-white dark:bg-gray-800 p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bgLight}`}
                  >
                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors mt-2" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Health Tips + Disclaimer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Tips */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            🌿 Daily Wellness Tips
          </h3>
          <div className="space-y-4">
            {healthTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <tip.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{tip.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-6 border border-amber-200 dark:border-amber-700/30"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800/30">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                ⚠️ Important Disclaimer
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                Swasthya Sahayak is an AI-powered health assistant for informational
                purposes only. It does not provide medical diagnosis, treatment, or
                prescription. Always consult a qualified healthcare professional for
                medical concerns. In case of emergency, call <strong>108</strong> or{" "}
                <strong>112</strong> immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
