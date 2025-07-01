import { AdminSettingsForm } from "../../components/admin/AdminSettingsForm"

export default function AdminSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <p className="text-muted-foreground">Manage your profile and preferences.</p>
      <AdminSettingsForm />
    </div>
  )
}
