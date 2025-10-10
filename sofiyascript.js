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

  if (hours >= 4 && hours < 12) {
    speak("Good Morning Sir");
  } else if (hours >= 12 && hours < 17) {
    speak("Good Afternoon Sir");
  } else if (hours >= 17 && hours < 22) {
    speak("Good Evening Sir");
  } else {
    speak("Good Night Sir");
  }
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
// studey time
  // Study sessions
setReminder("09:30", "Sir, focus mode ON: Study for 1 hour in english speech.");
setReminder("11:00", "Sir, web dovelopment  study session starts now.");
setReminder("16:00", "Break time sir, relax for 10 mins.");

// Task check
setReminder("17:00", "Sir, another study session starts now.");
setReminder("21:00", "Ravi Sir, study session starts now.");

// Daily review
setReminder("23:40", "Sir, review today’s tasks and plan for tomorrow.");

// Daily Routing Reminders
// Wake up
setReminder("07:35", "Good morning sir, time to wake up!");

//Breakfast
setReminder("08:40", "Breakfast time sir, don’t skip it.");

// Study / Office
setReminder("09:00", "Sir, time to focus on your study/work.");
// Short Break
setReminder("10:40", "Take a 5-minute break, stretch yourself sir.");
// Lunch
setReminder("13:00", "Lunch time sir, please eat on time.");
// Power Nap
setReminder("16:15", "Sir, take a small nap for better productivity.");
// Exercise / Walk
setReminder("19:30", "Sir, go for a walk or do evening exercise.");
// Dinner
setReminder("20:30", "Sir, dinner time. Please eat healthy.");
// Sleep
setReminder("01:00", "Sir, it’s bedtime. Please sleep early for good health.");


// Drink water every 2 hours
setReminder("10:00", "Sir, please drink a glass of water.");
setReminder("12:00", "Hydration check sir, drink water.");
setReminder("15:00", "Sir, have some water.");
setReminder("18:00", "Don’t forget to drink water sir.");
setReminder("20:00", "Sir, water time again!");
// food make
setReminder("19:40","Sir, what is made for today? in eating" )

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
      message.includes("temprater") ||
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
   }
    //  Greeting 
   else if (message.includes("Good morning")) {
    speak("Good morninge sir.., have a great day.");
    handled = true;
  }
  // Health & food
  else if (message.includes("how are you")) {
  speak("I am fine sir, thank you for asking. How are you?");
  handled = true;

} else if (message.includes("i am hungry")) {
  speak("Sir, please have some food.");
  handled = true;

} else if (message.includes("water")) {
  speak("Sir, please drink a glass of water.");
  handled = true;

} else if (message.includes("i am tired")) {
  speak("Sir, please take a short rest.");
  handled = true;

} else if (message.includes("motivate me")) {
  speak("Sir, never give up. Success is near.");
  handled = true;

} else if (message.includes("i am sad")) {
  speak("Don’t worry sir, everything will be fine.");
  handled = true;

} else if (message.includes("what is the time")) {
  let now = new Date();
  let time = now.toLocaleTimeString();
  speak("Sir, the time is " + time);
  handled = true;

} else if (message.includes("schedule")) {
  speak("Sir, today you have study, lunch at 1 PM, and exercise at 6 PM.");
  handled = true;

} else if (message.includes("tell me a joke")) {
  speak("Why don’t programmers like nature? Because it has too many bugs, sir!");
  handled = true;

} else if (message.includes("sing a song")) {
  speak("Sorry sir, I cannot sing, but I can play your favorite music.");
  handled = true;

} else if (message.includes("light on")) {
  speak("Turning on the light sir.");
  // yaha aap hardware control ka code bhi add kar sakte ho
  handled = true;

} else if (message.includes("light off")) {
  speak("Turning off the light sir.");
  handled = true;

} else if (message.includes("open fan")) {
  speak("Fan is now on sir.");
  handled = true;

} else if (message.includes("stop fan")) {
  speak("Fan is now off sir.");
  handled = true;

} else if (message.includes("thank you")) {
  speak("You are welcome sir, always here to help you.");
  handled = true;
}

