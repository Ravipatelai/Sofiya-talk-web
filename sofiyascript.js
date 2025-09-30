let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// ✅ Wake words (English + Hindi variations)
const wakeWords = [
  "sofiya","sofia",
  "sophia",
  "sophiya",
  "sofi",
  "sofiyaaa",
  "sophiya",
  "sophya",
  "sophyaaa",
  "सोफिया",
  "सोफी",
  "सोफिया जी",
  "सोफी जी",
  "सोपिया",
  "supia"
];

function speak(text) {
  let text_speak = new SpeechSynthesisUtterance(text);
  text_speak.rate = 1;
  text_speak.pitch = 1;
  text_speak.volume = 1;
  text_speak.lang = "hi-IN";

  let voices = window.speechSynthesis.getVoices();
  let femaleVoice = voices.find(
    (v) =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("woman") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("susan")
  );
  if (femaleVoice) text_speak.voice = femaleVoice;

  window.speechSynthesis.speak(text_speak);
}

function wishMe() {
  let hours = new Date().getHours();
  if (hours >= 4 && hours < 12) speak("Good Morning Sir");
  else if (hours >= 12 && hours < 17) speak("Good Afternoon Sir");
  else if (hours >= 17 && hours < 22) speak("Good Evening Sir");
  // else speak(" present sir ");
}
// 🕒 Reminder system
function setReminder(reminderTime, message) {
  setInterval(() => {
    let now = new Date();
    let currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    if (currentTime === reminderTime) {
      speak(message);
    }
  }, 1000 * 30); // check every 30 seconds
}

let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  let transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
  content.innerText = transcript;

  // Check if wake word is present
  let called = wakeWords.some((name) => transcript.includes(name));

  // Remove wake word for search if present
  let command = transcript;
  if (called) {
    wakeWords.forEach((name) => (command = command.replace(name, "")));
    command = command.trim();
  }

  // Always process commands
  takeCommand(command, called);
};


// restart when it stop
recognition.onend = () => {
  recognition.start(); // keep listening
};

window.addEventListener("load", () => {
  wishMe();
  // Example reminder at 7:46 PM
  setReminder("7:46", "Good mornig sir. you have a dreem");

  // Example reminder at 8:30 AM
  setReminder("08:30", "Good morning sir, please have your breakfast.");

  // Example reminder at 12:30 AM
  setReminder("12:30", "Good evenig sir, please have your lunch timet.");
  // Example reminder at 7:30 PM
  setReminder("19:30", "Sir, it's market time. Please purches anythig.");

  // Example reminder at 1:00 PM
  setReminder("23:50", "Sir, it's lunch time. Please eat your food.");

  recognition.start();
  btn.style.display = "none";
  voice.style.display = "block";
});

// wheder app
async function getWeather(city) {
  try {
    const apiKey = "131ea181441194f9be7db253b6c607f1";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      let temp = data.main.temp;
      let desc = data.weather[0].description;
      let message = `The current temperature in ${city} is ${temp} degree Celsius with ${desc}`;
      speak(message);
      console.log(message);
    } else {
      speak(`Sorry, I could not find weather for ${city}`);
      console.log(`Error: ${data.message}`);
    }
  } catch (error) {
    speak("Sorry, something went wrong while fetching the weather.");
    console.error(error);
  }
}

