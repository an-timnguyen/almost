import { useState, useEffect, useRef } from "react";
import { MapPin, Heart, Plus, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

type Post = {
  id: string;
  headline: string;
  body: string;
  location: string;
  hearts: number;
  created_at: string;
  avatar_url: string | null;
  poster_email: string | null;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function ReplyModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!message.trim() || !email.trim()) return;
    setLoading(true);

    await supabase.functions.invoke("notify-match", {
      body: {
        poster_email: post.poster_email,
        poster_headline: post.headline,
        reply_message: message,
        reply_email: email,
      },
    });

    setLoading(false);
    setSent(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <p
              className="text-foreground text-xl mb-2"
              style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
            >
              Message sent.
            </p>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Geist', sans-serif" }}>
              If it's meant to be, they'll write back.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-foreground text-xl leading-tight mb-1"
                  style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic" }}
                >
                  That's you?
                </h2>
                <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Geist', sans-serif" }}>
                  They'll get your message by email and can write back.
                </p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <p
              className="text-muted-foreground text-sm italic mb-5 leading-snug"
              style={{ fontFamily: "'Lora', serif" }}
            >
              "{post.headline}"
            </p>

            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something. You already missed once."
                rows={4}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-white/20 transition-colors text-sm leading-relaxed"
                style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email — so they can write back"
                type="email"
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-white/20 transition-colors"
                style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
              />
              <button
                onClick={submit}
                disabled={loading || !message.trim() || !email.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const [hearted, setHearted] = useState(false);
  const [heartCount, setHeartCount] = useState(post.hearts);
  const [replying, setReplying] = useState(false);

  function toggleHeart() {
    setHearted((h) => !h);
    setHeartCount((c) => (hearted ? c - 1 : c + 1));
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
        className="py-7 border-b border-border"
      >
        <div className="flex gap-5">
          <div className="flex-shrink-0 pt-0.5">
            {post.avatar_url ? (
              <img src={post.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-foreground leading-snug mb-2.5"
              style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontSize: "1.1rem", fontStyle: "italic" }}
            >
              {post.headline}
            </h2>
            <p
              className="text-muted-foreground text-sm leading-relaxed mb-4"
              style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
            >
              {post.body}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground text-xs" style={{ fontFamily: "'Geist', sans-serif" }}>
                <MapPin size={10} strokeWidth={1.5} />
                {post.location}
              </span>
              <span className="text-muted-foreground/60 text-xs" style={{ fontFamily: "'Geist', sans-serif" }}>
                {timeAgo(post.created_at)}
              </span>
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={toggleHeart}
                  className="flex items-center gap-1.5 text-xs transition-colors duration-200"
                  style={{ fontFamily: "'Geist', sans-serif", color: hearted ? "#c2705a" : "#a89e90", fontWeight: 400 }}
                >
                  <Heart size={13} strokeWidth={1.5} fill={hearted ? "#c2705a" : "none"} />
                  {heartCount}
                </button>
                {post.poster_email && (
                  <button
                    onClick={() => setReplying(true)}
                    className="text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/30 rounded-full px-3 py-1 transition-all duration-200"
                    style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
                  >
                    that&apos;s me
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {replying && <ReplyModal post={post} onClose={() => setReplying(false)} />}
      </AnimatePresence>
    </>
  );
}

function ComposeModal({ onClose, onPosted }: { onClose: () => void; onPosted: (post: Post) => void }) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function submit() {
    if (!headline.trim() || !body.trim() || !location.trim()) return;
    setLoading(true);

    let avatar_url: string | null = null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile);
      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({ headline, body, location, avatar_url, poster_email: email || null })
      .select()
      .single();

    setLoading(false);
    if (!error && data) {
      onPosted(data);
      onClose();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-7">
          <h2
            className="text-foreground text-xl leading-tight"
            style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic" }}
          >
            Post a missed<br />connection
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden hover:border-white/20 transition-colors flex-shrink-0"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={16} strokeWidth={1.5} className="text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Geist', sans-serif" }}>
              Add a photo of yourself<br />so they can find you
            </span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="How would you describe them in one sentence?"
            rows={2}
            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-white/20 transition-colors leading-snug"
            style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic", fontSize: "0.95rem" }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell them what you saw. What you felt. What you should have said."
            rows={3}
            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-white/20 transition-colors text-sm leading-relaxed"
            style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
          />
          <div className="relative">
            <MapPin size={13} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where did you see them?"
              className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-white/20 transition-colors"
              style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
            />
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email — only used if someone replies"
            type="email"
            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-white/20 transition-colors"
            style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
          />
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
          >
            {loading ? "Posting..." : "Send it out there"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  function handlePosted(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Geist', sans-serif" }}>
      <header
        className="sticky top-0 z-40 border-b border-border"
        style={{ background: "rgba(15,13,11,0.9)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <span
            className="text-foreground text-lg"
            style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic" }}
          >
            almost
          </span>
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-white/20 rounded-full px-3.5 py-1.5 transition-all duration-200"
            style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
          >
            <Plus size={11} strokeWidth={2} />
            post
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 sm:px-8 pt-12 pb-2">
        <p
          className="text-foreground/90 text-2xl sm:text-3xl leading-tight"
          style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: "italic" }}
        >
          For the ones you almost talked to.
        </p>
      </div>

      <main className="max-w-xl mx-auto px-5 sm:px-8 pb-24">
        {posts.length === 0 && (
          <p className="text-muted-foreground text-sm pt-12 text-center" style={{ fontFamily: "'Geist', sans-serif" }}>
            No posts yet. Be the first.
          </p>
        )}
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </main>

      <AnimatePresence>
        {composing && <ComposeModal onClose={() => setComposing(false)} onPosted={handlePosted} />}
      </AnimatePresence>
    </div>
  );
}
