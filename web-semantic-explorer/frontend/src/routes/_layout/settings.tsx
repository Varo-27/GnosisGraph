import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuth from "@/features/auth"
import {
  AppearanceSettings,
  ChangePassword,
  DeleteAccount,
  UserInformation,
} from "@/pages/settings"
import { isLoggedIn } from "@/shared/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

const tabsConfig = [
  { value: "my-profile", title: "Mi perfil", component: UserInformation },
  { value: "password", title: "Contraseña", component: ChangePassword },
  { value: "appearance", title: "Apariencia", component: AppearanceSettings },
  { value: "danger-zone", title: "Zona de peligro", component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Ajustes - Semantic Explorer",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.filter((tab) => tab.value !== "danger-zone")
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes de cuenta</h1>
        <p className="text-muted-foreground">
          Edita tu perfil, contraseña y preferencias de la cuenta.
        </p>
      </div>

      <Tabs defaultValue="my-profile">
        <TabsList>
          {finalTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
