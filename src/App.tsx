import { HomePage } from "@/app/page";

export interface AppProps {
  hasSupabaseConfig?: boolean;
}

export function App({ hasSupabaseConfig }: AppProps) {
  return <HomePage hasConfiguredSupabase={hasSupabaseConfig} />;
}

export default App;