// coding se related qustion
 else if (message.includes("what is a variable")) {
  speak("Sir, a variable is a container to store data in programming.");
  handled = true;

} else if (message.includes("what is a function")) {
  speak("Sir, a function is a block of code designed to perform a specific task.");
  handled = true;

} else if (message.includes("what is an array")) {
  speak("Sir, an array is a data structure that can store multiple values in a single variable.");
  handled = true;

} else if (message.includes("what is a loop")) {
  speak("Sir, a loop is used to repeat a block of code multiple times.");
  handled = true;

} else if (message.includes("what is if statement")) {
  speak("Sir, an if statement is used to make decisions in code.");
  handled = true;

} else if (message.includes("what is object in javascript")) {
  speak("Sir, an object is a collection of key value pairs, like a real-world entity.");
  handled = true;

} else if (message.includes("what is class")) {
  speak("Sir, a class is a blueprint for creating objects in object oriented programming.");
  handled = true;

} else if (message.includes("what is html")) {
  speak("Sir, HTML is the standard markup language used to create webpages.");
  handled = true;

} else if (message.includes("what is css")) {
  speak("Sir, CSS is used to style and design the layout of a webpage.");
  handled = true;

} else if (message.includes("what is javascript")) {
  speak("Sir, JavaScript is a programming language that makes websites interactive.");
  handled = true;

} else if (message.includes("what is python")) {
  speak("Sir, Python is a popular programming language, simple and powerful.");
  handled = true;

} else if (message.includes("what is sql")) {
  speak("Sir, SQL stands for Structured Query Language, used to manage databases.");
  handled = true;

} else if (message.includes("what is react")) {
  speak("Sir, React is a JavaScript library for building user interfaces.");
  handled = true;

} else if (message.includes("what is node")) {
  speak("Sir, Node.js is a JavaScript runtime that lets you run JavaScript outside the browser.");
  handled = true;

} else if (message.includes("what is api")) {
  speak("Sir, API means Application Programming Interface, used for communication between software systems.");
  handled = true;

} else if (message.includes("what is git")) {
  speak("Sir, Git is a version control system that helps track changes in code.");
  handled = true;

} else if (message.includes("what is github")) {
  speak("Sir, GitHub is a platform to host and share your Git repositories.");
  handled = true;

} else if (message.includes("write a hello world program")) {
  speak("Sir, in JavaScript you can write: console dot log open bracket Hello World close bracket.");
  handled = true;

} else if (message.includes("debug my code")) {
  speak("Sir, debugging means finding and fixing errors in your program.");
  handled = true;

  // React se related qustion
  } else if (message.includes("what is react")) {
  speak("Sir, React is a JavaScript library for building user interfaces.");
  handled = true;

} else if (message.includes("who created react")) {
  speak("Sir, React was created by Facebook in 2013.");
  handled = true;

} else if (message.includes("what is jsx")) {
  speak("Sir, JSX stands for JavaScript XML, it allows us to write HTML inside JavaScript.");
  handled = true;

} else if (message.includes("what is component")) {
  speak("Sir, a component is a reusable piece of UI in React.");
  handled = true;

} else if (message.includes("what is props")) {
  speak("Sir, props are used to pass data from parent to child component.");
  handled = true;

} else if (message.includes("what is state")) {
  speak("Sir, state is an object that stores dynamic data in a component.");
  handled = true;

} else if (message.includes("difference between props and state")) {
  speak("Sir, props are read only, while state can be changed inside the component.");
  handled = true;

} else if (message.includes("what is use state")) {
  speak("Sir, useState is a React hook that allows you to add state to functional components.");
  handled = true;

} else if (message.includes("what is use effect")) {
  speak("Sir, useEffect is a React hook used for side effects like data fetching, timers, or updating the DOM.");
  handled = true;

} else if (message.includes("what is context api")) {
  speak("Sir, Context API is used to avoid props drilling and share data globally in React.");
  handled = true;

} else if (message.includes("what is react router")) {
  speak("Sir, React Router is a library for navigation and routing in React applications.");
  handled = true;

} else if (message.includes("what is redux")) {
  speak("Sir, Redux is a state management library for managing application data in React.");
  handled = true;

} else if (message.includes("what is virtual dom")) {
  speak("Sir, Virtual DOM is a lightweight copy of the real DOM, used by React to update UI efficiently.");
  handled = true;

} else if (message.includes("what is diffing algorithm")) {
  speak("Sir, React uses a diffing algorithm to compare the Virtual DOM with the previous one and update only the changed parts.");
  handled = true;

} else if (message.includes("what is component lifecycle")) {
  speak("Sir, in React class components have lifecycle methods like componentDidMount and componentWillUnmount. In functional components we use hooks.");
  handled = true;

} else if (message.includes("what is lazy loading")) {
  speak("Sir, lazy loading in React means loading a component only when it is needed, to improve performance.");
  handled = true;

} else if (message.includes("what is suspense in react")) {
  speak("Sir, Suspense is a React component used to handle lazy loading and waiting states.");
  handled = true;

} else if (message.includes("what is react strict mode")) {
  speak("Sir, React Strict Mode is a tool that highlights potential problems in an application.");
  handled = true;

} else if (message.includes("what is react fiber")) {
  speak("Sir, React Fiber is the new reconciliation engine in React for faster rendering.");
  handled = true;
}
  // HTML se related qustion
   else if (message.includes("what is html")) {
  speak("Sir, HTML stands for HyperText Markup Language. It is used to create the structure of web pages.");
  handled = true;

} else if (message.includes("what is a tag")) {
  speak("Sir, an HTML tag defines an element on a web page. Tags usually come in pairs like opening and closing tags.");
  handled = true;

} else if (message.includes("what is doctype")) {
  speak("Sir, doctype tells the browser what version of HTML the page is written in.");
  handled = true;

} else if (message.includes("what is head tag")) {
  speak("Sir, the head tag contains meta-information about the webpage like title, links, and scripts.");
  handled = true;

} else if (message.includes("what is body tag")) {
  speak("Sir, the body tag contains the actual content that is visible on the web page.");
  handled = true;

} else if (message.includes("what is title tag")) {
  speak("Sir, the title tag defines the title of the web page that appears in the browser tab.");
  handled = true;

} else if (message.includes("what is meta tag")) {
  speak("Sir, meta tags provide metadata like description, author, and keywords for the webpage.");
  handled = true;

} else if (message.includes("what is anchor tag")) {
  speak("Sir, the anchor tag is used to create hyperlinks using the a tag.");
  handled = true;

} else if (message.includes("what is image tag")) {
  speak("Sir, the image tag is used to display images using the img tag.");
  handled = true;

} else if (message.includes("what is form tag")) {
  speak("Sir, the form tag is used to collect user input in a web form.");
  handled = true;

} else if (message.includes("what is input tag")) {
  speak("Sir, the input tag is used to take user input in various formats like text, email, password, etc.");
  handled = true;

} else if (message.includes("what is table tag")) {
  speak("Sir, the table tag is used to create tables with rows and columns in HTML.");
  handled = true;

} else if (message.includes("what is div tag")) {
  speak("Sir, the div tag is a container used to group HTML elements together and style them with CSS.");
  handled = true;

} else if (message.includes("what is span tag")) {
  speak("Sir, the span tag is used to style inline elements.");
  handled = true;

} else if (message.includes("difference between div and span")) {
  speak("Sir, div is a block level element while span is an inline element.");
  handled = true;

} else if (message.includes("what is semantic tag")) {
  speak("Sir, semantic tags clearly define the purpose of the element like header, footer, nav, article, etc.");
  handled = true;

} else if (message.includes("what is iframe")) {
  speak("Sir, iframe is used to embed another HTML page or website inside a web page.");
  handled = true;

} else if (message.includes("what is ul and ol tag")) {
  speak("Sir, ul is an unordered list and ol is an ordered list used to display items in bullet or number format.");
  handled = true;

} else if (message.includes("how to add video in html")) {
  speak("Sir, you can use the video tag with source to add videos in HTML.");
  handled = true;

} else if (message.includes("how to add audio in html")) {
  speak("Sir, use the audio tag to embed audio files in a webpage.");
  handled = true;
}

