import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserIcon, MapPinIcon } from "lucide-react";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { ProfileAddresses } from "@/components/profile/ProfileAddresses";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 pl-2">My Account</h1>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-2 h-auto gap-4 bg-transparent">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-left"
          >
            <UserIcon className="h-4 w-4" />
            <div>
              <p className="font-medium">Details</p>
              <p className="text-sm text-muted-foreground">Manage your details</p>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="addresses"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-left"
          >
            <MapPinIcon className="h-4 w-4" />
            <div>
              <p className="font-medium">Addresses</p>
              <p className="text-sm text-muted-foreground">
                Manage delivery addresses
              </p>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <ProfileDetails user={session.user} />
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <Card className="p-6">
            <ProfileAddresses />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
