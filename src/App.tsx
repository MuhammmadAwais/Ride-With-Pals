import { ThemeProvider } from 'next-themes';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AppRouter />
    </ThemeProvider>
  );
}