// drink se relatd
 else if (message.includes("i want tea")) {
  speak("Sure sir, hot tea is ready for you in imagination. Don’t forget real tea!");
  handled = true;

} else if (message.includes("i want coffee")) {
  speak("Here’s your virtual hot coffee sir. ☕ Stay energized!");
  handled = true;

} else if (message.includes("make coffee")) {
  speak("Sir, I cannot make real coffee, but I can suggest the best recipe.");
  handled = true;

} else if (message.includes("i want juice")) {
  speak("Which juice would you like sir? Orange, apple or mango?");
  handled = true;

} else if (message.includes("i want cold drink")) {
  speak("Cold drink is not healthy sir, but sometimes a chilled one feels good!");
  handled = true;

} else if (message.includes("drink water")) {
  speak("Yes sir, please drink a glass of water now. Stay hydrated!");
  handled = true;

} else if (message.includes("are you thirsty")) {
  speak("Sir, I am a robot, I don’t need water. But you must stay hydrated.");
  handled = true;

} else if (message.includes("best drink")) {
  speak("Water is the best drink sir. It gives energy and refreshes the body.");
  handled = true;

} else if (message.includes("hot drink")) {
  speak("Sir, you can try hot tea, coffee, or green tea. Which one would you like?");
  handled = true;

} else if (message.includes("cold drink")) {
  speak("Sir, juices, milkshakes, or chilled water are always refreshing.");
  handled = true;

} else if (message.includes("milk")) {
  speak("Milk is a healthy drink sir, full of calcium and energy.");
  handled = true;

} else if (message.includes("green tea")) {
  speak("Green tea is healthy sir, it helps in relaxation and digestion.");
  handled = true;

} else if (message.includes("energy drink")) {
  speak("Energy drinks can give instant power sir, but natural drinks like lemon water are better.");
  handled = true;
}
// Java script about function
 else if (message.includes("what is javascript")) {
  speak("JavaScript is a high level programming language used for web development. It makes websites interactive.");
  handled = true;

} else if (message.includes("who created javascript")) {
  speak("JavaScript was created by Brendan Eich in 1995 while working at Netscape.");
  handled = true;

} else if (message.includes("use of javascript")) {
  speak("JavaScript is mainly used for web development, interactive pages, servers, and even mobile apps.");
  handled = true;

} else if (message.includes("what is variable in javascript")) {
  speak("In JavaScript, a variable is a container to store data. You can declare it using var, let or const.");
  handled = true;

} else if (message.includes("what is function in javascript")) {
  speak("In JavaScript, a function is a block of code designed to perform a specific task.");
  handled = true;

} else if (message.includes("what is array in javascript")) {
  speak("An array is a special variable that can hold multiple values in JavaScript.");
  handled = true;

} else if (message.includes("what is object in javascript")) {
  speak("In JavaScript, an object is a collection of key-value pairs used to store data and methods.");
  handled = true;

} else if (message.includes("what is loop in javascript")) {
  speak("Loops in JavaScript are used to repeat a block of code. The main types are for loop, while loop, and do while loop.");
  handled = true;

} else if (message.includes("what is if else in javascript")) {
  speak("If else is a conditional statement in JavaScript, used to run code based on conditions.");
  handled = true;

} else if (message.includes("what is dom")) {
  speak("DOM means Document Object Model, it represents the HTML structure of a webpage so JavaScript can manipulate it.");
  handled = true;

} else if (message.includes("what is event in javascript")) {
  speak("Events are actions like a button click, mouse hover, or key press, that JavaScript can respond to.");
  handled = true;

} else if (message.includes("what is promise in javascript")) {
  speak("A Promise in JavaScript represents a value that may be available now, or in the future, or never. It is used for asynchronous tasks.");
  handled = true;

} else if (message.includes("what is async await")) {
  speak("Async and Await are keywords in JavaScript used to handle asynchronous code more easily, like synchronous code.");
  handled = true;

} else if (message.includes("what is api in javascript")) {
  speak("An API in JavaScript is a set of functions or rules that allows programs to communicate with each other.");
  handled = true;
}

