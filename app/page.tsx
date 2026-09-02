import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="text-center max-w-2xl bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold text-blue-600 mb-4">
          Online Voting System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the official university election portal. Secure, real-time, and transparent voting.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Note: We will create the /login page next! */}
          <Link 
            href="/login" 
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Login to Vote
          </Link>
        </div>
      </div>
    </main>
  );
}