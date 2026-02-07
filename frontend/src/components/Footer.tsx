"use client";

export default function Footer() {
  const links = [
    ["FAQ", "Help Center", "Account", "Media Center"],
    ["Investor Relations", "Jobs", "Ways to Watch", "Terms of Use"],
    ["Privacy", "Cookie Preferences", "Corporate Information", "Contact Us"],
    ["Speed Test", "Legal Notices", "Only on NikoFlix"],
  ];

  return (
    <footer className="w-full bg-[#141414] text-neutral-400 mt-20">
      <div className="max-w-[1100px] mx-auto px-6 py-14">

        {/* Top help text */}
        <p className="mb-6 text-sm">
          Questions? Call{" "}
          <span className="underline hover:text-white cursor-pointer">
            000-800-919-1694
          </span>
        </p>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 text-sm">
          {links.map((column, i) => (
            <div key={i} className="flex flex-col gap-3">
              {column.map((link) => (
                <span
                  key={link}
                  className="hover:text-white hover:underline cursor-pointer transition"
                >
                  {link}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Language selector */}
        <div className="mt-8">
          <button className="border border-neutral-600 px-4 py-2 text-sm hover:text-white hover:border-neutral-300 transition">
            English
          </button>
        </div>

        {/* Brand */}
        <p className="mt-6 text-xs text-neutral-500">
          NikoFlix India
        </p>
      </div>
    </footer>
  );
}