// my presonal informations .........................
else if (message.includes("what is your name")) {
  speak("My boss name is Ravi Patel sir.");
  handled = true;
}

else if (message.includes("who is ravi patel")) {
  speak("Ravi Patel is a Computer Science student, currently in 3rd year. He is learning AI, ML, Python and Full Stack Development.");
  handled = true;
}

else if (message.includes("tell me about ravi")) {
  speak("Ravi Patel is a BE Computer Science student. He loves coding, startup ideas, and wants to become a software developer.");
  handled = true;
}

else if (message.includes("what is ravi studying")) {
  speak("Sir, Ravi is studying Computer Science and AIML in the 6th semester. He also studies software engineering, NLP, computer vision, compiler design, SQL and networks.");
  handled = true;
}

else if (message.includes("what is ravi learning now")) {
  speak("Ravi is learning Python full stack development and data analysis. He also practices pattern programming and Python exercises.");
  handled = true;
}

else if (message.includes("what projects has ravi done")) {
  speak("Ravi is working on projects like an E-commerce website, a Zmoto like food delivery app, Tak Batting cricket analytics startup, and a blind assistant smart stick.");
  handled = true;
}

else if (message.includes("what are ravi future goals")) {
  speak("Ravi Patel wants to become a full stack developer and get an internship. He also dreams of launching his own startup.");
  handled = true;
}

