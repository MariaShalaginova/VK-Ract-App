import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CatFactComponent from "../widgets/request-block";
import AgeComponent from "../widgets/search-block/ui";

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <CatFactComponent />
        <AgeComponent />
    </QueryClientProvider>
  );
}