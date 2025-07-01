import { useState } from "react"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"

export default function MemberSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [theme, setTheme] = useState("light")

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Email Notifications */}
      <div className="flex items-center justify-between">
        <Label htmlFor="email">Email Notifications</Label>
        <Switch id="email" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
      </div>

      {/* Theme Preference */}
      <div className="space-y-2">
        <Label>Preferred Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Password Placeholder */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">Password change feature will be added in the future.</p>
      </div>
    </div>
  )
}