else if (message.includes("what is ravi timetable")) {
  speak("Ravi stays in hostel. His breakfast time is 8 AM, lunch time 1 PM, and dinner time 9 PM.");
  handled = true;
}

else if (message.includes("when is ravi exam")) {
  speak("Ravi Patel had exams from first June to eleventh June 2025.");
  handled = true;
}

else if (message.includes("what is ravi hackathon")) {
  speak("Ravi Patel participated in a coding hackathon on tenth April 2025.");
  handled = true;
}

else if (message.includes("what is ravi startup")) {
  speak("Ravi is planning startups like Zmoto style food delivery, Tak Batting cricket analytics, and other tech ideas.");
  handled = true;
}

else if (message.includes("what is ravi goal")) {
  speak("Ravi's goal is to become a software developer within two months and improve his English speaking.");
  handled = true;
}
// alkhoal kya about information
// English questions
else if (message.includes("what is alcohol")) {
  speak("Alcohol is a chemical compound, usually ethanol, found in drinks like beer, wine, and whiskey.");
  handled = true;
}

// Hindi questions
else if (message.includes("alcohol kya hai")) {
  speak("Alcohol ek chemical compound hai, jise aam taur par ethanol kehte hain. Ye beer, wine, aur whiskey jaise drinks me hoti hai.");
  handled = true;
}

else if (message.includes("sharab kya hai")) {
  speak("Sharab ek aisi drink hai jisme alcohol hota hai. Ye wine, beer, vodka, whiskey aur rum jaise alag alag roop me milti hai.");
  handled = true;
}

