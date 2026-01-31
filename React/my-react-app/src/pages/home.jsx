import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      <Link to="/intro">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Intro
        </button>
      </Link>
      <Link to="/social">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Social
        </button>
      </Link>
      <Link to="/about">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          About Us
        </button>
      </Link>
      <Link to="/profile">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          User Profile
        </button>
      </Link>
      <Link to="/settings">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Settings
        </button>
      </Link>
      <Link to="/admin">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Admin
        </button>
      </Link>
      <Link to="/faq">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          FAQ
        </button>
      </Link>
      <Link to="/registration">
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Registration
        </button>
      </Link>
    </div>
  );
}
