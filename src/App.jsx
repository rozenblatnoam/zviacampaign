import React, { useEffect, useMemo, useState } from "react";
import kolleLogo from "./assets/kollel-logo.jpg";
import tzviaLogo from "./assets/tzvia.png";
import eretzLogo from "./assets/eretz.jpg";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* =========================================================
   PRIZES
========================================================= */

const PRIZES = [
  // 750 ₪
  {
    id: 1,
    amount: 750,
    emoji: "🎟️",
    title: "שובר לחנות ארץ",
    subtitle: "גייסת 750 ₪ לבית המדרש?",
    description: "שובר לחנות ארץ ציוד מחנאות או פק״ל קפה!",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=90",
    className: "green",
  },
  // 1,500 ₪
  {
    id: 3,
    amount: 1500,
    emoji: "🔊",
    title: "בוקסה אלחוטית JBL",
    subtitle: "גייסת 1,500 ₪ לבית המדרש?",
    description: "בוקסה אלחוטית JBL !",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=90",
    className: "blue",
  },
  {
    id: 4,
    amount: 1500,
    emoji: "🎧",
    title: "אוזניות Bluetooth",
    subtitle: "גייסת 1,500 ₪ לבית המדרש?",
    description: "אוזניות Bluetooth איכותיות!",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90",
    className: "blue",
  },

  // 2,500 ₪
  {
    id: 5,
    amount: 2500,
    emoji: "⛺",
    title: "ערכת מחנאות – אוהל ושק״ש",
    subtitle: "הגעת ל־2,500 ₪?",
    description: "ערכת מחנאות הכוללת אוהל ושק שינה!",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=90",
    className: "orange",
  },
  // 3,500 ₪
  {
    id: 7,
    amount: 4000,
    emoji: "🚲",
    title: "אופניים",
    subtitle: "הגעת ל־4,000 ₪?",
    description: "אופניים איכותיים לרכיבה!",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=90",
    className: "purple",
  },
  {
    id: 8,
    amount: 4000,
    emoji: "🚁",
    title: "רחפן",
    subtitle: "הגעת ל־4,000 ₪?",
    description: "רחפן איכותי לחוויית טיסה!",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1000&q=90",
    className: "purple",
  },
];

const PRIZE_AMOUNTS = [...new Set(PRIZES.map((prize) => prize.amount))];
const MAX_AMOUNT = Math.max(...PRIZE_AMOUNTS);

/* =========================================================
   HELPERS
========================================================= */

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =========================================================
   ICONS
========================================================= */

function ArrowLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

/* =========================================================
   CONFETTI
========================================================= */

