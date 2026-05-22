import ChoreChart from "@/components/chore-chart/ChoreChart";
import { ThemeProvider } from "@/context/theme-provider";
import { Layout } from "@/components/ui/layout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Layout>
        <ChoreChart />
      </Layout>
    </ThemeProvider>
  );
}

export default App;