// Api call gemani ai
const GEMINI_API_KEY = "AIzaSyD_xOVF6OWMQ1qYUIJu6ch-pxjAMkpfKAc";
async function askGemini(prompt) {
  try {
    let response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    let data = await response.json();
    console.log("Gemini raw response:", data);

    if (data.candidates &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "⚠️ Gemini didn’t return a valid response.";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Sorry, I couldn't connect to Gemini AI.";
  }
}

function takeCommand(message, called) {
  btn.style.display = "flex";
  voice.style.display = "none";

  let handled = false; // ✅ track if matched

  // whedear command

  // Weather command inside takeCommand
  if (
    !handled &&
    (message.includes("weather") ||
      message.includes("mosam") ||
      message.includes("मौसम"))
  ) {
    let city = "Bhopal"; // default city

    // Extract city if mentioned: "weather in Delhi" or "mosam in Delhi"
    let match = message.match(/in\s+([a-zA-Z\s]+)/i);
    if (match && match[1]) {
      city = match[1].trim();
    }

    console.log("City detected for weather:", city);
    getWeather(city);
    handled = true;
  }

  let matchHindi = message.match(/([a-zA-Z\u0900-\u097F\s]+)\s?mosam/i);
  if (matchHindi && matchHindi[1]) city = matchHindi[1].trim();
   
   if (message.includes("stop")) {
    speak("yes sir");
    handled = true;
   } else if (message.includes("hello") || message.includes("start") || message.includes("hi")) {
    speak("present sir, what can I help you with?");
    handled = true;
  } else if (message.includes("who are you")) {
    speak("I am  your virtual assistant created by Ravi Sir");
    handled = true;
  } else if (message.includes("listen me")) {
    speak("yes sir");
    handled = true;
  } 
  else if (message.includes("stop")) {
    speak("yes sir");
    handled = true;
  } 
  else if (message.includes("your name")) {
    speak("Sofiya sir");
    handled = true;
  }  
  else if (message.includes("nice") || message.includes("thanku you")) {
    speak("sukiriya sir");
    handled = true;
  }  
  else if (message.includes("aacha hai")) {
    speak("Thank you sir!");
    handled = true;
  } else if (message.includes("rong answer ")) {
    speak("sorry sir ,try agan");
    handled = true;
  } else if (message.includes("kon ho")) {
    speak("my aapka pressonal assistrnt hu");
    handled = true;
  } else if (message.includes("open youtube")) {
    speak("Opening YouTube..");
    window.open("https://youtube.com/", "_blank");
    handled = true;
  } else if (message.includes("open facebook")) {
    speak("Opening Facebook..");
    window.open("https://facebook.com/", "_blank");
    handled = true;
  } else if (message.includes("open instagram")) {
    speak("Opening Instagram..");
    window.open("https://instagram.com/", "_blank");
    handled = true;
  } else if (message.includes("chatgpt") || message.includes("chat gtp")) {
    speak("Opening chatgpt..");
    window.open("https://chatgpt.com", "_blank");
    handled = true;
  } else if ( message.includes("play song") || message.includes("open song")) {
    speak("sir i playing hidi song");
    window.open(
      "https://www.youtube.com/watch?v=92sru7hki_U&list=RDexAZLbjBGsk&index=4",
      "_blank"
    );
    handled = true;
  } else if (message.includes("data")) {
    speak("sorry sir aapne btaya nhi hai");
    handled = true;
  } else if (message.includes("open google")) {
    speak("Opening Google..");
    window.open("https://google.com/", "_blank");
    handled = true;
  }
  // get location 
  else if (message.includes("where am i") || 
         message.includes("my location") || 
         message.includes("mera location") || 
         message.includes("mera address") ||
         message.includes("my place") ||
         message.includes("hum kaha hu") ||
         message.includes("location ") ||
         message.includes("map ") ||
         message.includes("open map ") ||
         message.includes("location kya hai")) {
        speak("your current location>>, bhopal mp sir...");
        window.open("https://www.google.com/maps/@23.1455402,77.4773234,16z?entry=ttu&g_ep=EgoyMDI1MDkyMy4wIKXMDSoASAFQAw%3D%3D");
    
       handled = true;
}


  //  Backend data get 
  else if (message.includes("open notes") || message.includes("open notepad")) {
    speak("Opening your notes file..");
    fetch("http://localhost:4000/open?file=notes");
    handled = true;
}
else if (message.includes("open chrome") || message.includes(" chrome open")) {
    speak("Opening Chrome..");
    fetch("http://localhost:4000/open?file=chrome");
    handled = true;
}
  else if (message.includes("time")) {
    recognition.stop(); // अस्थायी रूप से सुनना बंद करें
    let time = new Date().toLocaleString(undefined, {
      hour: "numeric",
      minute: "numeric",
    });
    speak("समय है " + time);
    handled = true;

    // थोड़ी देर बाद फिर से सुनना शुरू करें
    setTimeout(() => recognition.start(), 1000);
  }
  // ✅ Only search like (sofiya what is google) if nothing matched
  if (called && !handled && message.trim().length > 1) {
    let finalText = "This is what I found on the internet regarding " + message;
    speak(finalText);
    window.open(`https://www.google.com/search?q=${message}`, "_blank");
  }
}
