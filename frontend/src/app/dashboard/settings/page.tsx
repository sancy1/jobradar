"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Trash2,
  Check,
  MapPin,
  Briefcase,
  Globe,
  Wifi,
  Save,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { countries, seniorityOptions } from "@/lib/search-config";

const accentColors = [
  { name: "Indigo", value: "245 58% 51%", hover: "245 58% 46%" },
  { name: "Blue", value: "217 91% 60%", hover: "217 91% 55%" },
  { name: "Emerald", value: "142 71% 45%", hover: "142 71% 40%" },
  { name: "Rose", value: "347 77% 50%", hover: "347 77% 45%" },
  { name: "Amber", value: "38 92% 50%", hover: "38 92% 45%" },
  { name: "Cyan", value: "189 94% 43%", hover: "189 94% 38%" },
];

const PREFERENCES_KEY = "jobradar_preferences";
const NOTIFICATIONS_KEY = "jobradar_notifications";
const ACCENT_KEY = "jobradar_accent";

interface Preferences {
  defaultKeywords: string[];
  defaultLocation: string;
  defaultSeniority: string;
  defaultRemoteOnly: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  newsletter: boolean;
}

const defaultPreferences: Preferences = {
  defaultKeywords: [],
  defaultLocation: "",
  defaultSeniority: "mid",
  defaultRemoteOnly: false,
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  inAppNotifications: true,
  newsletter: false,
};

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [keywordInput, setKeywordInput] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [accentColor, setAccentColor] = useState(accentColors[0]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
    if (storedPrefs) setPreferences(JSON.parse(storedPrefs));
    const storedNotifs = localStorage.getItem(NOTIFICATIONS_KEY);
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    const storedAccent = localStorage.getItem(ACCENT_KEY);
    if (storedAccent) {
      const found = accentColors.find((c) => c.name === storedAccent);
      if (found) setAccentColor(found);
    }
  }, []);

  const applyAccentColor = (color: (typeof accentColors)[0]) => {
    setAccentColor(color);
    const root = document.documentElement;
    root.style.setProperty("--primary", color.value);
    root.style.setProperty("--primary-hover", color.hover);
    root.style.setProperty("--ring", color.value);
    root.style.setProperty("--sidebar-accent", color.value);
    localStorage.setItem(ACCENT_KEY, color.name);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && preferences.defaultKeywords.length < 20) {
      setPreferences({
        ...preferences,
        defaultKeywords: [...preferences.defaultKeywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setPreferences({
      ...preferences,
      defaultKeywords: preferences.defaultKeywords.filter((k) => k !== kw),
    });
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    const stored = localStorage.getItem("jobradar_user");
    if (stored) {
      const userData = JSON.parse(stored);
      userData.name = name;
      localStorage.setItem("jobradar_user", JSON.stringify(userData));
    }
    setIsSavingProfile(false);
    toast.success("Profile updated successfully!");
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    setIsSavingPrefs(false);
    toast.success("Preferences saved!");
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    setIsSavingNotifs(false);
    toast.success("Notification settings saved!");
  };

  const handleDeleteAccount = async () => {
    localStorage.removeItem("jobradar_user");
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    localStorage.removeItem(ACCENT_KEY);
    toast.success("Account deleted. Redirecting...");
    setTimeout(() => {
      window.location.href = "/auth/signin";
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your account, preferences, and notifications
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <SettingsCard
            icon={UserIcon}
            title="Profile"
            description="Your personal information"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-xl font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Avatar from {user?.provider ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) : "N/A"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Profile picture is loaded from your OAuth provider
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="h-10 bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400">Email cannot be changed</p>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </SettingsCard>

          {/* Preferences Section */}
          <SettingsCard
            icon={SettingsIcon}
            title="Preferences"
            description="Default settings for your job search"
          >
            <div className="space-y-5">
              {/* Default Keywords */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Default Keywords</Label>
                  <InfoTooltip text="These keywords will be pre-filled when you create a new search" />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                    placeholder="Add a keyword..."
                    className="flex-1 h-10"
                  />
                  <Button
                    onClick={handleAddKeyword}
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    Add
                  </Button>
                </div>
                {preferences.defaultKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {preferences.defaultKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="cursor-pointer text-xs"
                        onClick={() => handleRemoveKeyword(kw)}
                      >
                        {kw}
                        <span className="ml-1 text-slate-400">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Default Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Default Location Preference</Label>
                  <InfoTooltip text="Your preferred country for job searches" />
                </div>
                <Select
                  value={preferences.defaultLocation}
                  onValueChange={(v) =>
                    setPreferences({ ...preferences, defaultLocation: v })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Seniority */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Default Seniority</Label>
                  <InfoTooltip text="Your preferred experience level" />
                </div>
                <Select
                  value={preferences.defaultSeniority}
                  onValueChange={(v) =>
                    setPreferences({ ...preferences, defaultSeniority: v })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorityOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Remote Only Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-slate-500" />
                  <Label className="text-sm font-medium cursor-pointer">
                    Default Remote Only
                  </Label>
                  <InfoTooltip text="Only show remote jobs by default" />
                </div>
                <Switch
                  checked={preferences.defaultRemoteOnly}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, defaultRemoteOnly: checked })
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs}
                  variant="outline"
                  className="min-h-[44px]"
                >
                  {isSavingPrefs ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SettingsCard>

          {/* Notifications Section */}
          <SettingsCard
            icon={Bell}
            title="Notifications"
            description="Choose what you want to be notified about"
          >
            <div className="space-y-1">
              <NotificationToggle
                label="Email Notifications"
                description="Receive job alerts and updates via email"
                checked={notifications.emailNotifications}
                onChange={(v) =>
                  setNotifications({ ...notifications, emailNotifications: v })
                }
              />
              <Separator />
              <NotificationToggle
                label="In-App Notifications"
                description="Show notifications within the app"
                checked={notifications.inAppNotifications}
                onChange={(v) =>
                  setNotifications({ ...notifications, inAppNotifications: v })
                }
              />
              <Separator />
              <NotificationToggle
                label="Newsletter"
                description="Monthly newsletter with job market insights"
                checked={notifications.newsletter}
                onChange={(v) =>
                  setNotifications({ ...notifications, newsletter: v })
                }
              />
            </div>
            <div className="mt-6">
              <Button
                onClick={handleSaveNotifications}
                disabled={isSavingNotifs}
                variant="outline"
                className="min-h-[44px]"
              >
                {isSavingNotifs ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
          </SettingsCard>

          {/* Theme Section */}
          <SettingsCard
            icon={Palette}
            title="Appearance"
            description="Customize how JobRadar looks"
          >
            <div className="space-y-6">
              {/* Theme Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme</Label>
                {mounted && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: "Light", icon: "☀️" },
                      { value: "dark", label: "Dark", icon: "🌙" },
                      { value: "system", label: "System", icon: "💻" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[80px]",
                          "touch-target",
                          theme === t.value
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <span className="text-sm font-medium">{t.label}</span>
                        {theme === t.value && (
                          <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Accent Color Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Accent Color</Label>
                <div className="flex flex-wrap gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => applyAccentColor(color)}
                      className={cn(
                        "h-12 w-12 rounded-full transition-all relative",
                        "touch-target",
                        accentColor.name === color.name
                          ? "ring-2 ring-offset-2 ring-offset-background ring-slate-400 scale-110"
                          : "hover:scale-105"
                      )}
                      style={{
                        backgroundColor: `hsl(${color.value})`,
                      }}
                      aria-label={color.name}
                    >
                      {accentColor.name === color.name && (
                        <Check className="h-5 w-5 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Current: {accentColor.name}
                </p>
              </div>
            </div>
          </SettingsCard>

          {/* Danger Zone */}
          <Card className="p-6 border-2 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Irreversible actions. Proceed with caution.
                </p>
              </div>
            </div>

            <Separator className="bg-red-200 dark:bg-red-900/50 mb-4" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Delete Account
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="min-h-[44px] w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently
                      delete your account data, preferences, and saved searches
                      from this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
          <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <Separator className="mb-6" />
      {children}
    </Card>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <Label className="text-sm font-medium cursor-pointer">{label}</Label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <span className="text-xs">ⓘ</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[200px]">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
