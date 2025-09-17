import { AppProviders } from "@/redux/provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
