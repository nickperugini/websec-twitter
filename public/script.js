// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWMQ59riBmuDtIjEhZOpPBSQBbHREm-Q8",
  authDomain: "websec-twitter.firebaseapp.com",
  databaseURL: "https://websec-twitter-default-rtdb.firebaseio.com",
  projectId: "websec-twitter",
  storageBucket: "websec-twitter.appspot.com",
  messagingSenderId: "876011720520",
  appId: "1:876011720520:web:d16216fc450a369f66ed7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
let db = rtdb.getDatabase(app);

const provider = new GoogleAuthProvider();
const auth = getAuth();
var authUser;



let tweetJSON = {
  "authorId": "",
  "content": "",
  "likes": 0,
  "timestamp": Date.now(),
  "author": {
    "handle": "",
    "pic": ""
  },
};

//code from https://mdbootstrap.com/docs/standard/extended/login/
let Login = () => {
  $("#main").html("");
  $("#main").append(`
  <section class="vh-100" style="background-color: dodgerblue  ;">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-12 col-md-8 col-lg-6 col-xl-5">
        <div class="card shadow-2-strong" style="border-radius: 1rem;">
          <div class="card-body p-5 text-center">

            <h3 class="mb-6"><FONT COLOR=black>Websec Twitter Sign in</h3>

            <button id=login style="background-color:dodgerblue" class="btn btn-primary btn-lg btn-block" type="submit">Login with Google</button>

            <hr class="my-4">

          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    
  `);
  $("#login").on("click", () => {
    signInWithRedirect(auth, provider);
    getRedirectResult(auth)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        authUser = user;
        onAuthStateChanged(auth, user);

      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });

  })
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    $(document).ready(function () {
      let paths = document.location.pathname.split('/');
      let subapp = paths[1];
      let subapp1 = subapp.split(':');
      authUser = user;
      switch (subapp1[0]) {
        case "home":
          Home();
          break;
        case "profile":
          Profile(user.uid);
          break;
        default:
          Home();
      }
    })
    createUser(user);
  } else {
    $(".container").hide();
    Login();
  }
});

let Profile = (uid) => {
  $("#main").html("");
  $('#main').append(`
  <div class="header">
  <a href="#default" class="logo">Websec Twitter</a>
  <div class="header-right">
    <a href="/" class="nav-link px-3 text-black">Home</a>
    <a class="active" href="/profile" class="nav-link px-3 text-black">Profile</a>
  </div>
  </div>
  </div>
  <div id="bottom">
    <div class="row align-items-top">
      <div class="col">
      </div>
      <div class="col">
      <div id="accTweets">  
      </div>
    <div class="col">
    </div>
    </div>
  </div>
  `);
  displayTweets(uid)
}

let createUser = (newUser) => {

  let userCheck = rtdb.ref(db, `users/${newUser.uid}`)
  rtdb.get(userCheck).then(ss => {
    if (ss.val() == null) {
      rtdb.set(rtdb.ref(db, "users/" + newUser.uid + "/handle"), newUser.email.substr(0, newUser.email.indexOf('@')))

      rtdb.set(rtdb.ref(db, `users/${newUser.uid}/pic`), "https://upload.wikimedia.org/wikipedia/commons/d/d9/Icon-round-Question_mark.svg")
    }
  })
}

