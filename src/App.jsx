import Header from "./components/Header.jsx";
import ModePills from "./components/ModePills.jsx";
import Translator from "./components/Translator.jsx";
import Examples from "./components/Examples.jsx";
import Footer from "./components/Footer.jsx";
import { TranslationProvider } from "./context/TranslationContext.jsx";

export default function App() {
  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-6 sm:pt-8">
          <ModePills />
          <Translator />
          <Examples />
        </main>
        <Footer />
      </div>
    </TranslationProvider>
  );
}
