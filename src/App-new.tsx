import { AppProvider } from '@/contexts/AppContext';
import { AppRouter } from '@/components/AppRouter';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