//Parts of function from https://dev.to/codingnepal/twitter-tweet-box-with-character-limit-highlighting-in-html-css-javascript-2ai8
//Used their javascript/css/html for twitter input box then added code to store info to db on click event
let twitterBootstrap = () => {

  $("#sendTweet").on("click", function () {

    let userRef = rtdb.ref(db, `users/${authUser.uid}/pic`)

    rtdb.get(userRef).then(picture => {
      tweetJSON.content = editableInput.innerText;
      tweetJSON.authorId = authUser.uid;
      tweetJSON.author.pic = picture.val();
      tweetJSON.author.handle = authUser.email.substring(0, authUser.email.indexOf('@'));

      let newTweetRef = rtdb.push(tweetRef);
      let tweetId = newTweetRef._path.pieces_[1];

      rtdb.set(newTweetRef, tweetJSON);
      let userTweetsRef = rtdb.ref(db, `users/${authUser.uid}/tweets`)

      rtdb.push(userTweetsRef, tweetId);
      $(".editable").empty();

      placeholder.style.display = "block";
      counter.style.display = "none";
    })

  });

  //afformentioned code!
  const wrapper = document.querySelector(".wrapper"),
    editableInput = wrapper.querySelector(".editable"),
    readonlyInput = wrapper.querySelector(".readonly"),
    placeholder = wrapper.querySelector(".placeholder"),
    counter = wrapper.querySelector(".counter"),
    button = wrapper.querySelector("button");
  editableInput.onfocus = () => {
    placeholder.style.color = "#c5ccd3";
  };
  editableInput.onblur = (e) => {
    placeholder.style.color = "#98a5b1";
  };
  editableInput.onkeyup = (e) => {
    let element = e.target;
    validated(element);
  };
  editableInput.onkeypress = (e) => {
    let element = e.target;
    validated(element);
    placeholder.style.display = "none";
  };

  function validated(element) {
    let text;
    let maxLength = 240;
    let currentlength = element.innerText.length;
    if (currentlength <= 0) {
      placeholder.style.display = "block";
      counter.style.display = "none";
      button.classList.remove("active");
    } else {
      placeholder.style.display = "none";
      counter.style.display = "block";
      button.classList.add("active");
    }
    counter.innerText = maxLength - currentlength;
    if (currentlength > maxLength) {

      counter.style.color = "#e0245e";
      button.classList.remove("active");
    } else {
      readonlyInput.style.zIndex = "-1";
      counter.style.color = "#333";
    }
    readonlyInput.innerHTML = text;
  }


}
//partial code from https://dev.to/codingnepal/twitter-tweet-box-with-character-limit-highlighting-in-html-css-javascript-2ai8
let Home = () => {
  $("#main").html("");
  $("#main").append(`
  
  <div class="header">
  <a href="#default" class="logo">Websec Twitter</a>
  <div class="header-right">
    <a class="active"  href="/" class="nav-link px-3 text-black">Home</a>
    <a href="/profile" class="nav-link px-3 text-black">Profile</a>
  </div>
</div>
</div>
<div id="bottom">
<div class="container text-center">
  <div class="row align-items-top">
    <div class="col">
    </div>
    <div class="col">
      
      <div id="tweet"></div>
      <div id="reply">
      <div class="wrapper">
        <div class="input-box">
          <div class="tweet-area">
            <span class="placeholder">Tweet</span>
            <div class="input editable" contenteditable="true" spellcheck="false"></div>
            <div class="input readonly" contenteditable="true" spellcheck="false"></div>
          </div>
        </div>
        <div id="tweetBottom" class="bottom">
          <div class="content">
            <span class="counter">240</span>
            <button id="sendTweet">Tweet</button>
            </div>
            </div>
          </div>
          <div id="allTweets">
          </div>
        </div>
        <div class="col">
    </div>
      </div>
    </div>
    </div>
  `);
  twitterBootstrap();
  let tweetref = rtdb.ref(db, `tweets`);
}

let renderTweet = (tObj, uuid) => {
  $("#allTweets").prepend(`
<div class="card mb-3 tweet" data-uuid="${uuid}" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${tObj.author.pic}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${tObj.author.handle}</h5>
        <p class="card-text">${tObj.content}</p>
        <p class="card-text"><small class="text-muted">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
      </div>
    </div>
  </div>
</div>
  `);
}

let renderUserTweets = (tObj, uuid) => {
  $("#accTweets").prepend(`
<div class="card mb-3 tweet" data-uuid="${uuid}" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${tObj.author.pic}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${tObj.author.handle}</h5>
        <p class="card-text">${tObj.content}</p>
        <p class="card-text"><small class="text-muted">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
      </div>
    </div>
  </div>
</div>
  `);
}

let tweetRef = rtdb.ref(db, "/tweets");
rtdb.onChildAdded(tweetRef, (ss) => {

  let tObj = ss.val();

  renderTweet(tObj, ss.key);
  $(".tweet").off("click");
  $(".tweet").on("click", (evt) => {
    alert($(evt.currentTarget).attr("data-uuid"));
  });
});

function displayTweets(uid) {
  let profTweetsArr = [];
  let profTweets = rtdb.ref(db, `users/${uid}/tweets`);
  rtdb.get(profTweets).then(ss => {
    ss.forEach(tweet => {
      profTweetsArr.push(tweet)
    })
    profTweetsArr.forEach((i) => {
      let tweetRef = rtdb.ref(db, `tweets/${i.val()}`)
      rtdb.get(tweetRef).then((ss) => {
        renderUserTweets(ss.val(), i.val());
      })
    })
  })
}