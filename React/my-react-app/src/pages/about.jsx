import React from 'react';
import './index.css';
import CatPic from '../assets/images/TestPic.jpeg';
import DogPic from '../assets/images/TestPic2.jpeg';

export default function AboutPage() {
  return (
    

    <div className="about-container">
      {/* Jump links */}
      <div className="about-jump-links">
        <a href="#mission">Mission</a>
        <a href="#technology">Technology</a>
        <a href="#why-us">Why Us</a>
      </div>

      {/* Sliding text */}
      <div className="about-slide-up-text">About Collectivity</div>

      <h1>About Us</h1>
      
        {/* From Uiverse.io by PriyanshuGupta28 */}
        <div className="marquee">
          <div className="marquee_header">See the creators!</div>
          <div className="marquee__inner">
            <div className="marquee__group">
              <span className="scroll-image-container"> 
                <span className="picture"> CatPic </span>
                <img src={CatPic} alt = "CatPic"/> 
                </span>
              <span className="scroll-image-container"> 
                <span className="picture"> DogPic </span>
                <img src={DogPic} alt = "DogPic"/> 
                </span>
              <span>🚀 Item 3</span>
              <span>🌟 Item 4</span>
              <span>🎉 Item 5</span>
              <span>🔥 Item 6</span>
              <span>✨ Item 7</span>
              <span>🚀 Item 8</span>
              <span>🌟 Item 9</span>
              <span>🎉 Item 10</span>
              <span>🚀 Item 11</span>
              <span>🌟 Item 12</span>
              <span>🎉 Item 13</span>
            </div>

            <div className="marquee__group">
              <span className="scroll-image-container"> 
                <span className="picture"> CatPic </span>
                <img src={CatPic} alt = "CatPic"/> 
                </span>
              <span className="scroll-image-container"> 
                <span className="picture"> DogPic </span>
                <img src={DogPic} alt = "DogPic"/> 
                </span>
              <span>🚀 Item 3</span>
              <span>🌟 Item 4</span>
              <span>🎉 Item 5</span>
              <span>🔥 Item 6</span>
              <span>✨ Item 7</span>
              <span>🚀 Item 8</span>
              <span>🌟 Item 9</span>
              <span>🎉 Item 10</span>
              <span>🚀 Item 11</span>
              <span>🌟 Item 12</span>
              <span>🎉 Item 13</span>
            </div>
          </div>
        </div>

      

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
          Our platform connects to the blockchain to verify authenticity of each collectible.
          The smart contract ensures all transactions are secure and tamper-proof.
        </p>
      </div>

      <div className="about-card" id="why-us">
        <h2>Why Choose Us?</h2>
        <p>
          From rare Pokémon cards to limited-edition collectibles, we provide a trustworthy marketplace.
        </p>
      </div>

      <button className="about-button">Contact Us</button>
    </div>
  );
}
