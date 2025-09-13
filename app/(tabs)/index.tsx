import { Redirect } from "expo-router";

export default function Index() {
  // When app opens, send users directly to login
  return <Redirect href="/(auth)/login" />;
}
