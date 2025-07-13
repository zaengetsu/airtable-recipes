import Link from 'next/link';

export default function SimpleHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="sr-only">AirCook - Retour à l'accueil</span>
          <img 
            src="/aircooklogo.png" 
            alt="AirCook Logo" 
            className="h-10 w-auto"
          />
        </Link>
      </div>
    </header>
  );
} 