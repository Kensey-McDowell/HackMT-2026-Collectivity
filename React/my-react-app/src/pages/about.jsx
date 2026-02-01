import React from 'react';
import './about.css';
import GavinPic from '../assets/images/Gavin.png';
import KenseyPic from '../assets/images/Kensey.png';
import ErikPic from '../assets/images/Erik.png';
import RileyPic from '../assets/images/Erik.png';
import DevinPic from '../assets/images/Devin.png';
import VincentPic from '../assets/images/Vincent.png';
import VivianPic from '../assets/images/Vivian.png';
import CamPic from '../assets/images/Cam.png';
import AlexPic from '../assets/images/Alex.png';
import DrewPic from '../assets/images/Drew.png';
import CatPic from '../assets/images/goofyahcat.png';
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

      
        {/* From Uiverse.io by PriyanshuGupta28 */}
        <div className="marquee">
          <div className="marquee_header">See the creators!</div>
          <div className="marquee__inner">
            <div className="marquee__group">
              <span className="scroll-image-container"> 
                <img src={GavinPic} alt = "GavinPic"/> 
                <span className="picture"> Gavin Liles</span>
                </span>
              <span className="scroll-image-container"> 
                <img src={KenseyPic} alt = "KenseyPic"/> 
                <span className="picture"> Kensey McDowell </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={ErikPic} alt = "ErikPic"/> 
                <span className="picture"> Erik Apruda </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={RileyPic} alt = "RileyPic"/> 
                <span className="picture"> Riley Wells </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={DevinPic} alt = "DevinPic"/> 
                <span className="picture"> Devin Latham </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={VincentPic} alt = "VincentPic"/> 
                <span className="picture"> Vincent Truong </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={VivianPic} alt = "VivianPic"/> 
                <span className="picture"> Vivian O'Connor </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CamPic} alt = "CamPic"/> 
                <span className="picture"> Camille Murnane </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={AlexPic} alt = "AlexPic"/> 
                <span className="picture"> Alex Guzman </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={DrewPic} alt = "DrewPic"/> 
                <span className="picture"> Drew Hammer </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "AlecPic"/> 
                <span className="picture"> Alec Creasy </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "TristenPic"/> 
                <span className="picture"> Tristen Onate </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "JackPic"/> 
                <span className="picture"> Jack Quinn </span>
                </span>
            </div>

            <div className="marquee__group">
              <span className="scroll-image-container"> 
                <img src={GavinPic} alt = "GavinPic"/> 
                <span className="picture"> Gavin Liles </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={KenseyPic} alt = "KenseyPic"/> 
                <span className="picture"> Kensey McDowell </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={ErikPic} alt = "ErikPic"/> 
                <span className="picture"> Erik Apruda </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={RileyPic} alt = "RileyPic"/> 
                <span className="picture"> Riley Wells</span>
                </span>
              <span className="scroll-image-container"> 
                <img src={DevinPic} alt = "DogPic"/> 
                <span className="picture"> Devin Latham </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={VincentPic} alt = "DogPic"/> 
                <span className="picture"> Vincent Truong </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={VivianPic} alt = "DogPic"/> 
                <span className="picture"> Vivian O'Connor </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CamPic} alt = "DogPic"/> 
                <span className="picture"> Camille Murnane </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={AlexPic} alt = "DogPic"/> 
                <span className="picture"> Alex Guzman </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={DrewPic} alt = "DrewPic"/> 
                <span className="picture"> Drew Hammer </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "AlecPic"/> 
                <span className="picture"> Alec Creasy </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "TristenPic"/> 
                <span className="picture"> Tristen Onate </span>
                </span>
              <span className="scroll-image-container"> 
                <img src={CatPic} alt = "JackPic"/> 
                <span className="picture"> Jack Quinn</span>
                </span>
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
