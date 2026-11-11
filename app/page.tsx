"use client";

import { useState } from "react";
import {
  Search, Home, Compass, PlusSquare, UserRound, Heart, MessageCircle,
  Share2, Bookmark, Play, Volume2, VolumeX, Menu, X, Sparkles,
  ChevronDown, ShieldCheck, Video
} from "lucide-react";

const clips = [
  {
    id: 1,
    creator: "maya.creates",
    name: "Maya Johnson",
    caption: "Little moments, big memories. Where are you watching from? 🌍",
    tags: "#Tivva #DailyMoments #ForYou",
    likes: "24.8K",
    comments: "1,204",
    color: "sunset",
    initials: "MJ",
    sound: "Original sound · Maya"
  },
  {
    id: 2,
    creator: "thefoodroute",
    name: "The Food Route",
    caption: "A quick taste of the street food scene. What should we try next? 🍜",
    tags: "#FoodTok #Explore #Tivva",
    likes: "18.2K",
    comments: "846",
    color: "berry",
    initials: "FR",
    sound: "City nights · The Food Route"
  },
  {
    id: 3,
    creator: "kai.travels",
    name: "Kai Travels",
    caption: "POV: you finally take that trip you kept postponing ✈️",
    tags: "#Travel #NewPlaces #Tivva",
    likes: "42.1K",
    comments: "2,031",
    color: "ocean",
    initials: "KT",
    sound: "Golden hour · Kai"
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("For You");
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const toggle = (list: number[], id: number, setter: (value: number[]) => void) =>
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Tivva home"><span className="brand-mark">t</span><span>tivva</span><i>.</i></a>
        <div className="search-box"><Search size={17} /><input aria-label="Search Tivva" placeholder="Search creators, videos and sounds" /></div>
        <div className="top-actions">
          <button className="upload-button" onClick={() => setShowLogin(true)}><PlusSquare size={17} /> Upload</button>
          <button className="login-button" onClick={() => setShowLogin(true)}>Log in</button>
          <button className="signup-button" onClick={() => setShowSignup(true)}>Sign up</button>
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="layout">
        <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <nav className="main-nav">
            <button className="nav-item active"><Home size={20} /> For You</button>
            <button className="nav-item"><Compass size={20} /> Discover</button>
            <button className="nav-item" onClick={() => setShowLogin(true)}><PlusSquare size={20} /> Upload video</button>
            <button className="nav-item" onClick={() => setShowLogin(true)}><MessageCircle size={20} /> Inbox</button>
            <button className="nav-item" onClick={() => setShowLogin(true)}><UserRound size={20} /> Profile</button>
          </nav>
          <div className="sidebar-divider" />
          <p className="side-label">Your world starts here</p>
          <p className="side-copy">Log in to follow creators, save videos and build your own community.</p>
          <button className="outline-signup" onClick={() => setShowSignup(true)}>Create an account</button>
          <div className="sidebar-note"><ShieldCheck size={15} /> A space for real creativity.</div>
          <div className="side-footer">About · Guidelines · Privacy · Terms<br/>© 2026 Tivva</div>
        </aside>

        <section className="feed-column">
          <div className="feed-heading">
            <div><span className="eyebrow"><Sparkles size={13} /> YOUR DAILY DOSE OF DISCOVERY</span><h1>Find your <span>moment.</span></h1></div>
            <button className="following-select" onClick={() => setActiveTab(activeTab === "For You" ? "Following" : "For You")}>{activeTab}<ChevronDown size={15}/></button>
          </div>
          <div className="feed-tabs">
            {["For You", "Following", "Trending"].map((tab) => <button key={tab} className={activeTab === tab ? "tab active-tab" : "tab"} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>

          {clips.map((clip, index) => (
            <article className="video-card" key={clip.id}>
              <div className={`video-stage ${clip.color}`}>
                <div className="stage-glow" />
                <div className="stage-content">
                  <span className="stage-kicker">TIVVA ORIGINALS</span>
                  <div className="stage-art">{index === 0 ? "MOMENTS" : index === 1 ? "TASTE IT." : "GO FURTHER."}</div>
                  <p>{index === 0 ? "Life happens in the little things." : index === 1 ? "A world of flavour awaits." : "Your next chapter is out there."}</p>
                  <div className="play-disc"><Play size={22} fill="currentColor" /></div>
                </div>
                <span className="preview-label"><Video size={12}/> VIDEO PREVIEW</span>
                <button className="sound-toggle" aria-label={muted ? "Unmute preview" : "Mute preview"} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button>
              </div>
              <div className="video-details">
                <div className="creator-row"><div className="avatar">{clip.initials}</div><div className="creator-meta"><strong>{clip.name}</strong><span>@{clip.creator}</span></div><button className={following.includes(clip.creator) ? "follow-button is-following" : "follow-button"} onClick={() => setFollowing(following.includes(clip.creator) ? following.filter(x => x !== clip.creator) : [...following, clip.creator])}>{following.includes(clip.creator) ? "Following" : "Follow"}</button></div>
                <p className="caption">{clip.caption}</p><p className="hashtags">{clip.tags}</p>
                <div className="sound-line">♫ {clip.sound}</div>
                <div className="engagement">
                  <button className={liked.includes(clip.id) ? "engage active-like" : "engage"} onClick={() => toggle(liked, clip.id, setLiked)}><Heart size={19} fill={liked.includes(clip.id) ? "currentColor" : "none"}/><span>{liked.includes(clip.id) ? "24.9K" : clip.likes}</span></button>
                  <button className="engage" onClick={() => setShowLogin(true)}><MessageCircle size={19}/><span>{clip.comments}</span></button>
                  <button className="engage" onClick={() => setShowLogin(true)}><Share2 size={19}/><span>Share</span></button>
                  <button className={saved.includes(clip.id) ? "engage saved" : "engage"} aria-label="Save video" onClick={() => toggle(saved, clip.id, setSaved)}><Bookmark size={19} fill={saved.includes(clip.id) ? "currentColor" : "none"}/></button>
                </div>
              </div>
            </article>
          ))}
          <div className="end-feed"><span /> YOU'RE RIGHT ON TIME <span /></div>
        </section>

        <aside className="right-rail">
          <div className="welcome-card"><div className="welcome-orb">t.</div><span className="eyebrow">WELCOME TO TIVVA</span><h2>Your world.<br/>Your perspective.</h2><p>Discover voices, ideas and moments from everywhere.</p><button onClick={() => setShowSignup(true)}>Join the community <span>↗</span></button></div>
          <div className="trending-card"><div className="rail-title">What's happening <span>↗</span></div><div className="trend"><small>01 · CULTURE</small><strong>#MadeOnTivva</strong><span>Discover new creators</span></div><div className="trend"><small>02 · COMMUNITY</small><strong>#AroundTheWorld</strong><span>Stories without borders</span></div><div className="trend"><small>03 · CREATIVITY</small><strong>#MyTivvaMoment</strong><span>Show us your view</span></div></div>
          <div className="safety-note"><ShieldCheck size={17}/><div><strong>Creativity, with care.</strong><p>We're building a community where people can express themselves and feel respected.</p></div></div>
        </aside>
      </div>

      {(showLogin || showSignup) && <div className="modal-backdrop" onClick={() => {setShowLogin(false);setShowSignup(false);}}><section className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => {setShowLogin(false);setShowSignup(false);}}><X size={20}/></button><div className="modal-brand">t.</div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>{showSignup ? "Join Tivva." : "Welcome back."}</h2><p>{showSignup ? "Create your account and find your people." : "Log in to continue your Tivva journey."}</p><label>Email address<input type="email" placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="At least 8 characters"/></label><button className="modal-submit" onClick={() => alert("Account services are coming in the next development step.")}>{showSignup ? "Create account" : "Log in"}</button><p className="modal-switch">{showSignup ? "Already on Tivva?" : "New to Tivva?"} <button onClick={() => {setShowSignup(!showSignup);setShowLogin(!showLogin);}}>{showSignup ? "Log in" : "Create an account"}</button></p><small>Account creation and secure sign-in will be connected in the next setup stage.</small></section></div>}

      <nav className="mobile-bottom"><button className="selected"><Home size={20}/>Home</button><button><Compass size={20}/>Discover</button><button onClick={() => setShowLogin(true)}><PlusSquare size={20}/>Upload</button><button onClick={() => setShowLogin(true)}><UserRound size={20}/>Profile</button></nav>
    </main>
  );
}