import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
};

const ensureMeta = (selector: string, attrs: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }

  return element;
};

const PageMeta = ({ title, description }: PageMetaProps) => {
  useEffect(() => {
    document.title = title;
    const canonicalUrl = window.location.href;

    const descriptionMeta = ensureMeta('meta[name="description"]', { name: "description" });
    descriptionMeta.setAttribute("content", description);

    const ogTitle = ensureMeta('meta[property="og:title"]', { property: "og:title" });
    ogTitle.setAttribute("content", title);

    const ogDescription = ensureMeta('meta[property="og:description"]', {
      property: "og:description",
    });
    ogDescription.setAttribute("content", description);

    const ogType = ensureMeta('meta[property="og:type"]', { property: "og:type" });
    ogType.setAttribute("content", "website");

    const ogUrl = ensureMeta('meta[property="og:url"]', { property: "og:url" });
    ogUrl.setAttribute("content", canonicalUrl);

    const twitterCard = ensureMeta('meta[name="twitter:card"]', { name: "twitter:card" });
    twitterCard.setAttribute("content", "summary_large_image");

    const twitterTitle = ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" });
    twitterTitle.setAttribute("content", title);

    const twitterDescription = ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" });
    twitterDescription.setAttribute("content", description);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute("href", canonicalUrl);
  }, [description, title]);

  return null;
};

export default PageMeta;
