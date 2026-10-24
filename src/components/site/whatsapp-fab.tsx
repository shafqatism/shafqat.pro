import { WhatsappIcon } from "./icons";

export function WhatsappFab({ number }: { number: string }) {
  const text = encodeURIComponent("Hi Shafqat, I found you on shafqat.pro and would like to discuss a project.");
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-xl shadow-black/20 transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
      <WhatsappIcon className="size-6" />
      <span className="hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:max-w-40 sm:inline-block">Chat on WhatsApp</span>
    </a>
  );
}
