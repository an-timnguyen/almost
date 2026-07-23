import { useState, useEffect } from "react";
import { MapPin, Heart, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

type Post = {
  id: string;
  headline: string;
  body: string;
  location: string;
  hearts: number;
  created_at: string;
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

function PostCard({ post, index }: { post: Post; index: number }) {
  const [hearted, setHearted] = useState(false);
  const [heartCount, setHeartCount] = useState(post.hearts);

  function toggleHeart() {
    setHearted((h) => !h);
    setHeartCount((c) => (hearted ? c - 1 : c + 1));
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-7 border-b border-border"
    >
      <div className="flex gap-5">
        <div className="flex-shrink-0 pt-0.5">
          <div className="w-9 h-9 rounded-full bg-secondary" />
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
            <span
              className="flex items-center gap-1 text-muted-foreground text-xs"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
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
              <button
                className="text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/30 rounded-full px-3 py-1 transition-all duration-200"
                style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
              >
                that&apos;s me
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ComposeModal({ onClose, onPosted }: { onClose: () => void; onPosted: (post: Post) => void }) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!headline.trim() || !body.trim() || !location.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({ headline, body, location })
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
