// This is your config file, place any global data here.
// You can import this data from anywhere in your site by using the `import` keyword.

type Config = {
  title: string;
  description: string;
  lang: string;
  profile: {
    author: string;
    description?: string;
  }
}

type SocialLink = {
  icon: string;
  friendlyName: string; // for accessibility
  link: string;
}

export const siteConfig: Config = {
  title: "Neonode.cc - Mind space blog",
  description: "",
  lang: "ru-RU",
  profile: {
    author: "TrustMe",
    description: "Digital content creater"
  }
}

/** 
  These are you social media links. 
  It uses https://github.com/natemoo-re/astro-icon#readme
  You can find icons @ https://icones.js.org/
*/
export const socialLinks: Array<SocialLink> = [
  {
    icon: "mdi:github",
    friendlyName: "Github",
    link: "https://github.com/dignezzz",
  },
 {
    icon: "mdi:telegram",
    friendlyName: "Telegram",
    link: "https://t.me/+cFdHT8DiMUA2MWVi",
  },
 /**   {
    icon: "mdi:email",
    friendlyName: "email",
    link: "mailto:ndangamy@gmail.com",
  },*/
  {
    icon: "mdi:rss",
    friendlyName: "rss",
    link: "/rss.xml"
  }
];

export const NAV_LINKS: Array<{ title: string, path: string }> = [
  {
    title: "Main",
    path: "/",
  },
  {
    title: "Blog",
    path: "/blog",
  },
  {
    title: "Аrchive",
    path: '/archive'
  },
  {
    title: "My Projects",
    path: '/projects'
  }
];