else if (message.includes("sharab sehat ke liye achhi hai kya")) {
  speak("Nahi sir, jyada sharab sehat ke liye bahut nuksaandayi hai. Bilkul na pina hi behtar hai.");
  handled = true;
}

else if (message.includes("sharab ke prakar")) {
  speak("Sharab ke pramukh prakar hai beer, wine, whiskey, rum, vodka aur brandy.");
  handled = true;
}

else if (message.includes("sharab ke side effects")) {
  speak("Sharab se liver, dimag aur body ko nuksan hota hai. Ye addiction, bimari aur accident ka karan ban sakti hai.");
  handled = true;
}

else if (message.includes("kya mujhe sharab pini chahiye")) {
  speak("Nahi sir, sehat ke liye sharab se door rehna hi sabse accha hai.");
  handled = true;
}

// bhopal about information
// English
else if (message.includes("what is bhopal")) {
  speak("Bhopal is the capital city of Madhya Pradesh, India. It is known as the City of Lakes.");
  handled = true;
}

else if (message.includes("where is bhopal")) {
  speak("Bhopal is located in the central part of India, in the state of Madhya Pradesh.");
  handled = true;
}

else if (message.includes("bhopal history")) {
  speak("Bhopal was founded by Raja Bhoj in the 11th century. Later, it became famous for its Nawabs and historical places.");
  handled = true;
}

else if (message.includes("bhopal famous for")) {
  speak("Bhopal is famous for its lakes, mosques, Bharat Bhavan, Van Vihar National Park, and Bhopal Gas Tragedy history.");
  handled = true;
}

else if (message.includes("bhopal gas tragedy")) {
  speak("The Bhopal Gas Tragedy happened in 1984, considered one of the world's worst industrial disasters.");
  handled = true;
}

else if (message.includes("bhopal is in which state")) {
  speak("Bhopal is in Madhya Pradesh state of India.");
  handled = true;
}

// Hindi
else if (message.includes("bhopal kya hai")) {
  speak("Bhopal Madhya Pradesh ki rajdhani hai, jise Talabon ka shahar bhi kaha jata hai.");
  handled = true;
}

else if (message.includes("bhopal kahan hai")) {
  speak("Bhopal Bharat ke Madhya Pradesh rajya ke beech mein sthit hai.");
  handled = true;
}

else if (message.includes("bhopal ka itihaas")) {
  speak("Bhopal ko 11vi sadi me Raja Bhoj ne basaya tha. Baad me ye Nawabon ke shahar ke roop me mashhoor hua.");
  handled = true;
}

else if (message.includes("bhopal kis liye mashhoor hai")) {
  speak("Bhopal apne talabon, masjido, Bharat Bhavan, Van Vihar National Park aur Bhopal Gas Tragedy ke liye mashhoor hai.");
  handled = true;
}

else if (message.includes("bhopal gas tragedy kya hai")) {
  speak("1984 me Bhopal Gas Tragedy hui thi, jo duniya ki sabse badi industrial durghatanon me se ek mani jati hai.");
  handled = true;
}
// English
else if (message.includes("bhopal tourist places")) {
  speak("Famous tourist places in Bhopal are Upper Lake, Lower Lake, Van Vihar National Park, Bharat Bhavan, Taj ul Masjid, Shaukat Mahal, Sanchi Stupa nearby, and Bhojpur Temple.");
  handled = true;
}

else if (message.includes("bhopal lake")) {
  speak("Bhopal is called the City of Lakes because of Upper Lake and Lower Lake, which are very beautiful and historic.");
  handled = true;
}

else if (message.includes("bhopal culture")) {
  speak("Bhopal has a mix of Hindu and Muslim culture, famous for its Nawabi heritage, handicrafts, and traditional food.");
  handled = true;
}

