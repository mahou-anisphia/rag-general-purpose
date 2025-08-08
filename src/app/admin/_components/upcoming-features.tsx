import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function UpcomingFeatures() {
  const features = [
    { title: "User Management", desc: "Invite, roles, permissions." },
    { title: "Chat Management", desc: "Moderation, retention, exports." },
    { title: "Cost Analysis", desc: "Per-user, per-model, per-source." },
    { title: "Database Status", desc: "Tables, sizes, vector health." },
    { title: "Module Services", desc: "Embedders, retrievers, gateways." },
    { title: "System Settings", desc: "Keys, providers, feature flags." },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Admin Features</CardTitle>
        <CardDescription>Planned expansions for administrative functionality.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
