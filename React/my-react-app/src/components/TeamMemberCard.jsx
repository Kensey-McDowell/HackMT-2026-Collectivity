import { useState } from "react";
import "./TeamMemberCard.css";

export default function TeamMemberCard({ member }) {
  const [locked, setLocked] = useState(false);

  const handleClick = () => setLocked((prev) => !prev);

  return (
    <div
      className={`team-card ${locked ? "locked" : ""}`}
      onClick={handleClick}
    >
      <div className="team-card-inner">
        {/* --- Front --- */}
        <div className="team-card-front">
          <img 
            src={member.image} 
            alt={member.name} 
            className={member.name.toLowerCase()}/>
          <div className="team-card-front-content">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        </div>

        {/* --- Back --- */}
        <div className="team-card-back">
          <h3>{member.name}</h3>
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${member.email}`}>Email</a>
        </div>
      </div>
    </div>
  );
}