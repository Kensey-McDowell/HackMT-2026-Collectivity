import React, { useState } from "react";
import './FAQ.css';

export function FAQSection({section}){
    const [open, setOpen] = useState(null);

    function toggle(i){
      setOpen(open === i ? null : i); // what like an if else statement 
    }

    return (// either map or toggle is messing up the button
      <div> 
        <h2>{section.header}</h2> 
        {section.questions.map((item,i) => (// links the button and text under it as one so they size as one 
          <div>
            <button onClick={() => toggle (i)}>{item.q}</button> 
            {open === i && <p>{item.a}</p>} 
            </div> // prints answer if index is at item.a
        ))}
      </div>
    )
}


export default function FAQPage() { 
  const data = [
    {
      header: "The Collection Ecosystem",
      questions: [ // array that stores questions and answers to each
        {q:"How does ownership move within the blockchain?", a:"When you buy an item, the ledger updates to record your unique wallet address as the permanent owner. Because your collectible is stored on the blockchain rather than a private server, you have the total freedom to move it to your own secure wallet or trade it on any global marketplace."},
        {q:"What type of products are sold?", a:"We have a diverse selection of pop culture, ranging from Mint PSA 10 Pokemon Cards to pristine vintage gaming console cartridges. Every item is selected for its historical significance and condition."},
        {q:"Why use a blockchain instead of a standard certificate of authenticity?", a:"Paper certificates can be lost, forged, or altered, but a blockchain record is immutable and globally accessible. By storing the collectible's history on a ledger, we ensure that the item's origin, grading, and previous ownership can be verified by anyone in seconds."}
      ]
    },
    {
      header: "Ownership & Security",
      questions: [
        {q:"What makes these collectibles secure?", a:"Decentralization secures your collectibles by removing any single point of failure, ensuring your ownership is recorded across a global network rather than a private company server."},
        {q:"Is my privacy protected?", a:"Your privacy is not inheretly protected because the block chain is a public ledger designed for total transparency."},
        {q:"What if the ledger record is deleted?", a:"The ledger exists across many independent nodes, making it impossible for a single entity to delete or roll back an item's history. Your proof of authenticity is decentralized and permanent."}
      ]
    },
    {
      header: "Authenticity",
      questions: [
        {q:"How do I know my collectible is authentic and not a fake?", a: "Your collectible is secured by a digital fingerprint that serves as an immutable certificate of authenticity, linking it back to the original creator with mathematical certainty"},
        {q:"Can I see the history of my item before I buy it?", a: "Yes, because the ledger is public, you can view the entire lifespan of the physical material from its initial grading to its current purchase history ensuring total transparency before you commit to a purchase."},
      ]
    },
  ];

  return(
    <div className="faq-page-container">
      <h1 className="faq-title">FAQ</h1>
      {data.map((section, index) => ( // runs loop going through data with each header being a section and an index. Pricing == index 1
          <FAQSection key={index}  section={section} /> // runs the FAQSection that will loop through make buttons of question and if pressed then open answer
      ))}
    </div>
  );   
}

// section={section} - will 

// section is each object in array
// .map() // is to loop through an array and return a value
// q - represents each question in the question array 
// data is just an array holding objects such as header and array of questions
// => is just like calling a function that returns JSX for react to take and put on screen
// all maps need a key???
// {} - inside these is javascript mode - outside is html

// make a function called FAQSelection that will loop through the header and questions and make button to toggle answer 