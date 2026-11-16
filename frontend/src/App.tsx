import AppRouter from "@/routes/AppRouter";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
};

export default App;
