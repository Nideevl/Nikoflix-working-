  "use client";

  import { useState, useEffect } from "react";
  import Link from "next/link";
  import { Menu, X } from "lucide-react";
  import Image from "next/image";
  import { usePathname, useSearchParams } from "next/navigation";
  import SearchBox from "./SearchBox";
  import ProfileMenu from "./ProfileMenu";


  export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const type = searchParams.get("type");
    const isOverlayOpen = !!searchParams.get("open");

    useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 40);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <header
        className={`fixed top-0 w-full z-50 duration-300 transition-all ${isOverlayOpen || scrolled
            ? "bg-black"
            : "bg-gradient-to-b from-[rgba(0,0,0,0.5)] from-10% to-transparent"
          }`}
        role="navigation"
      >

        <div className="flex items-center justify-between px-9 h-17">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-8 pl-7">

            {/* LOGO (Netflix style, not text) */}
            <Link href="/browse" className="flex items-center pr-5 pt-1">

              <Image
                src="/logo.svg"
                alt="NIKOFLIX"
                width={100}
                height={20}
                className="h-6 w-auto logo-img -ml-[3px]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <span className="logo-text text-red-600 text-2xl font-extrabold tracking-wide">
                NikoFlix
              </span>

            </Link>



            {/* PRIMARY NAVIGATION */}
            <ul
              className="hidden md:flex gap-6 text-sm"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {[
                { name: "Home", href: "/browse", match: () => pathname === "/browse" && !type },
                { name: "Series", href: "/browse/series", match: () => type === "series" },
                { name: "Movies", href: "/browse/movies", match: () => type === "movies" },
                { name: "New & Popular", href: "/latest", match: () => pathname === "/latest" },
                { name: "My List", href: "/my-list", match: () => pathname === "/my-list" },
                { name: "Watch History", href: "/my-list", match: () => pathname === "/my-list" },
              ].map((item) => {
                const isActive = item.match();

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`relative transition-all duration-300 nav-stroke
        ${isActive
                          ? "text-white after:w-full after:bg-red-600"
                          : "text-gray-300 hover:text-white"
                        }
        after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 
        after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full
      `}
                    >
                      {item.name}
                    </Link>

                  </li>
                );
              })}
            </ul>


          </div>

          {/* RIGHT SIDE (SECONDARY NAVIGATION) */}
          <div className="flex items-center">

            <div className="pr-5"> {/* Added padding wrapper */}
              <SearchBox />
            </div>

            {/* NOTIFICATIONS */}
            <button className="text-white pr-7"> {/* Added padding and hover */}
              <Image
                src="/bellIcon.svg"
                width={20}
                height={20}
                alt="notification"
              />
            </button>

            {/* PROFILE */}
            <ProfileMenu />

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileOpen && (
          <div className="md:hidden bg-black border-t border-gray-800 px-6 py-4 space-y-4 text-gray-300">
            <Link href="/browse" className="block hover:text-white">Home</Link>
            <Link href="/browse/series" className="block hover:text-white">Shows</Link>
            <Link href="/browse/movies" className="block hover:text-white">Movies</Link>
            <Link href="/browse/my-list" className="block hover:text-white">My List</Link>
          </div>
        )}
      </header>
    );
  }