function Confetti({ active }) {
  const pieces = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.2,
      size: 6 + Math.random() * 7,
      color: [
        "#2563eb",
        "#f97316",
        "#facc15",
        "#8b5cf6",
        "#22c55e",
      ][i % 5],
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.45}px`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [raisedInput, setRaisedInput] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    grade: "",
    phone: "",
    target: "",
    selectedPrize: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const raised =
    Number(String(raisedInput).replace(/[^\d]/g, "")) || 0;

  const progress = Math.min(
    100,
    (raised / MAX_AMOUNT) * 100
  );

  const reachedAmount = [...PRIZE_AMOUNTS]
    .reverse()
    .find((amount) => raised >= amount);

  const nextAmount = PRIZE_AMOUNTS.find(
    (amount) => raised < amount
  );

  const reachedPrize = reachedAmount
    ? PRIZES.find((prize) => prize.amount === reachedAmount)
    : null;

  const nextPrize = nextAmount
    ? PRIZES.find((prize) => prize.amount === nextAmount)
    : null;

  const maxReached = raised >= MAX_AMOUNT;

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (maxReached) {
      setShowConfetti(true);

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [maxReached]);

  /* =======================================================
     FORM
  ======================================================= */

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const chooseTarget = (amount) => {
    setForm((current) => ({
      ...current,
      target: String(amount),
      selectedPrize: "",
    }));
  };

  const choosePrize = (prize) => {
    setForm((current) => ({
      ...current,
      target: String(prize.amount),
      selectedPrize: String(prize.id),
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.target ||
      !form.selectedPrize
    ) {
      return;
    }

    const selectedPrize = PRIZES.find(
      (prize) => String(prize.id) === String(form.selectedPrize)
    );

    try {
      await addDoc(collection(db, "registrations"), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        grade: form.grade.trim(),
        phone: form.phone.trim(),
        target: Number(form.target),
        prizeId: selectedPrize?.id || "",
        prize: selectedPrize?.title || "",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Registration save failed:", error);
      alert("אירעה שגיאה בשמירת ההרשמה. נסה שוב.");
    }
  };

  /* =======================================================
     PROGRESS MESSAGE
  ======================================================= */

  let progressMessage = (
    <>
      הכנס את הסכום שכבר גייסת
      <br />
      וראה לאיזה פרס אתה מתקרב 🚀
    </>
  );

  if (raised > 0 && nextPrize) {
    const remaining = nextPrize.amount - raised;

    progressMessage = (
      <>
        {reachedPrize ? (
          <>
            כל הכבוד! הגעת ל־
            <strong>
              {reachedAmount.toLocaleString("he-IL")} ₪
            </strong>
            ! 🎉
            <br />
          </>
        ) : (
          <>
            כל הכבוד על ההתחלה! 💪
            <br />
          </>
        )}

        נשארו לך רק{" "}
        <strong>
          {remaining.toLocaleString("he-IL")} ₪
        </strong>{" "}
        עד פרס ב־{nextAmount.toLocaleString("he-IL")} ₪!
      </>
    );
  }

  if (maxReached) {
    progressMessage = (
      <>
        🎉 <strong>הגעת ל־{MAX_AMOUNT.toLocaleString("he-IL")} ₪!</strong>
        <br />
        הרחפן מחכה לך! 🚁
      </>
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="campaign" dir="rtl" lang="he">
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&family=Rubik:wght@500;600;700;800;900&display=swap');

        :root {
          --blue: #263b91;
          --blue-light: #eaf2ff;
          --blue-mid: #4f7bd9;

          --orange: #f28c18;
          --orange-light: #fff3df;

          --yellow: #ffd43b;
          --yellow-light: #fff9dc;

          --purple: #7456d9;
          --purple-light: #f0ebff;

          --green: #20a464;

          --dark: #182235;
          --text: #263246;
          --muted: #637086;

          --white: #ffffff;
          --background: #f7faff;

          --border: #e2e8f2;

          font-family: "Heebo", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--background);
          color: var(--text);
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        /* =====================================================
           PAGE
        ===================================================== */

        .campaign {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 5%,
              rgba(255, 212, 59, .18),
              transparent 20%
            ),
            radial-gradient(
              circle at 95% 15%,
              rgba(79, 123, 217, .14),
              transparent 25%
            ),
            #f7faff;
          overflow-x: hidden;
        }

        .container {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .hero {
          position: relative;
          padding: 28px 0 70px;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f5f9ff 100%
            );
        }

        .hero::after {
          content: "";
          position: absolute;
          bottom: -35px;
          left: 0;
          right: 0;
          height: 70px;
          background: #f7faff;
          border-radius: 50% 50% 0 0;
        }

        .logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          margin-bottom: 30px;
        }

        .logo-wrapper {
          height: 105px;
          max-width: 270px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-wrapper.tzvia {
          width: 285px;
        }

        .logo-wrapper.kollel {
          width: 225px;
        }

        .logo-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }

        .logo-divider {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--yellow);
          color: var(--blue);
          font-family: "Rubik";
          font-size: 24px;
          font-weight: 900;
          box-shadow: 0 7px 18px rgba(242, 173, 0, .25);
        }

        .top-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 17px;
          border-radius: 999px;
          background: var(--yellow-light);
          border: 1px solid #f5df72;
          color: #805e00;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .hero h1 {
          margin: 0;
          color: var(--blue);
          font-family: "Rubik";
          font-size: clamp(36px, 7vw, 66px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.035em;
        }

        .hero h1 span {
          display: block;
          margin-top: 5px;
          color: var(--orange);
        }

       .hero-main {
  max-width: 780px;
  margin: 22px auto 0;
  color: var(--dark);
  font-size: clamp(20px, 3.5vw, 27px);
  line-height: 1.45;
  font-weight: 700;
}

.hero-main span {
  display: block;
}

.hero-main .blue-line {
  color: var(--blue);
  font-weight: 900;
}

.hero-main strong {
  color: var(--blue);
}

        .hero-description {
          max-width: 670px;
          margin: 14px auto 0;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .primary-btn {
          border: 0;
          border-radius: 14px;
          padding: 15px 28px;
          background: var(--blue);
          color: #ffffff;
          font-size: 17px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(38, 59, 145, .25);
          transition: .2s;
        }

        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(38, 59, 145, .30);
        }

        .secondary-btn {
          border: 2px solid var(--blue);
          border-radius: 14px;
          padding: 13px 25px;
          background: #ffffff;
          color: var(--blue);
          font-size: 16px;
          font-weight: 800;
        }

        .secondary-btn:hover {
          background: var(--blue-light);
        }

        /* =====================================================
           MISSION
        ===================================================== */

        .mission {
          position: relative;
          z-index: 3;
          margin-top: -10px;
        }

        .mission-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 21px 25px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 12px 35px rgba(34, 53, 85, .08);
          text-align: center;
        }

        .mission-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: var(--yellow);
          font-size: 25px;
        }

        .mission-title {
          color: var(--blue);
          font-family: "Rubik";
          font-size: 20px;
          font-weight: 900;
        }

        .mission-text {
          margin-top: 2px;
          color: var(--muted);
          font-size: 15px;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .section {
          padding: 75px 0;
        }

        .section-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .section-header h2 {
          margin: 0;
          color: var(--blue);
          font-family: "Rubik";
          font-size: clamp(29px, 5vw, 43px);
          line-height: 1.15;
          font-weight: 900;
        }

        .section-header p {
          max-width: 650px;
          margin: 10px auto 0;
          color: var(--muted);
          font-size: 17px;
        }

        /* =====================================================
           STEPS
        ===================================================== */

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .step {
          position: relative;
          padding: 27px 24px;
          border-radius: 21px;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 8px 25px rgba(34, 53, 85, .055);
          text-align: center;
        }

        .step-number {
          width: 55px;
          height: 55px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: var(--blue-light);
          color: var(--blue);
          font-family: "Rubik";
          font-size: 22px;
          font-weight: 900;
        }

        .step:nth-child(2) .step-number {
          background: var(--orange-light);
          color: var(--orange);
        }

        .step:nth-child(3) .step-number {
          background: var(--yellow-light);
          color: #9a7300;
        }

        .step h3 {
          margin: 13px 0 5px;
          color: var(--dark);
          font-family: "Rubik";
          font-size: 21px;
          font-weight: 900;
        }

        .step p {
          margin: 0;
          color: var(--muted);
          line-height: 1.65;
        }

        /* =====================================================
           PRIZES
        ===================================================== */

        .prizes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 23px;
          align-items: stretch;
        }

        .prize {
          position: relative;
          overflow: hidden;
          border-radius: 25px;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 12px 35px rgba(34, 53, 85, .08);
          transition: .25s;
        }

        .prize:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(34, 53, 85, .13);
        }

        .prize.blue {
          border-top: 7px solid var(--blue);
        }

        .prize.orange {
          border-top: 7px solid var(--orange);
        }

        .prize.purple {
          border-top: 7px solid var(--purple);
        }

        .prize.green {
          border-top: 7px solid var(--green);
        }

        .prize-image {
          position: relative;
          height: 300px;
          overflow: hidden;
          background: #eef3f9;
        }

        .prize-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .45s;
        }

        .prize-image.eretz-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .prize-image.eretz-logo img {
          width: 78%;
          height: auto;
          max-height: 72%;
          object-fit: contain;
          padding: 28px;
          box-sizing: border-box;
          transform: none !important;
        }

        .prize:hover .prize-image img {
          transform: scale(1.06);
        }

        .prize:hover .prize-image.eretz-logo img {
          transform: none !important;
        }

        .prize-amount {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 2;
          padding: 8px 14px;
          border-radius: 999px;
          background: #ffffff;
          color: var(--blue);
          font-family: "Rubik";
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 6px 20px rgba(0,0,0,.14);
        }

        .prize.orange .prize-amount {
          color: var(--orange);
        }

        .prize.purple .prize-amount {
          color: var(--purple);
        }

        .prize.green .prize-amount {
          color: var(--green);
        }

        .prize-disclaimer {
          padding: 8px 12px 0;
          color: #8a95a7;
          text-align: center;
          font-size: 12px;
          font-weight: 500;
        }

        .prize-content {
          padding: 20px 22px 23px;
          text-align: center;
        }

        .prize-emoji {
          font-size: 27px;
        }

        .prize h3 {
          margin: 5px 0 4px;
          color: var(--dark);
          font-family: "Rubik";
          font-size: 25px;
          font-weight: 900;
        }

        .prize-subtitle {
          color: var(--muted);
          font-size: 16px;
          font-weight: 600;
        }

        .prize-description {
          margin: 5px 0 20px;
          color: var(--blue);
          font-size: 18px;
          font-weight: 900;
        }

        .prize.orange .prize-description {
          color: var(--orange);
        }

        .prize.purple .prize-description {
          color: var(--purple);
        }

        .prize-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 12px;
          padding: 12px;
          background: var(--blue-light);
          color: var(--blue);
          font-size: 15px;
          font-weight: 900;
        }

        .prize.orange .prize-button {
          background: var(--orange-light);
          color: #c56d00;
        }

        .prize.purple .prize-button {
          background: var(--purple-light);
          color: var(--purple);
        }

        .prize.green .prize-button {
          background: #e9f8f1;
          color: var(--green);
        }

        /* =====================================================
           PROGRESS
        ===================================================== */

        .progress-wrapper {
          position: relative;
          max-width: 900px;
          margin: auto;
          padding: 35px;
          border-radius: 26px;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 12px 35px rgba(34, 53, 85, .07);
          overflow: hidden;
        }

        .progress-input {
          display: block;
          width: min(420px, 100%);
          margin: 0 auto 30px;
          padding: 15px 18px;
          border: 2px solid var(--border);
          border-radius: 13px;
          background: #f8faff;
          color: var(--dark);
          text-align: center;
          font-size: 17px;
          font-weight: 700;
        }

        .progress-input::placeholder {
          color: #8995a8;
        }

        .progress-input:focus {
          outline: none;
          border-color: var(--blue);
          background: #ffffff;
        }

        .progress-track {
          height: 19px;
          overflow: hidden;
          border-radius: 999px;
          background: #e9eef6;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #4f7bd9,
            #2563eb,
            #facc15
          );
          transition: width .5s ease;
        }

        .progress-labels {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          margin-top: 15px;
        }

        .progress-label {
          color: #8a95a7;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        .progress-label.active {
          color: var(--blue);
          font-weight: 900;
        }

        .progress-label span {
          display: block;
          margin-top: 2px;
        }

        .progress-message {
          margin-top: 28px;
          padding: 18px;
          border-radius: 14px;
          background: var(--blue-light);
          color: var(--blue);
          text-align: center;
          font-size: 16px;
          line-height: 1.65;
        }

        /* =====================================================
           MISSION
        ===================================================== */

        .mission-section {
          max-width: 760px;
          margin: auto;
          padding: 48px 30px;
          border-radius: 28px;
          background: linear-gradient(
            135deg,
            #ffffff,
            #f4f8ff
          );
          border: 1px solid var(--border);
          text-align: center;
          box-shadow: 0 12px 35px rgba(34, 53, 85, .06);
        }

        .mission-section h2 {
          margin: 0 0 15px;
          color: var(--blue);
          font-family: "Rubik";
          font-size: clamp(29px, 5vw, 40px);
          font-weight: 900;
        }

        .mission-lead {
          color: var(--muted);
          font-size: 18px;
          line-height: 1.8;
        }

        .mission-lines {
          margin-top: 27px;
          color: var(--dark);
          font-family: "Rubik";
          font-size: clamp(21px, 4vw, 29px);
          line-height: 1.65;
          font-weight: 900;
        }

        .mission-lines .blue {
          color: var(--blue);
        }

        .mission-lines .orange {
          color: var(--orange);
        }

        .mission-lines .green {
          color: var(--green);
        }

        /* =====================================================
           FINAL CTA
        ===================================================== */

        .final {
          position: relative;
          overflow: hidden;
          padding: 60px 25px;
          border-radius: 30px;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(255,255,255,.35),
              transparent 20%
            ),
            linear-gradient(
              135deg,
              #263b91,
              #4264b9
            );
          color: white;
          text-align: center;
        }

        .final::after {
          content: "🎁";
          position: absolute;
          left: 35px;
          bottom: -15px;
          font-size: 90px;
          opacity: .13;
          transform: rotate(-15deg);
        }

        .final h2 {
          margin: 0;
          font-family: "Rubik";
          font-size: clamp(31px, 6vw, 48px);
          font-weight: 900;
        }

        .final p {
          margin: 10px auto 27px;
          color: #e8efff;
          font-size: 18px;
        }

        .final .primary-btn {
          background: var(--yellow);
          color: #263b91;
          box-shadow: 0 10px 25px rgba(0,0,0,.18);
        }

        /* =====================================================
           FORM
        ===================================================== */

        .form {
          max-width: 620px;
          margin: auto;
          padding: 30px;
          border-radius: 25px;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 12px 35px rgba(34, 53, 85, .07);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .field {
          margin-bottom: 15px;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          color: var(--dark);
          font-size: 14px;
          font-weight: 700;
        }

        .field input {
          width: 100%;
          padding: 13px 14px;
          border: 2px solid var(--border);
          border-radius: 11px;
          background: #f9fbfe;
          color: var(--dark);
          font-size: 15px;
        }

        .field input::placeholder {
          color: #929dad;
        }

        .field input:focus {
          outline: none;
          border-color: var(--blue);
          background: #ffffff;
        }

        .targets {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .prize-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .prize-choice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 58px;
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 10px;
          background: #ffffff;
          color: var(--dark);
          font-weight: 800;
          transition: .15s;
        }

        .prize-choice:hover {
          border-color: var(--blue-light);
          background: #f8faff;
        }

        .prize-choice.active {
          border-color: var(--blue);
          background: var(--blue-light);
          color: var(--blue);
        }

        .prize-choice-emoji {
          font-size: 24px;
        }

        .target {
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 12px 8px;
          background: #ffffff;
          color: var(--muted);
          font-weight: 900;
          transition: .15s;
        }

        .target:hover {
          border-color: var(--blue-light);
        }

        .target.active {
          border-color: var(--blue);
          background: var(--blue-light);
          color: var(--blue);
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 13px;
          padding: 15px;
          background: var(--blue);
          color: #ffffff;
          font-size: 17px;
          font-weight: 900;
        }

        .submit:hover {
          background: #1d307b;
        }

        .success {
          padding: 25px;
          text-align: center;
        }

        .success-icon {
          width: 66px;
          height: 66px;
          margin: auto auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dcf7e9;
          color: var(--green);
        }

        .success h3 {
          margin: 0;
          color: var(--blue);
          font-family: "Rubik";
          font-size: 27px;
          font-weight: 900;
        }

        .success p {
          color: var(--muted);
          line-height: 1.7;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .footer {
          padding: 45px 20px 90px;
          background: #ffffff;
          border-top: 1px solid var(--border);
          color: var(--muted);
          text-align: center;
        }

        .footer strong {
          display: block;
          margin-bottom: 5px;
          color: var(--blue);
          font-size: 17px;
        }

        /* =====================================================
           STICKY
        ===================================================== */

        .sticky {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          padding: 9px 13px;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border);
          transform: translateY(110%);
          transition: .25s;
        }

        .sticky.visible {
          transform: translateY(0);
        }

        .sticky button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 13px;
          background: var(--blue);
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
        }

        /* =====================================================
           CONFETTI
        ===================================================== */

        .confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 20;
        }

        .confetti span {
          position: absolute;
          top: -20px;
          border-radius: 3px;
          animation: fall 2.5s ease-in forwards;
        }

        @keyframes fall {
          to {
            transform:
              translateY(500px)
              rotate(600deg);
            opacity: 0;
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 850px) {

          .prizes {
            grid-template-columns: repeat(2, 1fr);
            max-width: 760px;
            margin: auto;
          }

          .steps {
            grid-template-columns: 1fr;
            max-width: 560px;
            margin: auto;
          }

          .prize-image {
            height: 330px;
          }
        }

        @media (min-width: 900px) {
          .sticky {
            display: none;
          }
        }

        @media (max-width: 650px) {

          .container {
            width: calc(100% - 24px);
          }

          .hero {
            padding-top: 18px;
            padding-bottom: 60px;
          }

          .logos {
            gap: 10px;
            margin-bottom: 23px;
          }

          .logo-wrapper {
            height: 80px;
          }

          .logo-wrapper.tzvia {
            width: 190px;
          }

          .logo-wrapper.kollel {
            width: 155px;
          }

          .logo-divider {
            width: 35px;
            height: 35px;
            flex-basis: 35px;
            font-size: 17px;
          }

          .top-badge {
            font-size: 12px;
            padding: 7px 12px;
          }

          .hero-main {
            font-size: 19px;
          }

          .hero-description {
            font-size: 15px;
          }

          .mission-card {
            display: block;
            padding: 20px 17px;
          }

          .mission-icon {
            margin: 0 auto 10px;
          }

          .section {
            padding: 55px 0;
          }

          .progress-wrapper {
            padding: 25px 15px;
          }

          .progress-labels {
            gap: 0;
          }

          .progress-label {
            font-size: 11px;
          }

          .progress-label span {
            font-size: 10px;
          }

          .form {
            padding: 22px 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .targets {
            grid-template-columns: repeat(2, 1fr);
          }

          .prize-choice-grid {
            grid-template-columns: 1fr;
          }

          .prizes {
            grid-template-columns: 1fr;
            max-width: 560px;
          }

          .prize-image {
            height: 290px;
          }

          .mission-section {
            padding: 35px 20px;
          }

          .final {
            padding: 48px 20px;
          }
        }

      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">
        <div className="container">

          <div className="logos">

            <div className="logo-wrapper tzvia">
              <img
                src={tzviaLogo}
                alt="צביה הר ברכה"
              />
            </div>

            <div className="logo-wrapper kollel">
              <img
                src={kolleLogo}
                alt="כולל דיינות ענב"
              />
            </div>

          </div>

          <h1>
            בחורי ישיבת צביה הר ברכה
            <span>מתגייסים למען התורה!</span>
          </h1>

  <p className="hero-main">
  <span>
    מצטרפים לאתגר, משתפים את המשפחה והחברים, ועוזרים,
  </span>
  <span className="blue-line">
    לבית המדרש לדיינות ענב
  </span>
  <span>
    להמשיך ולצמוח.
  </span>
</p>

          <p className="hero-description">
            והכי כיף?
            מגיעים ליעד — וזוכים בפרסים שווים במיוחד! 🎁
          </p>

          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={() => scrollToSection("signup")}
            >
              🚀 אני מצטרף לאתגר
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollToSection("prizes")}
            >
              🎁 איזה פרסים יש?
            </button>

          </div>

        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="mission">
        <div className="container">

          <div className="mission-card">

            <div className="mission-icon">
              📖
            </div>

            <div>
              <div className="mission-title">
                אתם לא רק מגייסים — אתם שותפים!
              </div>

              <div className="mission-text">
                כל תלמיד שמצטרף עוזר לבנות ולהצמיח את בית המדרש
                לדיינות ענב.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="section-header">
            <h2>איך זה עובד? 🤔</h2>

            <p>
              שלושה צעדים פשוטים ואתם בתוך האתגר
            </p>
          </div>

          <div className="steps">

            <div className="step">
              <div className="step-number">
                1
              </div>

              <h3>
                בוחרים יעד
              </h3>

              <p>
                מחליטים לאיזה יעד רוצים להגיע
                ובאיזה פרס רוצים לזכות.
              </p>
            </div>

            <div className="step">
              <div className="step-number">
                2
              </div>

              <h3>
                משתפים
              </h3>

              <p>
                שולחים למשפחה, לחברים ולמכרים
                ומזמינים אותם להיות שותפים.
              </p>
            </div>

            <div className="step">
              <div className="step-number">
                3
              </div>

              <h3>
                מגיעים וזוכים!
              </h3>

              <p>
                הגעתם ליעד?
                הפרס שבחרתם מחכה לכם!
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRIZES
      ===================================================== */}

      <section
        className="section"
        id="prizes"
      >

        <div className="container">

          <div className="section-header">

            <h2>
              🎁 הפרסים מחכים לכם!
            </h2>

            <p>
              ככל שמגיעים רחוק יותר — הפרס משתדרג.
            </p>

          </div>

          <div className="prizes">

            {PRIZES.map((prize) => (

              <div
                key={prize.id}
                className={`prize ${prize.className}`}
              >

                <div
                  className={`prize-image ${
                    prize.id === 1 ? "eretz-logo" : ""
                  }`}
                >

                  <img
                    src={prize.id === 1 ? eretzLogo : prize.image}
                    alt={prize.id === 1 ? "לוגו ארץ ציוד מחנאות" : prize.title}
                  />

                  <div className="prize-amount">
                    {prize.amount.toLocaleString("he-IL")} ₪
                  </div>

                </div>

                <div className="prize-disclaimer">
                  התמונות להמחשה בלבד.
                </div>

                <div className="prize-content">

                  <div className="prize-emoji">
                    {prize.emoji}
                  </div>

                  <h3>
                    {prize.title}
                  </h3>

                  <div className="prize-subtitle">
                    {prize.subtitle}
                  </div>

                  <div className="prize-description">
                    {prize.description}
                  </div>

                  <button
                    className="prize-button"
                    onClick={() => {
                      chooseTarget(prize.amount);
                      scrollToSection("signup");
                    }}
                  >
                    אני רוצה את הפרס הזה
                    <ArrowLeft />
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="section-header">

            <h2>
              כמה קרוב אתה לפרס? 🚀
            </h2>

            <p>
              הכנס את הסכום שכבר גייסת וראה איפה אתה נמצא.
            </p>

          </div>

          <div className="progress-wrapper">

            <Confetti active={showConfetti} />

            <input
              className="progress-input"
              type="text"
              inputMode="numeric"
              placeholder="כמה כבר גייסת? ₪"
              value={raisedInput}
              onChange={(event) =>
                setRaisedInput(event.target.value)
              }
            />

            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

            <div className="progress-labels">

              <div
                className={`progress-label ${
                  raised >= 0 ? "active" : ""
                }`}
              >
                🚀
                <span>מתחילים</span>
              </div>

              {PRIZE_AMOUNTS.map((amount) => {
                const prize = PRIZES.find((item) => item.amount === amount);
                return (
                  <div
                    key={amount}
                    className={`progress-label ${
                      raised >= amount ? "active" : ""
                    }`}
                  >
                    {prize?.emoji}
                    <span>{amount.toLocaleString("he-IL")} ₪</span>
                  </div>
                );
              })}

            </div>

            <div className="progress-message">
              {progressMessage}
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          MISSION MESSAGE
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="mission-section">

            <h2>
              זה לא רק על הפרס ❤️
            </h2>

            <div className="mission-lead">

              כל תלמיד שמצטרף הופך לשותף.
              התרומות שאתם מגייסים מאפשרות לבית המדרש
              להמשיך ללמוד, להכשיר דיינים ולהפיץ
              את משפט התורה.

            </div>

            <div className="mission-lines">

              <div className="blue">
                אתה משתף.
              </div>

              <div className="orange">
                המשפחה והחברים מצטרפים.
              </div>

              <div className="green">
                בית המדרש מתחזק.
              </div>

              <div>
                ואתה מגיע לפרס! 🎁
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="final">

            <h2>
              אז... לאיזה יעד אתה הולך? 🚀
            </h2>

            <p>
              בחר יעד, הצטרף לאתגר והתחל לשתף.
            </p>

            <button
              className="primary-btn"
              onClick={() => scrollToSection("signup")}
            >
              יאללה, אני בפנים! 🔥
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          SIGNUP
      ===================================================== */}

      <section
        className="section"
        id="signup"
      >

        <div className="container">

          <div className="section-header">

            <h2>
              מצטרפים לאתגר! 🔥
            </h2>

            <p>
              כמה פרטים קטנים — ואתה בפנים.
            </p>

          </div>

          <div className="form">

            {!submitted ? (

              <form onSubmit={submitForm}>

                <div className="form-grid">

                  <div className="field">

                    <label>
                      שם פרטי
                    </label>

                    <input
                      required
                      value={form.firstName}
                      onChange={updateField("firstName")}
                      placeholder="השם שלך"
                    />

                  </div>

                  <div className="field">

                    <label>
                      שם משפחה
                    </label>

                    <input
                      required
                      value={form.lastName}
                      onChange={updateField("lastName")}
                      placeholder="שם משפחה"
                    />

                  </div>

                </div>

                <div className="form-grid">

                  <div className="field">

                    <label>
                      כיתה
                    </label>

                    <input
                      value={form.grade}
                      onChange={updateField("grade")}
                      placeholder="לדוגמה: ח׳"
                    />

                  </div>

                  <div className="field">

                    <label>
                      מספר טלפון הורה
                    </label>

                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={updateField("phone")}
                      placeholder="050-0000000"
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    לאיזה יעד אתה מכוון?
                  </label>

                  <div className="targets">

                    {PRIZE_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`target ${
                          form.target === String(amount) ? "active" : ""
                        }`}
                        onClick={() => chooseTarget(amount)}
                      >
                        🎯
                        <br />
                        {amount.toLocaleString("he-IL")} ₪
                      </button>
                    ))}

                  </div>

                </div>

                {form.target && (
                  <div className="field">

                    <label>
                      איזה פרס תרצה לקבל ביעד הזה?
                    </label>

                    <div className="prize-choice-grid">

                      {PRIZES.filter(
                        (prize) => prize.amount === Number(form.target)
                      ).map((prize) => (

                        <button
                          key={prize.id}
                          type="button"
                          className={`prize-choice ${
                            form.selectedPrize === String(prize.id)
                              ? "active"
                              : ""
                          }`}
                          onClick={() => choosePrize(prize)}
                        >
                          <span className="prize-choice-emoji">
                            {prize.emoji}
                          </span>
                          <span>{prize.title}</span>
                        </button>

                      ))}

                    </div>

                  </div>
                )}

                <button
                  type="submit"
                  className="submit"
                >
                  🚀 יאללה, אני בפנים!
                </button>

              </form>

            ) : (

              <div className="success">

                <div className="success-icon">
                  <CheckIcon />
                </div>

                <h3>
                  נהדר, {form.firstName}! 🎉
                </h3>

                <p>
                  ב-24 שעות הקרובות יישלח למספר שהזנתם
                  <br />
                  לינק לדף התרומה הייעודי שלכם — אותו משתפים ומתקדמים 🚀
                </p>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <strong>
          אתגר תלמידי צביה הר ברכה  כולל דיינות ענב
        </strong>

        <div>
          בונים תורה • מצמיחים מנהיגות • שותפים לעולם התורה
        </div>

      </footer>

      {/* =====================================================
          STICKY MOBILE BUTTON
      ===================================================== */}

      <div
        className={`sticky ${
          showSticky ? "visible" : ""
        }`}
      >

        <button
          onClick={() => scrollToSection("signup")}
        >
          🚀 אני מצטרף לאתגר
        </button>

      </div>

    </div>
  );
}