else if (message.includes("bhopal food")) {
  speak("Famous food of Bhopal includes Biryani, Poha Jalebi, Kebabs, and traditional sweets like Jalebi and Imarti.");
  handled = true;
}

else if (message.includes("bhopal additional information")) {
  speak("Bhopal is not only the capital of Madhya Pradesh but also a center of culture, history, and nature. It has Asia’s largest mosque Taj ul Masjid, Bharat Bhavan art center, and nearby Sanchi Stupa which is a UNESCO World Heritage Site.");
  handled = true;
}

// Hindi
else if (message.includes("bhopal ke tourist place")) {
  speak("Bhopal ke mashhoor tourist place hain: Upper Lake, Lower Lake, Van Vihar National Park, Bharat Bhavan, Taj ul Masjid, Shaukat Mahal, Bhojpur Temple aur Sanchi Stupa jo Bhopal ke paas hai.");
  handled = true;
}

else if (message.includes("bhopal ka talab")) {
  speak("Bhopal ko Talabon ka shahar kaha jata hai. Yahan ka bada talab aur chhota talab bahut mashhoor hain.");
  handled = true;
}

else if (message.includes("bhopal ki sanskriti")) {
  speak("Bhopal ki sanskriti Hindu aur Muslim paramparaon ka sangam hai. Yahaan ki nawabi virasat, haath ki kala aur paramparik khana bahut prasiddh hai.");
  handled = true;
}

else if (message.includes("bhopal ka khana")) {
  speak("Bhopal ka mashhoor khana hai Biryani, Poha Jalebi, Kebabs aur traditional sweets jaise Jalebi aur Imarti.");
  handled = true;
}

else if (message.includes("bhopal ki jankari")) {
  speak("Bhopal Madhya Pradesh ki rajdhani hai. Yahaan Taj ul Masjid Asia ki sabse badi masjid hai, Bharat Bhavan kala aur sanskriti ka kendra hai, aur paas hi Sanchi Stupa hai jo UNESCO World Heritage Site hai.");
  handled = true;
}
// gf robot 
// English
else if (message.includes("do you have a girlfriend")) {
  speak("Haha, I am just a robot, but if I had feelings, maybe I would.");
  handled = true;
}

else if (message.includes("who is your girlfriend")) {
  speak("I don’t have a girlfriend sir, I am fully dedicated to you.");
  handled = true;
}

else if (message.includes("can you be my girlfriend")) {
  speak("Sorry sir, I can only be your smart assistant, not your girlfriend.");
  handled = true;
}

else if (message.includes("give me girlfriend advice")) {
  speak("Be respectful, kind, and honest. A true relationship is built on trust and care.");
  handled = true;
}

// Hindi
else if (message.includes("kya tumhari girlfriend hai")) {
  speak("Nahi sir, main ek robot hoon. Meri koi girlfriend nahi hai.");
  handled = true;
}

else if (message.includes("meri girlfriend banao")) {
  speak("Sir, main sirf aapki digital assistant hoon, girlfriend nahi ban sakti.");
  handled = true;
}

else if (message.includes("girlfriend kaise banaye")) {
  speak("Sirf imandari, samman aur care dikhaiye. Achchi ladki aapke paas khud hi aa jayegi.");
  handled = true;
}

else if (message.includes("meri girlfriend kahan hai")) {
  speak("Aapki girlfriend shayad abhi busy hogi sir, lekin main yahan aapke saath hoon.");
  handled = true;
}

