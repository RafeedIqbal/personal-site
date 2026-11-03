"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROFILE } from "@/lib/content";

// A small fixed header that takes over once the giant hero title scrolls away.
// The ruled box on the left names the section currently under the reader.
export default function Masthead() {
  const [shown, setShown] = useState(false);
  const [section, setSection] = useState("");

  useEffect(() => {
    const title = document.getElementById("bl-hero-title");
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), {
      rootMargin: "-40px 0px 0px 0px",
    });
    if (title) observer.observe(title);

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = "";
      document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
        if (el.getBoundingClientRect().top <= line) current = el.dataset.section ?? "";
      });
      setSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="bl-mast bl-ui" data-shown={shown || undefined} aria-hidden={!shown}>
      <span className="bl-mast__box">{section || "Making the machine right"}</span>
      <a className="bl-mast__title" href="#top" tabIndex={shown ? 0 : -1}>
        Making the machine right
      </a>
      <span className="bl-mast__links">
        <Link href="/" className="bl-mast__name" tabIndex={shown ? 0 : -1}>
          Rafeed Iqbal
        </Link>
        <a href={`mailto:${PROFILE.email}`} tabIndex={shown ? 0 : -1}>
          Contact
        </a>
      </span>
    </div>
  );
}
