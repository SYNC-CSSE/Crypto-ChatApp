import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e7e3f4] px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -bottom-44 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_#d9b8ff_0%,_#efe8ff_45%,_transparent_74%)]" />
      <div className="pointer-events-none absolute left-5 top-28 h-24 w-24 rounded-full border border-[#c9bde8]" />
      <div className="pointer-events-none absolute right-5 top-24 h-20 w-20 rounded-2xl border border-[#c9bde8]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-black tracking-tight text-[#23114b]">BlockChat</div>
            <Link
              to="/login"
              className="rounded-xl bg-[#d8ef45] px-4 py-2 text-sm font-bold text-[#23114b] shadow-[0_8px_20px_rgba(180,207,35,0.35)] hover:bg-[#cae43f]"
            >
              Masuk App
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <section className="mx-auto max-w-3xl py-12 text-center sm:py-16">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#66548f]">Welcome to BlockChat</p>
            <h1 className="text-balance text-4xl font-black leading-tight text-[#251152] sm:text-5xl md:text-6xl">
              Secure Messaging
              <br />
              Made Simple
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm text-[#6e6093] sm:text-base">
              Kirim pesan dengan cepat dan aman dalam satu aplikasi yang ringan.
            </p>

            <div className="mt-9">
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl bg-[#d8ef45] px-7 py-3 text-base font-bold text-[#23114b] shadow-[0_12px_30px_rgba(180,207,35,0.35)] hover:bg-[#cae43f]"
              >
                Masuk ke App
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