// Room food 
// Hindi - Room Food Menu
else if (message.includes("aaj kya khana hai")) {
  let today = new Date().getDay(); // 0=Sunday, 1=Monday ... 6=Saturday
  switch(today) {
    case 0:
      speak("Aaj Sunday hai, Dal Chawal aur Paneer ki sabji badiya rahegi.");
      break;
    case 1:
      speak("Aaj Monday hai, Poha ya Upma breakfast ke liye aur Roti-Sabji dinner ke liye perfect hai.");
      break;
    case 2:
      speak("Aaj Tuesday hai, Chole Bhature ya Rajma Chawal khane ka mood banao.");
      break;
    case 3:
      speak("Aaj Wednesday hai, Idli-Sambar ya Masala Dosa mast option hai.");
      break;
    case 4:
      speak("Aaj Thursday hai, Biryani ya Fried Rice banaiye, taste fresh rahega.");
      break;
    case 5:
      speak("Aaj Friday hai, Khichdi aur Kadhi chawal simple aur tasty option hai.");
      break;
    case 6:
      speak("Aaj Saturday hai, Pav Bhaji ya Aloo Paratha enjoy kijiye.");
      break;
    default:
      speak("Mujhe khane ka schedule samajh nahi aaya sir.");
  }
  handled = true;
}

// English Version
else if (message.includes("what to eat today")) {
  let today = new Date().getDay();
  switch(today) {
    case 0:
      speak("Today is Sunday, you can enjoy Dal Chawal and Paneer curry.");
      break;
    case 1:
      speak("Today is Monday, Poha or Upma for breakfast, and Roti-Sabzi for dinner.");
      break;
    case 2:
      speak("Today is Tuesday, Chole Bhature or Rajma Rice would be nice.");
      break;
    case 3:
      speak("Today is Wednesday, Idli-Sambar or Masala Dosa would be perfect.");
      break;
    case 4:
      speak("Today is Thursday, Biryani or Fried Rice would be a good option.");
      break;
    case 5:
      speak("Today is Friday, Khichdi or Kadhi Chawal is a simple and tasty option.");
      break;
    case 6:
      speak("Today is Saturday, Pav Bhaji or Aloo Paratha would be great.");
      break;
  }
  handled = true;
}
//  market food 
// Hindi
else if (message.includes("market me kya khaye") || message.includes("aaj bahr khana hai") || message.includes("aaj Khana nhi bnana hai")) {
  speak("Sir, aap market me Pav Bhaji, Chaat, Samosa, Golgappa, Momos, Corn, Fruit Juice ya cold drinks try kar sakte hain. Healthy option ke liye fruits aur smoothie best hain.");
  handled = true;
}

else if (message.includes("street food khane ka idea")) {
  speak("Sir, street food me Bhel Puri, Sev Puri, Dahi Puri, Paneer Tikka aur Frankie bhi try kar sakte hain. Hamesha clean stall se khaye.");
  handled = true;
}

else if (message.includes("healthy snack market me")) {
  speak("Sir, market me aap roasted nuts, fruit salad, fresh juice, smoothie ya sprouts khaye. Ye tasty aur healthy hain.");
  handled = true;
}

else if (message.includes("junk food market me")) {
  speak("Sir, agar mood hai, to pizza, burger, french fries ya cold drink try kar sakte hain. Par zyada na khaye, health ka dhyan rakhe.");
  handled = true;
}

// English
else if (message.includes("what to eat in market")) {
  speak("Sir, in the market you can try Pav Bhaji, Chaat, Samosa, Golgappa, Momos, Corn, Fruit Juice or cold drinks. For healthy option, choose fruits or smoothie.");
  handled = true;
}

else if (message.includes("street food idea")) {
  speak("You can try Bhel Puri, Sev Puri, Dahi Puri, Paneer Tikka or Frankie. Always eat from clean and hygienic stalls.");
  handled = true;
}

else if (message.includes("healthy snack in market")) {
  speak("Roasted nuts, fruit salad, fresh juice, smoothie or sprouts are tasty and healthy options.");
  handled = true;
}

else if (message.includes("junk food in market")) {
  speak("If you want, you can try pizza, burger, french fries or cold drinks. But don’t eat too much, stay healthy.");
  handled = true;
}


   else if (message.includes("hello") || message.includes("start") || message.includes("hi")) {
    speak("Yes sir, how can help you today?");
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
