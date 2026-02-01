// src/pages/AboutPage.jsx
import React from "react";
import "./about.css";
import { teamMembers } from "./data/teamMembers.js";
import TeamMemberCard from "../components/TeamMemberCard";

export default function AboutPage() {
  return (
    <div className="about-container">

      {/* Sliding text */}
      <div className="about-slide-up-text">About Collectivity</div>

      {/* Team Carousel / Marquee */}
      <div className="marquee">
        <div className="marquee_header">See the creators!</div>
        <div className="marquee__inner">
          {/* First group for continuous scroll */}
          <div className="marquee__group">
            {teamMembers.map((member, idx) => (
              <div key={`team-a-${idx}`} className="scroll-image-container">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>

          {/* Duplicate group for infinite scroll */}
          <div className="marquee__group">
            {teamMembers.map((member, idx) => (
              <div key={`team-b-${idx}`} className="scroll-image-container">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="about-card" id="mission">
        <h2>Our Mission</h2>
        <p>
          We make collecting safer and more enjoyable by removing uncertainty from every trade. 
          Collectivity creates a space where buyers and sellers can interact with confidence instead of risk. 
          Our goal is to turn collectibles into assets people trust, not transactions they worry about.
        </p>
      </div>

      <div className="about-card" id="technology">
        <h2>Our Technology</h2>
        <p>
          Collectivity runs on blockchain-backed verification to confirm each item’s authenticity. 
          Smart contracts handle transactions automatically, preventing tampering and disputes. 
          The result is a system that stays transparent without slowing users down.
        </p>
      </div>

      <div className="about-card" id="why-us">
        <h2>Why Choose Us?</h2>
        <p>
          Collectivity is built for collectors who value confidence as much as rarity. 
          Whether you’re trading Pokémon cards or limited releases, our platform keeps the process simple and dependable. 
          You focus on the collection — we handle the protection.
        </p>
      </div>

      <button className="about-button">Contact Us</button>
    </div>
  );
}