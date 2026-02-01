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
          We make buying and selling collectibles safe, transparent, and fun!
          Every item is authenticated through our blockchain smart contract.
        </p>
      </div>

      <div className="about-card" id="technology">
        <h2>Our Technology</h2>
        <p>
          Our platform connects to the blockchain to verify authenticity of each
          collectible. The smart contract ensures all transactions are secure and
          tamper-proof.
        </p>
      </div>

      <div className="about-card" id="why-us">
        <h2>Why Choose Us?</h2>
        <p>
          From rare Pokémon cards to limited-edition collectibles, we provide a
          trustworthy marketplace.
        </p>
      </div>

      <button className="about-button">Contact Us</button>
    </div>
  );
}