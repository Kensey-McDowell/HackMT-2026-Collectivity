import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
        <Link to="/intro"><button>Intro</button></Link>
        <Link to="/social"><button>Social</button></Link>
        <Link to="/about"><button>About Us</button></Link>
        <Link to="/profile"><button>User Profile</button></Link>
        <Link to="/settings"><button>Settings</button></Link>
        <Link to="/admin"><button>Admin</button></Link>
        <Link to="/faq"><button>FAQ</button></Link>
        <Link to="/registration"><button>Registration</button></Link>
    </div>
  );
}