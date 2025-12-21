import { MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const iconSize = 20;
export const socialIcons = [
  {
    icon: "/stripe.svg",
    name: "Stripe",
    href: "https://donate.stripe.com/bJefZh04kfgmg5n729es002"
  },
  {
    icon: "/facebook.svg",
    name: "Facebook",
    href: "https://www.facebook.com/mingnyig",
  },
  {
    icon: "/linkedin.svg",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/nyig",
  },
  {
    icon: "/youtube.svg",
    name: "YouTube",
    href: "https://youtube.com/nyig_go",
  },
  {
    icon: "/x.svg",
    name: "X (Twitter)",
    href: "https://x.com/nyig_go",
  },
];

export default function Footer() {
  const date = new Date().getFullYear();
  return (
    <footer className="mt-10 mb-6">
      <div className="flex flex-col items-center">
        <hr className="w-full" />
        <div className="mt-1 mb-2 flex space-x-2 text-sm">
          <div>New York Institute of Go</div>
          <div>{` • `}</div>
          <div>{`© 2016 - ${date}`}</div>
          <div>{` • `}</div>
          <Link className="hover:underline" href="https://ny-go.org">
            NYIG app
          </Link>
        </div>
        <div className="mb-3 flex space-x-4">
          {socialIcons.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <Image
                src={social.icon}
                alt={social.name}
                width={iconSize}
                height={iconSize}
                className="dark:invert"
              />
            </Link>
          ))}
          <Link href="mailto:tournaments@ny-go.org">
            <MailIcon size={iconSize} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
