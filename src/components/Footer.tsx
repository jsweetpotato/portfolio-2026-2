const links = [
  { text: "notion", ariaText: "Notion 블로그", href: "https://resonant-kitchen-b1b.notion.site/4235a6d823fd41658ade513836ea9b52?v=060f694d23f742d7b53a9add5d19fe95&source=copy_link" },
  { text: "github", ariaText: "GitHub 프로필", href: "https://github.com/jsweetpotato" }
];

export default function Footer() {
  return (
    <footer className="fixed w-full px-[4vw] flex justify-between bottom-[5vh]  font-small ">
      <p>ⓒ Jisu Kim 2026 </p>

      <div className="flex gap-2">
        {links.map(({ text, ariaText, href }) => {
          return (
            <a
              className="hover:text-orange-100 focus-visible:text-orange-100 focus-visible:outline-orange-200  focus-visible:outline-offset-4 transition-colors duration-75 "
              href={href}
              target="_blank"
              rel="noopener noreferrer">
              [ {text} ]<span className="sr-only">{ariaText}</span>
            </a>
          );
        })}
      </div>
    </footer>
  );
}
