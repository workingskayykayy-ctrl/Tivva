"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase";
import {
  Search, Home, Compass, PlusSquare, UserRound, Heart, MessageCircle,
  Share2, Bookmark, Play, Volume2, VolumeX, Menu, X, Sparkles,
  ChevronDown, ShieldCheck, Video, Upload, Film
} from "lucide-react";

type TivvaClip = {
  id: number | string;
  creator: string;
  name: string;
  caption: string;
  tags: string;
  likes: string;
  comments: string;
  color: string;
  initials: string;
  sound: string;
  videoUrl?: string;
  uploadedBy?: string;
};

const clips: TivvaClip[] = [
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
  const [liked, setLiked] = useState<(number | string)[]>([]);
  const [saved, setSaved] = useState<(number | string)[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"details" | "code">("details");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoCaption, setVideoCaption] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoMessage, setVideoMessage] = useState("");
  const [uploadedClips, setUploadedClips] = useState<TivvaClip[]>([]);
  const [commentsClip, setCommentsClip] = useState<TivvaClip | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<{id:string; comment:string; created_at:string; user_id:string}[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSending, setCommentSending] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSignedIn(Boolean(data.session));
        setProfileEmail(data.session?.user.email ?? "");
        const metadata = data.session?.user.user_metadata ?? {};
        setProfileName(metadata.display_name ?? "");
        setProfileUsername(metadata.username ?? "");
        setProfileBio(metadata.bio ?? "");
        setProfilePhotoUrl(metadata.avatar_url ?? "");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setProfileEmail(session?.user.email ?? "");
      const metadata = session?.user.user_metadata ?? {};
      setProfileName(metadata.display_name ?? "");
      setProfileUsername(metadata.username ?? "");
      setProfileBio(metadata.bio ?? "");
      setProfilePhotoUrl(metadata.avatar_url ?? "");
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    const loadVideoPosts = async () => {
      const { data, error } = await supabase
        .from("video_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active || error || !data) return;
      setUploadedClips(data.map((post) => ({
        id: post.id,
        creator: post.creator_username || "tivva.creator",
        name: post.creator_name || "Tivva Creator",
        caption: post.caption || "",
        tags: post.tags || "#Tivva #MyTivvaMoment",
        likes: "0",
        comments: "0",
        color: "sunset",
        initials: post.creator_initials || "TC",
        sound: "Original sound",
        videoUrl: post.video_url,
        uploadedBy: post.user_id
      })));
    };
    void loadVideoPosts();
    return () => { active = false; };
  }, []);

  const handleAuth = async () => {
    setAuthMessage("");
    if (password.length < 8) {
      setAuthMessage("Your password must be at least 8 characters.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthMessage("Tivva connection is not configured yet. Please try again after setup.");
      return;
    }
    setAuthBusy(true);
    try {
      if (authMethod === "phone") {
        if (!/^\\+[1-9]\\d{7,14}$/.test(phone.trim())) {
          throw new Error("Enter your phone number with country code, for example +2348012345678.");
        }
        if (showSignup) {
          if (phoneStep === "details") {
            const response = await fetch("/api/phone/send", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: phone.trim() })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not send your code.");
            setPhoneStep("code");
            setAuthMessage("We sent an SMS code. Enter it below to verify your number.");
            return;
          }
          const response = await fetch("/api/phone/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone.trim(), code: otp.trim(), password })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Phone verification failed.");
          const { error } = await supabase.auth.signInWithPassword({ phone: phone.trim(), password });
          if (error) throw error;
          setAuthMessage("Your phone is verified. Welcome to Tivva!");
          setShowLogin(false);
          setShowSignup(false);
        } else {
          const { error } = await supabase.auth.signInWithPassword({ phone: phone.trim(), password });
          if (error) throw error;
          setAuthMessage("You're signed in to Tivva.");
          setShowLogin(false);
          setShowSignup(false);
        }
      } else {
        if (!email.trim()) throw new Error("Enter your email address.");
        if (showSignup) {
          const { error } = await supabase.auth.signUp({ email: email.trim(), password });
          if (error) throw error;
          setAuthMessage("Account request received. Check your email for a confirmation link.");
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (error) throw error;
          if (!data.session) throw new Error("Tivva could not establish your login session. Please try again.");
          setSignedIn(true);
          setProfileEmail(data.session.user.email ?? email.trim());
          setShowLogin(false);
          setShowSignup(false);
          setAuthMessage("You're signed in to Tivva.");
        }
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "We couldn't complete that request. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const saveProfile = async () => {
    setProfileMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setProfileMessage("Tivva connection is not available. Please refresh and try again.");
      return;
    }
    const cleanUsername = profileUsername.trim().replace(/^@/, "").toLowerCase();
    if (cleanUsername && !/^[a-z0-9_.]{3,24}$/.test(cleanUsername)) {
      setProfileMessage("Username must be 3–24 characters and use only letters, numbers, dots or underscores.");
      return;
    }
    if (profilePhotoUrl.trim() && !/^https:\/\//i.test(profilePhotoUrl.trim())) {
      setProfileMessage("Please use a photo link beginning with https://.");
      return;
    }
    setProfileSaving(true);
    try {
      const updatePromise = supabase.auth.updateUser({
        data: {
          display_name: profileName.trim(),
          username: cleanUsername,
          bio: profileBio.trim(),
          avatar_url: profilePhotoUrl.trim()
        }
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Saving is taking too long. Please check your connection and try again.")), 20000);
      });
      const { error } = await Promise.race([updatePromise, timeoutPromise]);
      if (error) {
        setProfileMessage(error.message);
        return;
      }
      setProfileUsername(cleanUsername);
      setProfileMessage("Your profile has been saved.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "We couldn't save your profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    setProfileMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setProfileMessage("Tivva connection is not available. Refresh and try again."); return; }
    if (!file.type.startsWith("image/")) { setProfileMessage("Choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setProfileMessage("Photo must be 5 MB or smaller."); return; }
    setPhotoUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please log in again before uploading your photo.");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/profile-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      setProfilePhotoUrl(data.publicUrl);
      setProfileMessage("Photo uploaded. Tap Save profile to keep it.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Photo upload failed. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };


  const uploadVideo = async () => {
    setVideoMessage("");
    if (!videoFile) { setVideoMessage("Choose a video from your gallery first."); return; }
    if (!signedIn) { setVideoMessage("Please log in before uploading."); return; }
    if (!videoFile.type.startsWith("video/")) { setVideoMessage("Choose a video file."); return; }
    if (videoFile.size > 50 * 1024 * 1024) { setVideoMessage("Video must be 50 MB or smaller for this first version."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setVideoMessage("Tivva connection is unavailable. Refresh and try again."); return; }
    setVideoUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please log in again before uploading.");
      const ext = videoFile.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("tivva-videos").upload(path, videoFile, { contentType: videoFile.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("tivva-videos").getPublicUrl(path);
      const meta = user.user_metadata ?? {};
      const newClip: TivvaClip = {
        id: Date.now(), creator: meta.username || user.email?.split("@")[0] || "tivva.creator",
        name: meta.display_name || "Tivva Creator", caption: videoCaption.trim() || "My moment on Tivva ✨",
        tags: "#Tivva #MyTivvaMoment", likes: "0", comments: "0", color: "sunset",
        initials: (meta.display_name || "TC").slice(0, 2).toUpperCase(),
        sound: "Original sound", videoUrl: data.publicUrl, uploadedBy: user.id
      };
      const { error: postError } = await supabase.from("video_posts").insert({
        user_id: user.id,
        video_url: data.publicUrl,
        caption: newClip.caption,
        creator_username: newClip.creator,
        creator_name: newClip.name,
        creator_initials: newClip.initials,
        tags: newClip.tags
      });
      if (postError) {
        await supabase.storage.from("tivva-videos").remove([path]);
        throw postError;
      }
      setUploadedClips((prev) => [newClip, ...prev]);
      setVideoMessage("Your video is uploaded and added to this feed!");
      setVideoFile(null); setVideoCaption(""); setShowVideoUpload(false);
    } catch (error) {
      setVideoMessage(error instanceof Error ? error.message : "Video upload failed. Please try again.");
    } finally { setVideoUploading(false); }
  };

  const openComments = async (clip: TivvaClip) => {
    if (!signedIn) { setShowLogin(true); return; }
    setCommentsClip(clip);
    setCommentsOpen(true);
    setCommentsList([]);
    setCommentDraft("");
    setCommentMessage("");
    if (typeof clip.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clip.id)) {
      setCommentMessage("Comments can be added to community-uploaded videos. This is a Tivva preview video.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setCommentMessage("Tivva connection is unavailable. Refresh and try again."); return; }
    setCommentsLoading(true);
    const { data, error } = await supabase.from("video_comments").select("id,comment,created_at,user_id").eq("post_id", clip.id).order("created_at", { ascending: true });
    setCommentsLoading(false);
    if (error) { setCommentMessage(error.message); return; }
    setCommentsList(data ?? []);
  };

  const sendComment = async () => {
    const text = commentDraft.trim();
    if (!text) { setCommentMessage("Write a comment first."); return; }
    if (!commentsClip || typeof commentsClip.id !== "string") { setCommentMessage("Comments are only available on community videos."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setCommentMessage("Tivva connection is unavailable."); return; }
    setCommentSending(true);
    setCommentMessage("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setCommentSending(false); setCommentMessage("Please log in again to comment."); return; }
    const { data, error } = await supabase.from("video_comments").insert({
      post_id: commentsClip.id,
      user_id: user.id,
      comment: text
    }).select("id,comment,created_at,user_id").single();
    setCommentSending(false);
    if (error) { setCommentMessage(error.message); return; }
    setCommentsList((prev) => [...prev, data]);
    setCommentDraft("");
  };

  const toggle = (list: (number | string)[], id: number | string, setter: (value: (number | string)[]) => void) =>
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Tivva home"><span className="brand-mark">t</span><span>tivva</span><i>.</i></a>
        <div className="search-box"><Search size={17} /><input aria-label="Search Tivva" placeholder="Search creators, videos and sounds" /></div>
        <div className="top-actions">
          <button className="upload-button" onClick={() => signedIn ? setShowVideoUpload(true) : setShowLogin(true)}><PlusSquare size={17} /> Upload</button>
          {signedIn ? <span className="login-button" aria-live="polite">Signed in</span> : <><button className="login-button" onClick={() => setShowLogin(true)}>Log in</button><button className="signup-button" onClick={() => setShowSignup(true)}>Sign up</button></>}
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="layout">
        <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <nav className="main-nav">
            <button className="nav-item active"><Home size={20} /> For You</button>
            <button className="nav-item"><Compass size={20} /> Discover</button>
            <button className="nav-item" onClick={() => signedIn ? setShowVideoUpload(true) : setShowLogin(true)}><PlusSquare size={20} /> Upload video</button>
            <button className="nav-item" onClick={() => setShowLogin(true)}><MessageCircle size={20} /> Inbox</button>
            <button className="nav-item" onClick={() => signedIn ? setShowProfile(true) : setShowLogin(true)}><UserRound size={20} /> Profile</button>
          </nav>
          <div className="sidebar-divider" />
          <p className="side-label">Your world starts here</p>
          <p className="side-copy">Log in to follow creators, save videos and build your own community.</p>
          <button className="outline-signup" onClick={() => setShowSignup(true)}>Create an account</button>
          <div className="sidebar-note"><ShieldCheck size={15} /> A space for real creativity.</div>
          <div className="side-footer">About · Guidelines · Privacy · Terms<br/>© 2026 Tivva</div>
        </aside>

        <section className="feed-column">
          {showProfile && signedIn ? <div className="profile-page">
            <div className="profile-topline"><div><span className="eyebrow">YOUR TIVVA ACCOUNT</span><h1>Your profile.</h1><p className="profile-email">{profileEmail || "Signed-in account"}</p></div><button className="following-select" onClick={() => setShowProfile(false)}>Back to feed</button></div>
            <div className="profile-editor">
              <div className="profile-avatar-preview">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="Your profile" /> : <UserRound size={34} />}</div>
              <p className="profile-hint">Upload a photo from your phone and tell the Tivva community about yourself.</p><label className="photo-upload-label"><span>{photoUploading ? "Uploading photo..." : "Choose photo from gallery"}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadProfilePhoto(file); event.currentTarget.value = ""; }} disabled={photoUploading} /></label>
              <label>Display name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={50} placeholder="Your name" /></label>
              <label>Username<input value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} maxLength={24} placeholder="yourusername" /></label>
              <label>Bio<textarea value={profileBio} onChange={(event) => setProfileBio(event.target.value)} maxLength={160} rows={4} placeholder="A little about you..." /></label>
              <label>Profile photo link (optional)<input type="url" value={profilePhotoUrl} onChange={(event) => setProfilePhotoUrl(event.target.value)} placeholder="https://..." /></label>
              <div className="profile-count">{profileBio.length}/160 characters</div>
              {profileMessage && <p className="profile-message" role="status">{profileMessage}</p>}
              <button className="profile-save" onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Saving..." : "Save profile"}</button>
            </div>
          </div> : <><div className="feed-heading">
            <div><span className="eyebrow"><Sparkles size={13} /> YOUR DAILY DOSE OF DISCOVERY</span><h1>Find your <span>moment.</span></h1></div>
            <button className="following-select" onClick={() => setActiveTab(activeTab === "For You" ? "Following" : "For You")}>{activeTab}<ChevronDown size={15}/></button>
          </div>
          <div className="feed-tabs">
            {["For You", "Following", "Trending"].map((tab) => <button key={tab} className={activeTab === tab ? "tab active-tab" : "tab"} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>

          {[...uploadedClips, ...clips].map((clip, index) => (
            <article className="video-card" key={clip.id}>
              <div className={`video-stage ${clip.color}`}>
                {clip.videoUrl ? <video className="uploaded-video" src={clip.videoUrl} controls playsInline /> : <><div className="stage-glow" />
                <div className="stage-content">
                  <span className="stage-kicker">TIVVA ORIGINALS</span>
                  <div className="stage-art">{index === 0 ? "MOMENTS" : index === 1 ? "TASTE IT." : "GO FURTHER."}</div>
                  <p>{index === 0 ? "Life happens in the little things." : index === 1 ? "A world of flavour awaits." : "Your next chapter is out there."}</p>
                  <div className="play-disc"><Play size={22} fill="currentColor" /></div>
                </div>
                <span className="preview-label"><Video size={12}/> VIDEO PREVIEW</span>
                <button className="sound-toggle" aria-label={muted ? "Unmute preview" : "Mute preview"} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button></>}
              </div>
              <div className="video-details">
                <div className="creator-row"><div className="avatar">{clip.initials}</div><div className="creator-meta"><strong>{clip.name}</strong><span>@{clip.creator}</span></div><button className={following.includes(clip.creator) ? "follow-button is-following" : "follow-button"} onClick={() => setFollowing(following.includes(clip.creator) ? following.filter(x => x !== clip.creator) : [...following, clip.creator])}>{following.includes(clip.creator) ? "Following" : "Follow"}</button></div>
                <p className="caption">{clip.caption}</p><p className="hashtags">{clip.tags}</p>
                <div className="sound-line">♫ {clip.sound}</div>
                <div className="engagement">
                  <button className={liked.includes(clip.id) ? "engage active-like" : "engage"} onClick={() => toggle(liked, clip.id, setLiked)}><Heart size={19} fill={liked.includes(clip.id) ? "currentColor" : "none"}/><span>{liked.includes(clip.id) ? "24.9K" : clip.likes}</span></button>
                  <button className="engage" onClick={() => void openComments(clip)}><MessageCircle size={19}/><span>{commentsClip?.id === clip.id && commentsOpen ? commentsList.length : clip.comments}</span></button>
                  <button className="engage" onClick={() => setShowLogin(true)}><Share2 size={19}/><span>Share</span></button>
                  <button className={saved.includes(clip.id) ? "engage saved" : "engage"} aria-label="Save video" onClick={() => toggle(saved, clip.id, setSaved)}><Bookmark size={19} fill={saved.includes(clip.id) ? "currentColor" : "none"}/></button>
                </div>
              </div>
            </article>
          ))}
          <div className="end-feed"><span /> YOU&apos;RE RIGHT ON TIME <span /></div></>}
        </section>

        <aside className="right-rail">
          <div className="welcome-card"><div className="welcome-orb">t.</div><span className="eyebrow">WELCOME TO TIVVA</span><h2>Your world.<br/>Your perspective.</h2><p>Discover voices, ideas and moments from everywhere.</p><button onClick={() => setShowSignup(true)}>Join the community <span>↗</span></button></div>
          <div className="trending-card"><div className="rail-title">What&apos;s happening <span>↗</span></div><div className="trend"><small>01 · CULTURE</small><strong>#MadeOnTivva</strong><span>Discover new creators</span></div><div className="trend"><small>02 · COMMUNITY</small><strong>#AroundTheWorld</strong><span>Stories without borders</span></div><div className="trend"><small>03 · CREATIVITY</small><strong>#MyTivvaMoment</strong><span>Show us your view</span></div></div>
          <div className="safety-note"><ShieldCheck size={17}/><div><strong>Creativity, with care.</strong><p>We&apos;re building a community where people can express themselves and feel respected.</p></div></div>
        </aside>
      </div>



      {commentsOpen && commentsClip && <div className="modal-backdrop" onClick={() => setCommentsOpen(false)}><section className="auth-modal comments-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close comments" onClick={() => setCommentsOpen(false)}><X size={20}/></button><span className="eyebrow">COMMUNITY CONVERSATION</span><h2>Comments</h2><p className="comments-video-caption">{commentsClip.caption}</p><div className="comments-list">{commentsLoading ? <p>Loading comments...</p> : commentsList.length ? commentsList.map((item) => <div className="comment-item" key={item.id}><div className="comment-avatar">T</div><div><strong>Tivva user</strong><p>{item.comment}</p><small>{new Date(item.created_at).toLocaleString()}</small></div></div> : <p className="comments-empty">No comments yet. Be the first to join the conversation.</p>}</div>{commentMessage && <p role="status" className="comments-message">{commentMessage}</p>}{commentsClip && typeof commentsClip.id === "string" && <div className="comment-compose"><textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={500} rows={3} placeholder="Write a comment..."/><button className="modal-submit" disabled={commentSending} onClick={() => void sendComment()}>{commentSending ? "Posting..." : "Post comment"}</button></div>}</section></div>}
      {showVideoUpload && <div className="modal-backdrop" onClick={() => { if (!videoUploading) setShowVideoUpload(false); }}><section className="auth-modal video-upload-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => { if (!videoUploading) setShowVideoUpload(false); }}><X size={20}/></button><div className="modal-brand"><Film size={26}/></div><span className="eyebrow">SHARE YOUR MOMENT</span><h2>Upload a video.</h2><p>Select a video from your phone gallery and share it with Tivva.</p><label className="video-file-picker"><Upload size={19}/><span>{videoFile ? videoFile.name : "Choose video from gallery"}</span><input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)}/></label>{videoFile && <video className="video-upload-preview" src={URL.createObjectURL(videoFile)} controls playsInline /> }<label>Caption<textarea className="video-caption-input" value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)} maxLength={220} placeholder="What's happening in your video?" rows={3}/></label><small className="upload-limit">Video limit: 50 MB. Please upload a video you own or have permission to share.</small>{videoMessage && <p role="status">{videoMessage}</p>}<button className="modal-submit" disabled={videoUploading} onClick={uploadVideo}>{videoUploading ? "Uploading video..." : "Post video"}</button></section></div>}
      {(showLogin || showSignup) && <div className="modal-backdrop" onClick={() => {setShowLogin(false);setShowSignup(false);}}><section className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => {setShowLogin(false);setShowSignup(false);}}><X size={20}/></button><div className="modal-brand">t.</div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>{showSignup ? "Join Tivva." : "Welcome back."}</h2><p>{showSignup ? "Create your account and find your people." : "Log in to continue your Tivva journey."}</p><div className="auth-methods"><button type="button" className={authMethod === "email" ? "auth-method active" : "auth-method"} onClick={() => {setAuthMethod("email");setPhoneStep("details");setAuthMessage("");}}>Email</button><button type="button" className={authMethod === "phone" ? "auth-method active" : "auth-method"} onClick={() => {setAuthMethod("phone");setPhoneStep("details");setAuthMessage("");}}>Phone</button></div>{authMethod === "email" ? <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></label> : <><label>Phone number<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+2348012345678"/></label>{showSignup && phoneStep === "code" && <label>SMS verification code<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter the code sent to your phone"/></label>}</>}<label>Password<input type="password" autoComplete={showSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"/></label>{authMessage && <p role="status" aria-live="polite">{authMessage}</p>}<button className="modal-submit" disabled={authBusy} onClick={handleAuth}>{authBusy ? "Please wait..." : showSignup && authMethod === "phone" && phoneStep === "details" ? "Send verification code" : showSignup ? authMethod === "phone" ? "Verify & create account" : "Create account" : "Log in"}</button><p className="modal-switch">{showSignup ? "Already on Tivva?" : "New to Tivva?"} <button onClick={() => {setShowSignup(!showSignup);setShowLogin(!showLogin);}}>{showSignup ? "Log in" : "Create an account"}</button></p><small>Keep your password private. Tivva uses secure Supabase authentication.</small></section></div>}

      <nav className="mobile-bottom"><button className="selected"><Home size={20}/>Home</button><button><Compass size={20}/>Discover</button><button onClick={() => signedIn ? setShowVideoUpload(true) : setShowLogin(true)}><PlusSquare size={20}/>Upload</button><button onClick={() => signedIn ? setShowProfile(true) : setShowLogin(true)}><UserRound size={20}/>Profile</button></nav>
    </main>
  );
}